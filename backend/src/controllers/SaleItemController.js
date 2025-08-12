const SaleItem = require("../models/SaleItem");
const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

class SaleItemController {
  // GET - Get all items from a specific sale
  async getItemsBySale(req, res) {
    try {
      const { saleId } = req.params;
      console.log(`📦 GET /api/sale-items/sale/${saleId}`);

      // Verificar que la venta existe
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        return res.status(404).json({
          status: "error",
          message: "Venta no encontrada",
        });
      }

      const items = await SaleItem.findAll({
        where: { venta_id: saleId },
        include: [
          {
            model: Product,
            as: "producto",
            attributes: [
              "id",
              "nombre",
              "fragancia",
              "marca",
              "presentacion",
              "precio",
              "precio_venta",
              "stock",
              "activo",
            ],
            required: false, // LEFT JOIN para evitar errores si el producto fue eliminado
          },
        ],
        order: [["id", "ASC"]],
      });

      console.log(`✅ Items encontrados: ${items.length}`);

      res.json({
        status: "success",
        data: {
          venta_numero: sale.numero_venta,
          items: items,
        },
      });
    } catch (error) {
      console.error(`❌ Error en getItemsBySale(${req.params.saleId}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting sale items",
        error: error.message,
      });
    }
  }

  // GET - Get specific item
  async getItem(req, res) {
    try {
      const { id } = req.params;
      console.log(`📦 GET /api/sale-items/${id}`);

      const item = await SaleItem.findByPk(id, {
        include: [
          {
            model: Sale,
            as: "venta",
            attributes: ["id", "numero_venta", "fecha", "estado_venta"],
          },
          {
            model: Product,
            as: "producto",
            attributes: [
              "id",
              "nombre",
              "fragancia",
              "marca",
              "presentacion",
              "precio",
              "precio_venta",
              "activo",
            ],
            required: false,
          },
        ],
      });

      if (!item) {
        return res.status(404).json({
          status: "error",
          message: "Item no encontrado",
        });
      }

      console.log(
        `✅ Item encontrado: Producto ${
          item.producto?.nombre || item.producto?.fragancia || item.producto_id
        }`
      );

      res.json({
        status: "success",
        data: item,
      });
    } catch (error) {
      console.error(`❌ Error en getItem(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting item",
        error: error.message,
      });
    }
  }

  // POST - Add item to existing sale
  async addItemToSale(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { saleId } = req.params;
      const {
        producto_id,
        cantidad,
        precio_unitario,
        descuento_porcentaje = 0,
      } = req.body;

      console.log(`📦 POST /api/sale-items/sale/${saleId} - Datos:`, req.body);

      // Verificar que la venta existe y se puede editar
      const sale = await Sale.findByPk(saleId);
      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Venta no encontrada",
        });
      }

      if (!sale.canBeEdited()) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "No se puede modificar una venta cancelada o completamente finalizada (entregada y pagada)",
        });
      }

      // Verificar producto y stock
      const product = await Product.findByPk(producto_id);
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: `Producto ${producto_id} no encontrado`,
        });
      }

      if (!product.activo) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `Producto ${
            product.nombre || product.fragancia
          } está inactivo`,
        });
      }

      if (product.stock < cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `Stock insuficiente para ${
            product.nombre || product.fragancia
          }. Disponible: ${product.stock}`,
        });
      }

      // Verificar si el producto ya está en la venta
      const existingItem = await SaleItem.findOne({
        where: {
          venta_id: saleId,
          producto_id: producto_id,
        },
      });

      if (existingItem) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "El producto ya está en esta venta. Use el endpoint de actualización.",
        });
      }

      // Calcular precios
      const final_precio_unitario =
        precio_unitario || product.precio_venta || product.precio;
      const descuento_monto =
        (final_precio_unitario * descuento_porcentaje) / 100;
      const precio_con_descuento = final_precio_unitario - descuento_monto;
      const subtotal = precio_con_descuento * cantidad;

      // Crear el item
      const newItem = await SaleItem.create(
        {
          venta_id: saleId,
          producto_id,
          cantidad,
          precio_unitario: final_precio_unitario,
          descuento_porcentaje,
          descuento_monto,
          precio_con_descuento,
          subtotal,
        },
        { transaction }
      );

      // Actualizar stock
      await Product.decrement("stock", {
        by: cantidad,
        where: { id: producto_id },
        transaction,
      });

      // Actualizar totales de la venta
      const allItems = await SaleItem.findAll({
        where: { venta_id: saleId },
        transaction,
      });

      let new_subtotal = 0;
      let new_descuento_total = 0;

      for (const item of allItems) {
        new_subtotal += item.precio_unitario * item.cantidad;
        new_descuento_total += item.descuento_monto * item.cantidad;
      }

      await sale.update(
        {
          subtotal: new_subtotal,
          descuento_total: new_descuento_total,
        },
        { transaction }
      );

      await transaction.commit();

      // Obtener el item con relaciones
      const itemComplete = await SaleItem.findByPk(newItem.id, {
        include: [
          {
            model: Product,
            as: "producto",
            attributes: ["id", "nombre", "fragancia", "marca", "presentacion"],
          },
        ],
      });

      console.log(`✅ Item agregado a venta ${sale.numero_venta}`);

      res.status(201).json({
        status: "success",
        message: "Item agregado exitosamente",
        data: itemComplete,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error en addItemToSale(${req.params.saleId}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error adding item to sale",
        error: error.message,
      });
    }
  }

  // PUT - Update item quantity or discount
  async updateItem(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { cantidad, descuento_porcentaje, precio_unitario } = req.body;

      console.log(`📦 PUT /api/sale-items/${id} - Datos:`, req.body);

      const item = await SaleItem.findByPk(id, {
        include: [
          {
            model: Sale,
            as: "venta",
          },
          {
            model: Product,
            as: "producto",
          },
        ],
      });

      if (!item) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Item no encontrado",
        });
      }

      // Verificar si la venta se puede editar
      if (!item.venta.canBeEdited()) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "No se puede modificar una venta cancelada o completamente finalizada (entregada y pagada)",
        });
      }

      // Verificar que el producto aún existe y está activo
      if (!item.producto) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "El producto asociado ya no existe",
        });
      }

      if (!item.producto.activo) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `El producto ${
            item.producto.nombre || item.producto.fragancia
          } está inactivo`,
        });
      }

      // Si cambia la cantidad, verificar stock
      if (cantidad && cantidad !== item.cantidad) {
        const diferencia = cantidad - item.cantidad;

        if (diferencia > 0) {
          // Se está aumentando la cantidad, verificar stock
          if (item.producto.stock < diferencia) {
            await transaction.rollback();
            return res.status(400).json({
              status: "error",
              message: `Stock insuficiente para ${
                item.producto.nombre || item.producto.fragancia
              }. Disponible: ${item.producto.stock}`,
            });
          }
          // Reducir stock
          await Product.decrement("stock", {
            by: diferencia,
            where: { id: item.producto_id },
            transaction,
          });
        } else {
          // Se está reduciendo la cantidad, devolver stock
          await Product.increment("stock", {
            by: Math.abs(diferencia),
            where: { id: item.producto_id },
            transaction,
          });
        }
      }

      // Actualizar item
      const updateData = {};
      if (cantidad !== undefined) updateData.cantidad = cantidad;
      if (descuento_porcentaje !== undefined)
        updateData.descuento_porcentaje = descuento_porcentaje;
      if (precio_unitario !== undefined)
        updateData.precio_unitario = precio_unitario;

      await item.update(updateData, { transaction });

      // Actualizar totales de la venta
      const allItems = await SaleItem.findAll({
        where: { venta_id: item.venta_id },
        transaction,
      });

      let new_subtotal = 0;
      let new_descuento_total = 0;

      for (const saleItem of allItems) {
        new_subtotal += saleItem.precio_unitario * saleItem.cantidad;
        new_descuento_total += saleItem.descuento_monto * saleItem.cantidad;
      }

      await Sale.update(
        {
          subtotal: new_subtotal,
          descuento_total: new_descuento_total,
        },
        {
          where: { id: item.venta_id },
          transaction,
        }
      );

      await transaction.commit();

      // Obtener el item actualizado
      const updatedItem = await SaleItem.findByPk(id, {
        include: [
          {
            model: Product,
            as: "producto",
            attributes: ["id", "nombre", "fragancia", "marca", "presentacion"],
          },
        ],
      });

      console.log(`✅ Item actualizado en venta ${item.venta.numero_venta}`);

      res.json({
        status: "success",
        message: "Item actualizado exitosamente",
        data: updatedItem,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error en updateItem(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating item",
        error: error.message,
      });
    }
  }

  // DELETE - Remove item from sale
  async deleteItem(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      console.log(`📦 DELETE /api/sale-items/${id}`);

      const item = await SaleItem.findByPk(id, {
        include: [
          {
            model: Sale,
            as: "venta",
          },
          {
            model: Product,
            as: "producto",
          },
        ],
      });

      if (!item) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Item no encontrado",
        });
      }

      // Verificar si la venta se puede editar
      if (!item.venta.canBeEdited()) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "No se puede modificar una venta cancelada o completamente finalizada (entregada y pagada)",
        });
      }

      // Verificar que no sea el último item de la venta
      const itemCount = await SaleItem.count({
        where: { venta_id: item.venta_id },
      });

      if (itemCount === 1) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "No se puede eliminar el último item. Elimine la venta completa.",
        });
      }

      // Restaurar stock solo si el producto aún existe
      if (item.producto) {
        await Product.increment("stock", {
          by: item.cantidad,
          where: { id: item.producto_id },
          transaction,
        });
      }

      // Eliminar el item
      await item.destroy({ transaction });

      // Actualizar totales de la venta
      const remainingItems = await SaleItem.findAll({
        where: { venta_id: item.venta_id },
        transaction,
      });

      let new_subtotal = 0;
      let new_descuento_total = 0;

      for (const remainingItem of remainingItems) {
        new_subtotal += remainingItem.precio_unitario * remainingItem.cantidad;
        new_descuento_total +=
          remainingItem.descuento_monto * remainingItem.cantidad;
      }

      await Sale.update(
        {
          subtotal: new_subtotal,
          descuento_total: new_descuento_total,
        },
        {
          where: { id: item.venta_id },
          transaction,
        }
      );

      await transaction.commit();

      console.log(`✅ Item eliminado de venta ${item.venta.numero_venta}`);

      res.json({
        status: "success",
        message: "Item eliminado exitosamente",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error en deleteItem(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error deleting item",
        error: error.message,
      });
    }
  }

  // GET - Get items by product (for product sales history)
  async getItemsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 50, fecha_desde, fecha_hasta } = req.query;

      console.log(`📦 GET /api/sale-items/product/${productId}`);

      const offset = (page - 1) * limit;

      // Construir condiciones
      const whereConditions = { producto_id: productId };
      const saleWhereConditions = {};

      if (fecha_desde || fecha_hasta) {
        saleWhereConditions.fecha = {};
        if (fecha_desde)
          saleWhereConditions.fecha[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta)
          saleWhereConditions.fecha[Op.lte] = new Date(
            fecha_hasta + " 23:59:59"
          );
      }

      const items = await SaleItem.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: Sale,
            as: "venta",
            where: saleWhereConditions,
            attributes: ["id", "numero_venta", "fecha", "estado_venta"],
            include: [
              {
                model: Customer,
                as: "cliente",
                attributes: ["id", "nombre", "apellido"],
              },
            ],
          },
        ],
        order: [[{ model: Sale, as: "venta" }, "fecha", "DESC"]],
      });

      console.log(`✅ Ventas del producto encontradas: ${items.count}`);

      res.json({
        status: "success",
        data: {
          items: items.rows,
          pagination: {
            total: items.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(items.count / limit),
          },
        },
      });
    } catch (error) {
      console.error(
        `❌ Error en getItemsByProduct(${req.params.productId}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error getting product sales",
        error: error.message,
      });
    }
  }

  // GET - Best selling products
  async getBestSellingProducts(req, res) {
    try {
      const { limit = 10, fecha_desde, fecha_hasta } = req.query;

      console.log("📦 GET /api/sale-items/best-sellers");

      let dateFilter = "";
      const replacements = { limit: parseInt(limit) };

      if (fecha_desde || fecha_hasta) {
        dateFilter = "WHERE s.fecha BETWEEN :fecha_desde AND :fecha_hasta";
        replacements.fecha_desde = fecha_desde || "1900-01-01";
        replacements.fecha_hasta = fecha_hasta
          ? fecha_hasta + " 23:59:59"
          : "2100-12-31 23:59:59";
      }

      const query = `
        SELECT 
          si.producto_id,
          COALESCE(p.nombre, p.fragancia, CONCAT('Producto ID: ', si.producto_id)) as nombre,
          p.marca,
          p.presentacion,
          SUM(si.cantidad) as total_vendido,
          COUNT(DISTINCT si.venta_id) as veces_vendido,
          SUM(si.subtotal) as ingresos_totales
        FROM sale_items si
        INNER JOIN sales s ON si.venta_id = s.id
        LEFT JOIN products p ON si.producto_id = p.id
        ${dateFilter}
        GROUP BY si.producto_id, p.nombre, p.fragancia, p.marca, p.presentacion
        ORDER BY total_vendido DESC
        LIMIT :limit
      `;

      const bestSellers = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(`✅ Productos más vendidos: ${bestSellers.length}`);

      res.json({
        status: "success",
        data: bestSellers,
      });
    } catch (error) {
      console.error("❌ Error en getBestSellingProducts:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting best selling products",
        error: error.message,
      });
    }
  }
}

module.exports = new SaleItemController();
