// controllers/ProductController.js - VERSIÓN FINAL SIN ERRORES
const Product = require("../models/Product");
const Category = require("../models/Category");
const Measure = require("../models/Measure");
const Provider = require("../models/Provider");
const { Op } = require("sequelize");

class ProductController {
  // GET - Get all products
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        search = "",
        status = "all",
        categoria_id = "",
        proveedor_id = "",
        low_stock = "false",
        order_by = "id",
        order_direction = "ASC",
      } = req.query;

      console.log("📦 GET /api/products - Parámetros:", {
        page,
        limit,
        search,
        status,
        categoria_id,
        proveedor_id,
        low_stock,
      });

      // Construir condiciones de búsqueda
      const whereConditions = {};

      // Filtro por estado
      if (status !== "all") {
        whereConditions.status = status === "true";
      }

      // Filtro por categoría
      if (categoria_id && categoria_id !== "all") {
        whereConditions.categoria_id = categoria_id;
      }

      // Filtro por proveedor
      if (proveedor_id && proveedor_id !== "all") {
        whereConditions.proveedor_id = proveedor_id;
      }

      // Filtro por búsqueda de texto
      if (search.trim()) {
        whereConditions[Op.or] = [
          {
            fragancia: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            caracteristicas: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      // Validar orden
      const validOrderFields = [
        "fragancia",
        "precio_venta",
        "stock",
        "createdAt",
      ];
      const orderField = validOrderFields.includes(order_by) ? order_by : "id";
      const orderDir =
        order_direction.toUpperCase() === "DESC" ? "DESC" : "ASC";

      // Paginación
      const offset = (page - 1) * limit;

      console.log("🔍 Condiciones de búsqueda:", whereConditions);

      // Obtener productos
      let products = await Product.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[orderField, orderDir]],
      });

      // Si se solicita filtro de stock bajo, aplicar en JavaScript
      if (low_stock === "true") {
        console.log("🔍 Aplicando filtro de stock bajo...");
        const lowStockProducts = products.rows.filter((product) => {
          return product.stock <= Math.max(product.stock_minimo || 5, 5);
        });

        products = {
          rows: lowStockProducts,
          count: lowStockProducts.length,
        };

        console.log(
          `📦 Productos con stock bajo encontrados: ${lowStockProducts.length}`
        );
      }

      console.log(`✅ Productos encontrados: ${products.count}`);

      res.json({
        status: "success",
        data: {
          products: products.rows,
          pagination: {
            total: products.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(products.count / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error en getProducts:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting products",
        error: error.message,
      });
    }
  }

  // GET - Get product by ID
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      console.log(`📦 GET /api/products/${id}`);

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre", "telefono", "email"],
            required: false,
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      console.log(`✅ Producto encontrado: ${product.fragancia}`);

      res.json({
        status: "success",
        data: product,
      });
    } catch (error) {
      console.error(`❌ Error en getProduct(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting product",
        error: error.message,
      });
    }
  }

  // POST - Create new product
  async createProduct(req, res) {
    try {
      const {
        fragancia,
        caracteristicas,
        imagen,
        categoria_id,
        medida_id,
        proveedor_id,
        stock,
        stock_minimo,
        precio_venta,
      } = req.body;

      console.log("📦 POST /api/products - Datos:", req.body);

      // Validación básica
      if (!fragancia || !fragancia.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre de la fragancia es obligatorio",
        });
      }

      if (!precio_venta || precio_venta <= 0) {
        return res.status(400).json({
          status: "error",
          message: "El precio de venta es obligatorio y debe ser mayor a 0",
        });
      }

      // Crear producto
      const newProduct = await Product.create({
        fragancia: fragancia.trim(),
        caracteristicas: caracteristicas?.trim() || null,
        imagen: imagen?.trim() || null,
        categoria_id: categoria_id || null,
        medida_id: medida_id || null,
        proveedor_id: proveedor_id || null,
        stock: parseInt(stock) || 0,
        stock_minimo: parseInt(stock_minimo) || 5,
        precio_venta: parseFloat(precio_venta),
      });

      // Cargar el producto con las relaciones
      const productWithRelations = await Product.findByPk(newProduct.id, {
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
      });

      console.log(`✅ Producto creado: ${newProduct.fragancia}`);

      res.status(201).json({
        status: "success",
        message: "Producto creado exitosamente",
        data: productWithRelations,
      });
    } catch (error) {
      console.error("❌ Error en createProduct:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error creating product",
        error: error.message,
      });
    }
  }

  // PUT - Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      console.log(`📦 PUT /api/products/${id} - Datos:`, req.body);

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      // Actualizar producto
      await product.update(req.body);

      // Cargar producto actualizado con relaciones
      const updatedProduct = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
      });

      console.log(`✅ Producto actualizado: ${product.fragancia}`);

      res.json({
        status: "success",
        message: "Producto actualizado exitosamente",
        data: updatedProduct,
      });
    } catch (error) {
      console.error(`❌ Error en updateProduct(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating product",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle product status
  async toggleProductStatus(req, res) {
    try {
      const { id } = req.params;
      console.log(`📦 PATCH /api/products/${id}/toggle`);

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      await product.update({ status: !product.status });

      console.log(
        `✅ Estado cambiado: ${product.fragancia} -> ${
          product.status ? "Activo" : "Inactivo"
        }`
      );

      res.json({
        status: "success",
        message: `Producto ${
          product.status ? "activado" : "desactivado"
        } exitosamente`,
        data: product,
      });
    } catch (error) {
      console.error(
        `❌ Error en toggleProductStatus(${req.params.id}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error updating product status",
        error: error.message,
      });
    }
  }

  // PATCH - Update product stock
  async updateProductStock(req, res) {
    try {
      const { id } = req.params;
      const { stock, stock_minimo } = req.body;

      console.log(`📦 PATCH /api/products/${id}/stock - Stock:`, {
        stock,
        stock_minimo,
      });

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      // Actualizar stock
      const updateData = {};
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (stock_minimo !== undefined)
        updateData.stock_minimo = parseInt(stock_minimo);

      await product.update(updateData);

      console.log(`✅ Stock actualizado: ${product.fragancia}`);

      res.json({
        status: "success",
        message: "Stock actualizado exitosamente",
        data: product,
      });
    } catch (error) {
      console.error(`❌ Error en updateProductStock(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating product stock",
        error: error.message,
      });
    }
  }

  // DELETE - Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      console.log(`📦 DELETE /api/products/${id}`);

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      const fraganciaName = product.fragancia;
      await product.destroy();

      console.log(`✅ Producto eliminado: ${fraganciaName}`);

      res.json({
        status: "success",
        message: "Producto eliminado permanentemente",
      });
    } catch (error) {
      console.error(`❌ Error en deleteProduct(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error deleting product",
        error: error.message,
      });
    }
  }

  // GET - Get active products (for selects)
  async getActiveProducts(req, res) {
    try {
      console.log("📦 GET /api/products/active");

      const products = await Product.findAll({
        where: { status: true },
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["nombre"],
            required: false,
          },
        ],
        order: [["fragancia", "ASC"]],
        attributes: ["id", "fragancia", "precio_venta", "stock"],
      });

      console.log(`✅ Productos activos encontrados: ${products.length}`);

      res.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error("❌ Error en getActiveProducts:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting active products",
        error: error.message,
      });
    }
  }

  // GET - Get low stock products
  async getLowStockProducts(req, res) {
    try {
      console.log("📦 GET /api/products/low-stock");

      // Obtener todos los productos activos y filtrar en JavaScript
      const allProducts = await Product.findAll({
        where: { status: true },
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
        order: [["stock", "ASC"]],
      });

      // Filtrar productos con stock bajo
      const lowStockProducts = allProducts.filter((product) => {
        return product.stock <= Math.max(product.stock_minimo || 5, 5);
      });

      console.log(`✅ Productos con stock bajo: ${lowStockProducts.length}`);

      res.json({
        status: "success",
        data: lowStockProducts,
        message: `Se encontraron ${lowStockProducts.length} productos con stock bajo`,
      });
    } catch (error) {
      console.error("❌ Error en getLowStockProducts:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting low stock products",
        error: error.message,
      });
    }
  }

  // GET - Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      console.log(`📦 GET /api/products/category/${categoryId}`);

      const products = await Product.findAll({
        where: {
          categoria_id: categoryId,
          status: true,
        },
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
        order: [["fragancia", "ASC"]],
      });

      console.log(
        `✅ Productos por categoría ${categoryId}: ${products.length}`
      );

      res.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error(
        `❌ Error en getProductsByCategory(${req.params.categoryId}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error getting products by category",
        error: error.message,
      });
    }
  }

  // GET - Get products by provider
  async getProductsByProvider(req, res) {
    try {
      const { providerId } = req.params;
      console.log(`📦 GET /api/products/provider/${providerId}`);

      const products = await Product.findAll({
        where: {
          proveedor_id: providerId,
          status: true,
        },
        include: [
          {
            model: Category,
            as: "categoria",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Measure,
            as: "medida",
            attributes: ["id", "nombre"],
            required: false,
          },
          {
            model: Provider,
            as: "proveedor",
            attributes: ["id", "nombre"],
            required: false,
          },
        ],
        order: [["fragancia", "ASC"]],
      });

      console.log(
        `✅ Productos por proveedor ${providerId}: ${products.length}`
      );

      res.json({
        status: "success",
        data: products,
      });
    } catch (error) {
      console.error(
        `❌ Error en getProductsByProvider(${req.params.providerId}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error getting products by provider",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
