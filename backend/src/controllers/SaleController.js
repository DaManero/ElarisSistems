const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const User = require("../models/User");
const PaymentMethod = require("../models/PaymentMethod");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

class SaleController {
  // GET - Get all sales with filters
  async getSales(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        search = "",
        cliente_id,
        usuario_id,
        estado_venta,
        estado_pago,
        metodo_pago_id,
        fecha_desde,
        fecha_hasta,
      } = req.query;

      console.log("💰 GET /api/sales - Parámetros:", req.query);

      // Construir condiciones de búsqueda
      const whereConditions = {};

      // Filtros específicos
      if (cliente_id && cliente_id !== "all")
        whereConditions.cliente_id = cliente_id;
      if (usuario_id && usuario_id !== "all")
        whereConditions.usuario_id = usuario_id;
      if (estado_venta && estado_venta !== "all")
        whereConditions.estado_venta = estado_venta;
      if (estado_pago && estado_pago !== "all")
        whereConditions.estado_pago = estado_pago;
      if (metodo_pago_id && metodo_pago_id !== "all")
        whereConditions.metodo_pago_id = metodo_pago_id;

      // Filtro por rango de fechas
      if (fecha_desde || fecha_hasta) {
        whereConditions.fecha = {};
        if (fecha_desde) whereConditions.fecha[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta)
          whereConditions.fecha[Op.lte] = new Date(fecha_hasta + " 23:59:59");
      }

      // Filtro por búsqueda de texto (número de venta)
      if (search.trim()) {
        whereConditions.numero_venta = {
          [Op.like]: `%${search.trim()}%`,
        };
      }

      // Paginación
      const offset = (page - 1) * limit;

