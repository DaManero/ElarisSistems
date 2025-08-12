const express = require("express");
const router = express.Router();

// Import route files
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const measureRoutes = require("./measureRoutes");
const providersRoutes = require("./providerRoute");
const productRoutes = require("./productRoutes");
const paymentMethod = require("./paymentMethodRoutes");
const customersRoutes = require("./customerRoutes");
const saleRoutes = require("./saleRoutes");
const saleItemRoutes = require("./saleItemsRoute");
const shipmentRoutes = require("./shipmentsRoutes");
const statisticsRoutes = require("./statisticsRoutes");

// Import auth middleware
const { authenticate } = require("../middleware/auth");

// Public routes (NO requieren autenticación)
router.use("/auth", authRoutes);

// Health check route (público)
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is running",
    timestamp: new Date().toISOString(),
    modules: {
      auth: "✅ Available",
      products: "✅ Available",
      sales: "✅ Available",
      customers: "✅ Available",
      statistics: "✅ Available",
    },
  });
});

router.use((req, res, next) => {
  //console.log("🚨 LLEGÓ A INDEX.JS:", req.method, req.path);
  next();
});

// Aplicar autenticación a todas las rutas protegidas
router.use(authenticate);

// Protected routes (SÍ requieren autenticación)
router.use("/users", userRoutes);
router.use("/category", categoryRoutes);
router.use("/products", productRoutes);
router.use("/providers", providersRoutes);
router.use("/measures", measureRoutes);
router.use("/payment-methods", paymentMethod);
router.use("/customers", customersRoutes);
router.use("/sales", saleRoutes);
router.use("/salesitems", saleItemRoutes);
router.use("/shipments", shipmentRoutes);
router.use("/statistics", statisticsRoutes);

module.exports = router;
