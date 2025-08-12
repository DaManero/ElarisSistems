const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/ShipmentController");

// ==========================================
// RUTAS DE GESTIÓN DE LOTES
// ==========================================

// GET /api/shipments/batches - Obtener lotes de envío
router.get("/batches", shipmentController.getShipmentBatches);

// GET /api/shipments/batch/:batchId - Obtener envíos de un lote específico
router.get("/batch/:batchId", shipmentController.getShipmentsByBatch);

// ==========================================
// RUTAS DE GENERACIÓN DE REPORTES
// ==========================================

// GET /api/shipments/check-pending - Verificar ventas pendientes
router.get("/check-pending", shipmentController.checkPendingSales);

// GET /api/shipments/pending-detailed - Obtener ventas detalladas para reporte
router.get("/pending-detailed", shipmentController.getPendingSalesDetailed);

// POST /api/shipments/generate-report - Generar reporte de envíos
router.post("/generate-report", shipmentController.generateShipmentsReport);

// ==========================================
// 🆕 RUTAS HTML (NUEVAS)
// ==========================================

// GET /api/shipments/batch/:batchId/view-html - Ver reporte HTML imprimible
router.get("/batch/:batchId/view-html", shipmentController.viewBatchHTML);

// 🆕 GET /api/shipments/batch/:batchId/generate-labels - Generar etiquetas de envío
router.get(
  "/batch/:batchId/generate-labels",
  shipmentController.generateBatchLabels
);

// ==========================================
// RUTAS DE ACTUALIZACIÓN DE ESTADOS
// ==========================================

// PUT /api/shipments/:id/status - Actualizar estado de un envío específico
router.put("/:id/status", shipmentController.updateShipmentStatus);

// PUT /api/shipments/batch/:batchId/status - Actualizar múltiples envíos de un lote
router.put("/batch/:batchId/status", shipmentController.updateBatchStatus);

// ==========================================
// RUTAS DE ESTADÍSTICAS
// ==========================================

// GET /api/shipments/stats - Estadísticas de envíos
router.get("/stats", shipmentController.getShipmentStats);

// ==========================================
// RUTAS DE SALUD/DEBUG
// ==========================================

// GET /api/shipments/health - Health check
router.get("/health", shipmentController.healthCheck);

console.log(
  "✅ Rutas de shipments configuradas correctamente con HTML y Etiquetas"
);
module.exports = router;