      const sales = await Sale.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["fecha", "DESC"],
          ["numero_venta", "DESC"],
        ],
        include: [
          {
            model: Customer,
            as: "cliente",
            attributes: [
              "id",
              "nombre",
              "apellido",
              "telefono",
              "tipo_cliente",
            ],
          },
          {
            model: User,
            as: "usuario",
            attributes: ["id", "first_name", "last_name"],
          },
          {
            model: PaymentMethod,
            as: "metodoPago",
            attributes: ["id", "nombre", "requiere_referencia"],
          },
          {
            model: SaleItem,
            as: "items",
            attributes: [
              "id",
              "producto_id",
              "cantidad",
              "precio_unitario",
              "descuento_porcentaje",
              "subtotal",
            ],
            // ✅ CORRECCIÓN: Campos que realmente existen en el modelo Product
            include: [
              {
                model: Product,
                as: "producto", // Ajusta según tu asociación
                attributes: [
                  "id",
                  "fragancia", // Campo principal del producto
                  "caracteristicas",
                  "imagen",
                  "categoria_id",
                  "medida_id",
                  "proveedor_id",
                  "stock",
                  "stock_minimo",
                  "precio_venta",
                  "status",
                ],
              },
            ],
          },
        ],
      });

      console.log(`✅ Ventas encontradas: ${sales.count}`);

      res.json({
        status: "success",
        data: {
          sales: sales.rows,
          pagination: {
            total: sales.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(sales.count / limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error en getSales:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting sales",
        error: error.message,
      });
    }
  }

  // GET - Get sale by ID with all details - USANDO CONSULTA MANUAL
  async getSale(req, res) {
    try {
      const { id } = req.params;
      console.log(`💰 GET /api/sales/${id}`);

      // Consulta manual con SQL raw para asegurar que funcione
      const rawQuery = `
      SELECT 
        s.id as venta_id,
        s.numero_venta,
        s.fecha,
        s.cliente_id,
        s.usuario_id,
        s.metodo_pago_id,
        s.subtotal,
        s.descuento_total,
        s.costo_envio,
        s.total,
        s.estado_venta,
        s.estado_pago,
        s.observaciones,
        s.referencia_pago,
        si.id as item_id,
        si.producto_id,
        si.cantidad,
        si.precio_unitario,
        si.descuento_porcentaje,
        si.descuento_monto,
        si.precio_con_descuento,
        si.subtotal as item_subtotal,
        p.id as producto_id_real,
        p.fragancia as producto_nombre,
        p.fragancia as producto_fragancia,
        p.caracteristicas as producto_caracteristicas,
        p.imagen as producto_imagen,
        p.categoria_id as producto_categoria_id,
        p.medida_id as producto_medida_id,
        p.proveedor_id as producto_proveedor_id,
        p.stock as producto_stock,
        p.stock_minimo as producto_stock_minimo,
        p.precio_venta as producto_precio_venta,
        p.status as producto_activo
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.venta_id
      LEFT JOIN products p ON si.producto_id = p.id
      WHERE s.id = :saleId
      ORDER BY si.id ASC
    `;

      const results = await sequelize.query(rawQuery, {
        replacements: { saleId: id },
        type: sequelize.QueryTypes.SELECT,
      });

      console.log(`🔍 Consulta manual encontró ${results.length} filas`);

      if (results.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Venta no encontrada",
        });
      }

      // Procesar resultados para crear la estructura de respuesta
      const firstRow = results[0];

      // Construir objeto de venta
      const sale = {
        id: firstRow.venta_id,
        numero_venta: firstRow.numero_venta,
        fecha: firstRow.fecha,
        cliente_id: firstRow.cliente_id,
        usuario_id: firstRow.usuario_id,
        metodo_pago_id: firstRow.metodo_pago_id,
        subtotal: parseFloat(firstRow.subtotal || 0),
        descuento_total: parseFloat(firstRow.descuento_total || 0),
        costo_envio: parseFloat(firstRow.costo_envio || 0),
        total: parseFloat(firstRow.total || 0),
        estado_venta: firstRow.estado_venta,
        estado_pago: firstRow.estado_pago,
        observaciones: firstRow.observaciones,
        referencia_pago: firstRow.referencia_pago,
        items: [],
      };

      // Procesar items
      const items = results
        .filter((row) => row.item_id !== null) // Solo filas que tienen items
        .map((row) => ({
          id: row.item_id,
          venta_id: row.venta_id,
          producto_id: row.producto_id,
          cantidad: parseInt(row.cantidad || 0),
          precio_unitario: parseFloat(row.precio_unitario || 0),
          descuento_porcentaje: parseFloat(row.descuento_porcentaje || 0),
          descuento_monto: parseFloat(row.descuento_monto || 0),
          precio_con_descuento: parseFloat(row.precio_con_descuento || 0),
          subtotal: parseFloat(row.item_subtotal || 0),
          // ✅ OBJETO PRODUCTO COMPLETO con campos reales del modelo
          producto: {
            id: row.producto_id,
            nombre: row.producto_nombre, // fragancia como nombre principal
            fragancia: row.producto_fragancia,
            caracteristicas: row.producto_caracteristicas,
            imagen: row.producto_imagen,
            categoria_id: row.producto_categoria_id,
            medida_id: row.producto_medida_id,
            proveedor_id: row.producto_proveedor_id,
            stock: parseInt(row.producto_stock || 0),
            stock_minimo: parseInt(row.producto_stock_minimo || 0),
            precio_venta: parseFloat(row.producto_precio_venta || 0),
            activo: row.producto_activo,
          },
        }));

      sale.items = items;

      console.log(
        `✅ Venta procesada: ${sale.numero_venta} con ${items.length} items`
      );

      // Cargar datos relacionados por separado
      try {
        const [cliente, usuario, metodoPago] = await Promise.all([
          Customer.findByPk(sale.cliente_id, {
            attributes: [
              "id",
              "nombre",
              "apellido",
              "telefono",
              "email",
              "direccion",
              "tipo_cliente",
            ],
          }),
          User.findByPk(sale.usuario_id, {
            attributes: ["id", "first_name", "last_name", "email"],
          }),
          PaymentMethod.findByPk(sale.metodo_pago_id, {
            attributes: ["id", "nombre", "requiere_referencia"],
          }),
        ]);

        sale.cliente = cliente;
        sale.usuario = usuario;
        sale.metodoPago = metodoPago;
      } catch (relationError) {
        console.warn("⚠️ Error cargando relaciones:", relationError.message);
      }

      res.json({
        status: "success",
        data: sale,
      });
    } catch (error) {
      console.error(`❌ Error en getSale(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo venta",
        error: error.message,
      });
    }
  }

  // POST - Validate products before creating sale
  async validateProducts(req, res) {
    try {
      const { product_ids } = req.body;

      if (!product_ids || !Array.isArray(product_ids)) {
        return res.status(400).json({
          status: "error",
          message: "Se requiere un array de product_ids",
        });
      }

      const products = await Product.findAll({
        where: {
          id: product_ids,
          status: true, // CORREGIDO: usar 'status' en lugar de 'activo'
        },
        attributes: [
          "id",
          "fragancia", // Campo principal
          "stock",
          "precio_venta",
          "status",
        ],
      });

      const foundIds = products.map((p) => p.id);
      const missingIds = product_ids.filter(
        (id) => !foundIds.includes(parseInt(id))
      );

      console.log(
        `✅ Productos validados: ${foundIds.length}/${product_ids.length}`
      );

      res.json({
        status: "success",
        data: {
          valid_products: products,
          invalid_product_ids: missingIds,
          all_valid: missingIds.length === 0,
        },
      });
    } catch (error) {
      console.error("❌ Error en validateProducts:", error);
      res.status(500).json({
        status: "error",
        message: "Error validating products",
        error: error.message,
      });
    }
  }

  // POST - Create new sale
  async createSale(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        cliente_id,
        usuario_id,
        metodo_pago_id,
        referencia_pago,
        costo_envio = 0,
        observaciones,
        items,
        // 🛠️ AGREGAR ESTADOS DEL FRONTEND
        estado_venta,
        estado_pago,
      } = req.body;

      console.log("💰 POST /api/sales - Datos:", {
        ...req.body,
        items: items?.length + " items",
      });

      // 🔍 DEBUG: Log de los estados recibidos
      console.log("🔍 Estados recibidos del frontend:", {
        estado_venta,
        estado_pago,
      });

      // Validaciones básicas
      if (!cliente_id) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "El cliente es obligatorio",
        });
      }

      if (!metodo_pago_id) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "El método de pago es obligatorio",
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Debe agregar al menos un producto a la venta",
        });
      }

      // ... resto del código de validaciones permanece igual ...
      // (verificar productos, stock, etc.)

      // Verificar que todos los IDs de productos son válidos
      const productIds = items
        .map((item) => item.producto_id)
        .filter((id) => id != null);
      const uniqueProductIds = [...new Set(productIds)];

      if (productIds.length !== items.length) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Todos los items deben tener un producto_id válido",
        });
      }

      // Verificar cliente existe y está activo
      const customer = await Customer.findByPk(cliente_id);
      if (!customer || !customer.status) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Cliente no encontrado o inactivo",
        });
      }

      // Verificar método de pago
      const paymentMethod = await PaymentMethod.findByPk(metodo_pago_id);
      if (!paymentMethod || !paymentMethod.activo) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Método de pago no encontrado o inactivo",
        });
      }

      // Verificar si necesita referencia
      if (paymentMethod.requiere_referencia && !referencia_pago) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `El método de pago ${paymentMethod.nombre} requiere una referencia`,
        });
      }

      // Verificar todos los productos de una vez
      const products = await Product.findAll({
        where: {
          id: uniqueProductIds,
          status: true,
        },
      });

      // Crear un mapa para acceso rápido
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Verificar que todos los productos existen y están activos
      const invalidProducts = [];
      for (const item of items) {
        const product = productMap.get(item.producto_id);
        if (!product) {
          invalidProducts.push(item.producto_id);
        }
      }

      if (invalidProducts.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `Los siguientes productos no están disponibles: ${invalidProducts.join(
            ", "
          )}`,
          invalid_products: invalidProducts,
        });
      }

      // Verificar stock y calcular totales
      let subtotal = 0;
      let descuento_total = 0;
      const itemsToCreate = [];
      const stockErrors = [];

      for (const item of items) {
        const product = productMap.get(item.producto_id);

        // Verificar stock
        if (product.stock < item.cantidad) {
          stockErrors.push({
            producto: product.fragancia,
            solicitado: item.cantidad,
            disponible: product.stock,
          });
          continue;
        }

        // Calcular precios
        const precio_unitario =
          item.precio_unitario || product.precio_venta || 0;
        const descuento_porcentaje = item.descuento_porcentaje || 0;
        const descuento_monto = (precio_unitario * descuento_porcentaje) / 100;
        const precio_con_descuento = precio_unitario - descuento_monto;
        const item_subtotal = precio_con_descuento * item.cantidad;

        subtotal += precio_unitario * item.cantidad;
        descuento_total += descuento_monto * item.cantidad;

        itemsToCreate.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: precio_unitario,
          descuento_porcentaje: descuento_porcentaje,
          descuento_monto: descuento_monto,
          precio_con_descuento: precio_con_descuento,
          subtotal: item_subtotal,
        });
      }

      // Si hay errores de stock, reportarlos todos juntos
      if (stockErrors.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Stock insuficiente para algunos productos",
          stock_errors: stockErrors,
        });
      }

      // Crear la venta
      const total = subtotal - descuento_total + parseFloat(costo_envio);

      // Generar número de venta
      let numero_venta;
      try {
        numero_venta = await Sale.generateSaleNumber();
      } catch (error) {
        console.warn(
          "⚠️ Error usando Sale.generateSaleNumber(), generando manualmente:",
          error.message
        );

        // Fallback: generar número manualmente
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();

        // Buscar la última venta para obtener el siguiente número
        const lastSale = await Sale.findOne({
          order: [["id", "DESC"]],
          transaction,
        });

        let nextNumber = 1;
        if (lastSale && lastSale.numero_venta) {
          const parts = lastSale.numero_venta.split("-");
          if (parts.length === 3) {
            const lastNumber = parseInt(parts[2]);
            if (!isNaN(lastNumber)) {
              nextNumber = lastNumber + 1;
            }
          }
        }

        numero_venta = `VTA-${month}${year}-${String(nextNumber).padStart(
          6,
          "0"
        )}`;
        console.log(`✅ Número de venta generado manualmente: ${numero_venta}`);
      }

      // 🛠️ USAR LOS ESTADOS DEL FRONTEND EN LUGAR DE HARDCODEAR
      const final_estado_venta = estado_venta || "En proceso";
      const final_estado_pago = estado_pago || "Pendiente";

      console.log("🔍 Estados finales para crear la venta:", {
        final_estado_venta,
        final_estado_pago,
      });

      const newSale = await Sale.create(
        {
          numero_venta,
          cliente_id,
          usuario_id: usuario_id || req.user?.id || 1,
          metodo_pago_id,
          referencia_pago,
          subtotal,
          descuento_total,
          costo_envio: parseFloat(costo_envio),
          total,
          observaciones,
          // 🛠️ CORRECCIÓN: USAR VALORES DEL FRONTEND
          estado_venta: final_estado_venta,
          estado_pago: final_estado_pago,
        },
        { transaction }
      );

      // Crear los items de la venta
      for (const itemData of itemsToCreate) {
        await SaleItem.create(
          {
            venta_id: newSale.id,
            ...itemData,
          },
          { transaction }
        );

        // Actualizar stock del producto
        await Product.decrement("stock", {
          by: itemData.cantidad,
          where: { id: itemData.producto_id },
          transaction,
        });
      }

      await transaction.commit();

      console.log(
        `✅ Venta creada: ${newSale.numero_venta} - Estados: ${final_estado_venta}/${final_estado_pago}`
      );

      // 🔍 DEBUG: Verificar los estados guardados
      console.log("🔍 Venta creada con estados:", {
        id: newSale.id,
        numero_venta: newSale.numero_venta,
        estado_venta: newSale.estado_venta,
        estado_pago: newSale.estado_pago,
      });

      res.status(201).json({
        status: "success",
        message: "Venta creada exitosamente",
        data: newSale,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error en createSale:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          status: "error",
          message: "Error de referencia: algunos datos no existen",
          error: error.message,
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Error interno",
      });
    }
  }
  // PUT - Update sale
  async updateSale(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const {
        cliente_id,
        metodo_pago_id,
        referencia_pago,
        costo_envio,
        estado_venta,
        estado_pago,
        observaciones,
        items,
        // 🔧 NUEVOS FLAGS PARA MODO EDICIÓN
        _isUpdate,
        _skipStockValidation,
        _editMode,
        _originalSaleId,
      } = req.body;

      console.log(`💰 PUT /api/sales/${id} - Datos:`, {
        ...req.body,
        items: items?.length + " items",
        isEditMode: _isUpdate || _editMode || _skipStockValidation, // ✅ Log del modo
      });

      const sale = await Sale.findByPk(id);
      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Sale not found",
        });
      }

      // 🔧 DETECTAR MODO EDICIÓN
      const isEditMode = _isUpdate || _editMode || _skipStockValidation;

      if (isEditMode) {
        console.log("🔄 MODO EDICIÓN DETECTADO - Saltando validación de stock");
      }

      // Si se actualizan los items, procesar cambios de stock
      if (items && Array.isArray(items)) {
        // Obtener items actuales
        const currentItems = await SaleItem.findAll({
          where: { venta_id: id },
          transaction,
        });

        // ✅ SOLO EN MODO EDICIÓN: Restaurar stock de items actuales
        if (isEditMode) {
          console.log(
            "🔄 Restaurando stock de items existentes (modo edición)"
          );
          for (const currentItem of currentItems) {
            await Product.increment("stock", {
              by: currentItem.cantidad,
              where: { id: currentItem.producto_id },
              transaction,
            });
          }
        }

        // Eliminar items actuales
        await SaleItem.destroy({
          where: { venta_id: id },
          transaction,
        });

        // Crear nuevos items
        let subtotal = 0;
        let descuento_total = 0;

        for (const item of items) {
          const product = await Product.findByPk(item.producto_id);
          if (!product || !product.status) {
            await transaction.rollback();
            return res.status(400).json({
              status: "error",
              message: `Producto ${item.producto_id} no encontrado o inactivo`,
            });
          }

          // 🔧 VALIDACIÓN DE STOCK CONDICIONAL
          if (!isEditMode) {
            // Solo validar stock si NO es modo edición
            if (product.stock < item.cantidad) {
              await transaction.rollback();
              return res.status(400).json({
                status: "error",
                message: `Stock insuficiente para ${product.fragancia}. Disponible: ${product.stock}`,
                stock_errors: [
                  {
                    producto: product.fragancia,
                    solicitado: item.cantidad,
                    disponible: product.stock,
                  },
                ],
              });
            }
          } else {
            console.log(
              `🔄 Saltando validación de stock para ${product.fragancia} (modo edición)`
            );
          }

          // Calcular precios
          const precio_unitario =
            item.precio_unitario || product.precio_venta || 0;
          const descuento_porcentaje = item.descuento_porcentaje || 0;
          const descuento_monto =
            (precio_unitario * descuento_porcentaje) / 100;
          const precio_con_descuento = precio_unitario - descuento_monto;
          const item_subtotal = precio_con_descuento * item.cantidad;

          subtotal += precio_unitario * item.cantidad;
          descuento_total += descuento_monto * item.cantidad;

          // Crear nuevo item
          await SaleItem.create(
            {
              venta_id: id,
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              precio_unitario: precio_unitario,
              descuento_porcentaje: descuento_porcentaje,
              descuento_monto: descuento_monto,
              precio_con_descuento: precio_con_descuento,
              subtotal: item_subtotal,
            },
            { transaction }
          );

          // 🔧 ACTUALIZAR STOCK CONDICIONAL
          if (!isEditMode) {
            // Solo actualizar stock si NO es modo edición
            await Product.decrement("stock", {
              by: item.cantidad,
              where: { id: item.producto_id },
              transaction,
            });
          } else {
            console.log(
              `🔄 Saltando actualización de stock para ${product.fragancia} (modo edición)`
            );
          }
        }

        // Actualizar totales de la venta
        req.body.subtotal = subtotal;
        req.body.descuento_total = descuento_total;
      }

      // Actualizar campos de la venta
      const updateData = {};
      if (cliente_id !== undefined) updateData.cliente_id = cliente_id;
      if (metodo_pago_id !== undefined)
        updateData.metodo_pago_id = metodo_pago_id;
      if (referencia_pago !== undefined)
        updateData.referencia_pago = referencia_pago;
      if (costo_envio !== undefined)
        updateData.costo_envio = parseFloat(costo_envio);
      if (estado_venta !== undefined) updateData.estado_venta = estado_venta;
      if (estado_pago !== undefined) updateData.estado_pago = estado_pago;
      if (observaciones !== undefined) updateData.observaciones = observaciones;
      if (req.body.subtotal !== undefined)
        updateData.subtotal = req.body.subtotal;
      if (req.body.descuento_total !== undefined)
        updateData.descuento_total = req.body.descuento_total;

      // 🔧 CALCULAR TOTAL CORRECTAMENTE
      if (
        updateData.subtotal !== undefined ||
        updateData.descuento_total !== undefined ||
        updateData.costo_envio !== undefined
      ) {
        const finalSubtotal =
          updateData.subtotal !== undefined
            ? updateData.subtotal
            : sale.subtotal;
        const finalDescuento =
          updateData.descuento_total !== undefined
            ? updateData.descuento_total
            : sale.descuento_total;
        const finalEnvio =
          updateData.costo_envio !== undefined
            ? updateData.costo_envio
            : sale.costo_envio;

        updateData.total = finalSubtotal - finalDescuento + finalEnvio;
      }

      await sale.update(updateData, { transaction });

      await transaction.commit();

      console.log(
        `✅ Venta actualizada: ${sale.numero_venta} ${
          isEditMode ? "(modo edición)" : "(modo normal)"
        }`
      );

      res.json({
        status: "success",
        message: "Venta actualizada exitosamente",
        data: sale,
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error en updateSale(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating sale",
        error: error.message,
      });
    }
  }

  // PATCH - Update sale status
  async updateSaleStatus(req, res) {
    try {
      const { id } = req.params;
      const { estado_venta, estado_pago } = req.body;

      console.log(`💰 PATCH /api/sales/${id}/status - Estado:`, {
        estado_venta,
        estado_pago,
      });

      const sale = await Sale.findByPk(id);
      if (!sale) {
        return res.status(404).json({
          status: "error",
          message: "Sale not found",
        });
      }

      const updateData = {};
      if (estado_venta) updateData.estado_venta = estado_venta;
      if (estado_pago) updateData.estado_pago = estado_pago;

      await sale.update(updateData);

      console.log(`✅ Estado actualizado: ${sale.numero_venta}`);

      res.json({
        status: "success",
        message: "Estado de venta actualizado exitosamente",
        data: sale,
      });
    } catch (error) {
      console.error(`❌ Error en updateSaleStatus(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating sale status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete sale
  async deleteSale(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      console.log(`💰 DELETE /api/sales/${id}`);

      const sale = await Sale.findByPk(id, {
        include: [
          {
            model: SaleItem,
            as: "items",
          },
        ],
      });

      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Sale not found",
        });
      }

      // Restaurar stock de todos los items
      for (const item of sale.items) {
        await Product.increment("stock", {
          by: item.cantidad,
          where: { id: item.producto_id },
          transaction,
        });
      }

      const saleNumber = sale.numero_venta;

      // Eliminar la venta (los items se eliminarán por CASCADE)
      await sale.destroy({ transaction });

      await transaction.commit();

      console.log(`✅ Venta eliminada: ${saleNumber}`);

      res.json({
        status: "success",
        message: "Venta eliminada exitosamente",
      });
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error en deleteSale(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error deleting sale",
        error: error.message,
      });
    }
  }

  // GET - Get sales by customer
  async getSalesByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      console.log(`💰 GET /api/sales/customer/${customerId}`);

      const offset = (page - 1) * limit;

      const sales = await Sale.findAndCountAll({
        where: { cliente_id: customerId },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["fecha", "DESC"]],
        include: [
          {
            model: PaymentMethod,
            as: "metodoPago",
            attributes: ["id", "nombre"],
          },
          {
            model: SaleItem,
            as: "items",
            attributes: ["id", "cantidad", "subtotal"],
            // ✅ CORRECCIÓN: Incluir información del producto también aquí
            include: [
              {
                model: Product,
                as: "producto",
                attributes: [
                  "id",
                  "fragancia", // Campo principal
                  "caracteristicas",
                  "precio_venta",
                  "stock",
                ],
              },
            ],
          },
        ],
      });

      console.log(`✅ Ventas del cliente ${customerId}: ${sales.count}`);

      res.json({
        status: "success",
        data: {
          sales: sales.rows,
          pagination: {
            total: sales.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(sales.count / limit),
          },
        },
      });
    } catch (error) {
      console.error(
        `❌ Error en getSalesByCustomer(${req.params.customerId}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error getting customer sales",
        error: error.message,
      });
    }
  }

  // GET - Check product stock
  async checkProductStock(req, res) {
    try {
      const { productId } = req.params;
      const { cantidad = 1 } = req.query;

      const product = await Product.findByPk(productId, {
        attributes: [
          "id",
          "fragancia", // Campo principal
          "stock",
          "precio_venta",
          "status",
        ],
      });

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      const available = product.stock >= parseInt(cantidad) && product.status;

      res.json({
        status: "success",
        data: {
          producto: product.fragancia, // Usar fragancia como nombre
          stock_disponible: product.stock,
          cantidad_solicitada: parseInt(cantidad),
          disponible: available,
          precio: product.precio_venta,
          activo: product.status, // Mantener 'activo' en la respuesta para el frontend
        },
      });
    } catch (error) {
      console.error(`❌ Error en checkProductStock:`, error);
      res.status(500).json({
        status: "error",
        message: "Error checking product stock",
        error: error.message,
      });
    }
  }

  // GET - Sales summary/statistics
  async getSalesSummary(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      const whereConditions = {};
      if (fecha_desde || fecha_hasta) {
        whereConditions.fecha = {};
        if (fecha_desde) whereConditions.fecha[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta)
          whereConditions.fecha[Op.lte] = new Date(fecha_hasta + " 23:59:59");
      }

      // Total de ventas
      const totalSales = await Sale.count({ where: whereConditions });

      // Total recaudado
      const totalRevenue =
        (await Sale.sum("total", { where: whereConditions })) || 0;

      res.json({
        status: "success",
        data: {
          total_ventas: totalSales,
          total_recaudado: totalRevenue,
        },
      });
    } catch (error) {
      console.error("❌ Error en getSalesSummary:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting sales summary",
        error: error.message,
      });
    }
  }
}

console.log("✅ SaleController creado correctamente");
module.exports = new SaleController();
