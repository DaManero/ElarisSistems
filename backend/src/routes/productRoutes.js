// routes/productRoutes.js - CON BASE DE DATOS REAL
const express = require("express");
const router = express.Router();

// Importar el controlador real
let productController;
try {
  productController = require("../controllers/ProductController");
  console.log("✅ ProductController cargado correctamente");
} catch (error) {
  console.error("❌ Error cargando ProductController:", error.message);
  console.log("⚠️ Usando rutas temporales sin base de datos");
}

// Si el controlador existe, usar rutas reales
if (productController) {
  console.log("🔗 Usando rutas con base de datos real");

  // GET /api/products - Get all products with pagination, search and filters
  router.get("/", productController.getProducts);

  // GET /api/products/active - Get only active products (for selects)
  router.get("/active", productController.getActiveProducts);

  // GET /api/products/low-stock - Get products with low stock
  router.get("/low-stock", productController.getLowStockProducts);

  // GET /api/products/category/:categoryId - Get products by category
  router.get("/category/:categoryId", productController.getProductsByCategory);

  // GET /api/products/provider/:providerId - Get products by provider
  router.get("/provider/:providerId", productController.getProductsByProvider);

  // GET /api/products/:id - Get specific product
  router.get("/:id", productController.getProduct);

  // POST /api/products - Create new product
  router.post("/", productController.createProduct);

  // PUT /api/products/:id - Update product
  router.put("/:id", productController.updateProduct);

  // PATCH /api/products/:id/toggle - Toggle product status (activate/deactivate)
  router.patch("/:id/toggle", productController.toggleProductStatus);

  // PATCH /api/products/:id/stock - Update product stock
  router.patch("/:id/stock", productController.updateProductStock);

  // DELETE /api/products/:id - Delete product permanently (hard delete)
  router.delete("/:id", productController.deleteProduct);
} else {
  // Rutas temporales si no hay controlador
  console.log("⚠️ Usando rutas temporales (fake data)");

  router.get("/", async (req, res) => {
    res.json({
      status: "error",
      message:
        "ProductController no encontrado. Verifica que exista el archivo controllers/ProductController.js",
      data: {
        products: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 },
      },
    });
  });

  router.get("/active", (req, res) => {
    res.json({
      status: "error",
      message: "ProductController no encontrado",
      data: [],
    });
  });

  router.get("/:id", (req, res) => {
    res.status(404).json({
      status: "error",
      message: "ProductController no encontrado",
    });
  });

  router.post("/", (req, res) => {
    res.status(500).json({
      status: "error",
      message: "ProductController no encontrado",
    });
  });

  router.put("/:id", (req, res) => {
    res.status(500).json({
      status: "error",
      message: "ProductController no encontrado",
    });
  });

  router.delete("/:id", (req, res) => {
    res.status(500).json({
      status: "error",
      message: "ProductController no encontrado",
    });
  });
}

// Ruta de test (siempre disponible)
router.get("/test/ping", (req, res) => {
  res.json({
    status: "success",
    message: "Product routes are working!",
    controller_loaded: !!productController,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
