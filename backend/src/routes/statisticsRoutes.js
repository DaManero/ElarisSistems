// routes/statisticsRoutes.js - CON BASE DE DATOS REAL
const express = require("express");
const router = express.Router();

// Importar el controlador real
let statisticsController;
try {
  statisticsController = require("../controllers/StatisticsController");
  console.log("✅ StatisticsController cargado correctamente");
} catch (error) {
  console.error("❌ Error cargando StatisticsController:", error.message);
  console.log("⚠️ Usando rutas temporales sin base de datos");
}

// Si el controlador existe, usar rutas reales
if (statisticsController) {
  console.log("🔗 Usando rutas de estadísticas con base de datos real");

  // GET /api/statistics/dashboard - Dashboard ejecutivo con KPIs principales
  router.get("/dashboard", statisticsController.getDashboardKPIs);

  // GET /api/statistics/sales - Estadísticas detalladas de ventas
  router.get("/sales", statisticsController.getSalesStatistics);

  // GET /api/statistics/products - Análisis de productos (rotación, ABC, rentabilidad)
  router.get("/products", statisticsController.getProductStatistics);

  // GET /api/statistics/customers - Análisis de clientes (RFM, geográfico, comportamental)
  router.get("/customers", statisticsController.getCustomerStatistics);

  // GET /api/statistics/payments - Estadísticas de métodos y estados de pago
  router.get("/payments", statisticsController.getPaymentStatistics);

  // GET /api/statistics/shipments - Estadísticas de envíos y logística
  router.get("/shipments", statisticsController.getShipmentStatistics);

  // GET /api/statistics/geographic - Análisis geográfico detallado
  router.get("/geographic", statisticsController.getGeographicAnalysis);

  // GET /api/statistics/trends - Análisis de tendencias temporales
  router.get("/trends", statisticsController.getTrendAnalysis);

  // GET /api/statistics/rankings/:type - Top rankings (products, customers, categories)
  router.get("/rankings/:type", statisticsController.getTopRankings);

  // POST /api/statistics/export - Exportar reportes (PDF, Excel, CSV)
  router.post("/export", statisticsController.exportReport);

  // GET /api/statistics/sales/evolution - Evolución detallada de ventas
  router.get(
    "/sales/evolution",
    statisticsController.getSalesEvolutionDetailed
  );

  // GET /api/statistics/products/rotation - Análisis específico de rotación de productos
  router.get(
    "/products/rotation",
    statisticsController.getProductRotationDetailed
  );

  // GET /api/statistics/customers/rfm - Análisis RFM detallado de clientes
  router.get("/customers/rfm", statisticsController.getCustomerRFMDetailed);

  // GET /api/statistics/summary/:period - Resumen rápido por período
  router.get("/summary/:period", statisticsController.getPeriodSummary);
} else {
  // Rutas temporales si no hay controlador
  console.log("⚠️ Usando rutas temporales para estadísticas (fake data)");

  router.get("/dashboard", async (req, res) => {
    res.json({
      status: "error",
      message:
        "StatisticsController no encontrado. Verifica que exista el archivo controllers/StatisticsController.js",
      data: {
        kpis: {
          sales: { ventas_mes: { current: 0, growth: 0, formatted: "$0.00" } },
          customers: { nuevos_clientes: { current: 0, growth: 0 } },
          products: { productos_vendidos: { current: 0 } },
          delivery: { tasa_entrega: { current: 0 } },
        },
        charts: {
          salesEvolution: [],
          topProducts: [],
          categoryDistribution: [],
        },
      },
    });
  });

  router.get("/sales", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        summary: {
          cantidad_ventas: 0,
          ingresos_totales: 0,
          ticket_promedio: 0,
        },
        evolution: [],
        rankings: { topProducts: [], topCustomers: [] },
      },
    });
  });

  router.get("/products", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        rotation: [],
        lowStock: [],
        categories: [],
      },
    });
  });

  router.get("/customers", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        rfm: { vip: 0, frequent: 0, new: 0, inactive: 0 },
        geographic: [],
        behavioral: [],
      },
    });
  });

  router.get("/payments", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        paymentMethods: [],
        paymentStatus: [],
      },
    });
  });

  router.get("/shipments", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        shipmentStatus: [],
        geographicDistribution: [],
      },
    });
  });

  router.get("/geographic", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: [],
    });
  });

  router.get("/trends", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {
        monthly: [],
        predictions: [],
      },
    });
  });

  router.get("/rankings/:type", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: [],
    });
  });

  router.post("/export", (req, res) => {
    res.status(500).json({
      status: "error",
      message:
        "StatisticsController no encontrado - No se pueden exportar reportes",
    });
  });

  // Rutas adicionales temporales
  router.get("/sales/evolution", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: [],
    });
  });

  router.get("/products/rotation", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: [],
    });
  });

  router.get("/customers/rfm", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: [],
    });
  });

  router.get("/summary/:period", (req, res) => {
    res.json({
      status: "error",
      message: "StatisticsController no encontrado",
      data: {},
    });
  });
}

// Ruta de test (siempre disponible)
router.get("/test/ping", (req, res) => {
  res.json({
    status: "success",
    message: "Statistics routes are working!",
    controller_loaded: !!statisticsController,
    timestamp: new Date().toISOString(),
    available_endpoints: [
      "GET /api/statistics/dashboard",
      "GET /api/statistics/sales",
      "GET /api/statistics/products",
      "GET /api/statistics/customers",
      "GET /api/statistics/payments",
      "GET /api/statistics/shipments",
      "GET /api/statistics/geographic",
      "GET /api/statistics/trends",
      "GET /api/statistics/rankings/:type",
      "POST /api/statistics/export",
    ],
  });
});

module.exports = router;
