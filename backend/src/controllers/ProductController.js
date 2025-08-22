// controllers/ProductController.js - VERSIÓN FINAL SIN ERRORES
const Product = require("../models/Product");
const Category = require("../models/Category");
const Measure = require("../models/Measure");
const Provider = require("../models/Provider");
const { Op } = require("sequelize");

const convertGoogleDriveUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  const trimmedUrl = url.trim();

  // Si no es de Google Drive, retornar sin cambios
  if (
    !trimmedUrl.includes("drive.google.com") &&
    !trimmedUrl.includes("drive.usercontent.google.com")
  ) {
    return trimmedUrl;
  }

  let fileId = null;

  // Extraer file ID de diferentes formatos
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/ID
    /id=([a-zA-Z0-9_-]+)/, // id=ID
    /\/d\/([a-zA-Z0-9_-]+)/, // /d/ID
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      fileId = match[1];
      break;
    }
  }

  if (!fileId) {
    console.warn(`⚠️ No se pudo extraer file ID de: ${trimmedUrl}`);
    return trimmedUrl;
  }

  // 🔧 USAR PROXY PARA EVITAR CORS
  // Opción 1: Usar Google's own proxy (más confiable)
  const proxyUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000-h1000`;

  console.log(`🔄 URL de Google Drive convertida con proxy:`);
  console.log(`   Original: ${trimmedUrl}`);
  console.log(`   File ID: ${fileId}`);
  console.log(`   Proxy URL: ${proxyUrl}`);

  return proxyUrl;
};

// También actualizar processImageUrl para manejar mejor los errores
const processImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    // Convertir URL de Google Drive si es necesario
    const convertedUrl = convertGoogleDriveUrl(trimmed);

    // Validar que la URL resultante sea válida
    if (convertedUrl.startsWith("http")) {
      return convertedUrl;
    } else {
      console.error(`❌ URL resultante inválida: ${convertedUrl}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error procesando URL: ${trimmed}`, error);
    return null;
  }
};

// 🔧 ALTERNATIVA: Múltiples opciones de proxy
const convertGoogleDriveUrlWithFallbacks = (url) => {
  if (!url || typeof url !== "string") return url;

  const trimmedUrl = url.trim();

  if (
    !trimmedUrl.includes("drive.google.com") &&
    !trimmedUrl.includes("drive.usercontent.google.com")
  ) {
    return trimmedUrl;
  }

  let fileId = null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      fileId = match[1];
      break;
    }
  }

  if (!fileId) return trimmedUrl;

  // 🔧 MÚLTIPLES OPCIONES DE PROXY (el frontend puede intentar varias)
  const proxyUrls = [
    `https://lh3.googleusercontent.com/d/${fileId}=w1000-h1000`, // Proxy de Google
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000-h1000`, // Thumbnail API
    `https://drive.usercontent.google.com/download?id=${fileId}&export=view`, // Directo (puede fallar)
  ];

  console.log(`🔄 URLs generadas para ${fileId}:`, proxyUrls);

  // Retornar la primera (más confiable)
  return proxyUrls[0];
};
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
      console.log("📦 POST /api/products - Datos RAW:", req.body);
      console.log("📦 POST stringified:", JSON.stringify(req.body, null, 2));

      // 🔧 MAPEAR CAMPOS ANTES DE CREAR
      const createData = { ...req.body };

      // Si viene imagen_url, mapearla a imagen para la BD
      if (createData.imagen_url !== undefined) {
        createData.imagen = processImageUrl(createData.imagen_url);
        delete createData.imagen_url;
        console.log("🔄 Mapeando imagen_url -> imagen:", createData.imagen);
      }

      console.log("🔄 OBJETO FINAL PARA CREAR:", createData);

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
      } = createData;

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

      console.log("🔧 DATOS PREPARADOS PARA CREAR:");
      console.log("   fragancia:", fragancia);
      console.log("   imagen:", imagen);
      console.log("   precio_venta:", precio_venta);

      // Crear producto con datos mapeados
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

      console.log("📸 PRODUCTO CREADO EN BD:");
      console.log("   ID:", newProduct.id);
      console.log("   Fragancia:", newProduct.fragancia);
      console.log("   Imagen:", newProduct.imagen);
      console.log("   Precio:", newProduct.precio_venta);

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
      // 🔍 LOGS SÚPER DETALLADOS
      console.log("=" * 60);
      console.log(`🔧 DEBUG DETALLADO - Actualizando producto ${id}`);
      console.log("📦 req.body RAW:", req.body);
      console.log(
        "📦 req.body stringified:",
        JSON.stringify(req.body, null, 2)
      );
      // Verificar cada campo individualmente
      console.log("🔍 CAMPOS INDIVIDUALES:");
      console.log(
        "   fragancia:",
        req.body.fragancia,
        "(tipo:",
        typeof req.body.fragancia,
        ")"
      );
      console.log(
        "   imagen:",
        req.body.imagen,
        "(tipo:",
        typeof req.body.imagen,
        ")"
      );
      console.log(
        "   imagen_url:",
        req.body.imagen_url,
        "(tipo:",
        typeof req.body.imagen_url,
        ")"
      );
      console.log(
        "   precio_venta:",
        req.body.precio_venta,
        "(tipo:",
        typeof req.body.precio_venta,
        ")"
      );
      console.log(
        "   stock:",
        req.body.stock,
        "(tipo:",
        typeof req.body.stock,
        ")"
      );
      // Verificar todas las propiedades del objeto
      console.log("🔍 TODAS LAS PROPIEDADES DE req.body:");
      Object.keys(req.body).forEach((key) => {
        console.log(`   ${key}: "${req.body[key]}" (${typeof req.body[key]})`);
      });
      console.log("=" * 60);

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      // 🔍 Log del producto ANTES de actualizar
      console.log("📸 ESTADO ACTUAL DEL PRODUCTO:");
      console.log("   ID:", product.id);
      console.log("   Fragancia:", product.fragancia);
      console.log("   Imagen ANTES:", product.imagen);
      console.log("   Precio ANTES:", product.precio_venta);
      console.log("   Stock ANTES:", product.stock);

      // 🔧 MAPEAR CAMPOS ANTES DE ACTUALIZAR
      const updateData = { ...req.body };

      // Si viene imagen_url, mapearla a imagen para la BD
      if (updateData.imagen_url !== undefined) {
        updateData.imagen = processImageUrl(updateData.imagen_url);
        delete updateData.imagen_url; // Eliminar el campo original
        console.log("🔄 Mapeando imagen_url -> imagen:", updateData.imagen);
      }

      console.log("🔄 OBJETO FINAL PARA ACTUALIZAR:", updateData);

      // 🔍 INTENTAR ACTUALIZAR Y VER QUÉ PASA
      console.log("🔄 INTENTANDO ACTUALIZAR CON:", updateData);

      await product.update(updateData);

      console.log("📸 ESTADO DESPUÉS DE product.update():");
      console.log("   Fragancia DESPUÉS:", product.fragancia);
      console.log("   Imagen DESPUÉS:", product.imagen);
      console.log("   Precio DESPUÉS:", product.precio_venta);
      console.log("   Stock DESPUÉS:", product.stock);

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

      console.log("🎯 PRODUCTO FINAL DE LA BASE DE DATOS:");
      console.log("   Fragancia FINAL:", updatedProduct.fragancia);
      console.log("   Imagen FINAL:", updatedProduct.imagen);
      console.log("   Precio FINAL:", updatedProduct.precio_venta);
      console.log("   Stock FINAL:", updatedProduct.stock);
      console.log("=" * 60);

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
