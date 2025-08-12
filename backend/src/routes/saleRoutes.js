const express = require("express");
const router = express.Router();

// Debug: verificar que el controlador se importe correctamente
console.log("📦 Importando SaleController...");
const saleController = require("../controllers/SaleController");

// Debug: verificar que todas las funciones existan
console.log("🔍 Verificando funciones del SaleController:");
console.log("- getSales:", typeof saleController.getSales);
console.log("- getSale:", typeof saleController.getSale);
console.log("- createSale:", typeof saleController.createSale);
console.log("- updateSale:", typeof saleController.updateSale);
console.log("- updateSaleStatus:", typeof saleController.updateSaleStatus);
console.log("- deleteSale:", typeof saleController.deleteSale);
console.log("- getSalesByCustomer:", typeof saleController.getSalesByCustomer);
console.log("- checkProductStock:", typeof saleController.checkProductStock);
console.log("- getSalesSummary:", typeof saleController.getSalesSummary);
console.log("- validateProducts:", typeof saleController.validateProducts);

// Verificar que saleController existe y es un objeto
if (!saleController) {
  console.error("❌ SaleController no se importó correctamente");
  throw new Error("SaleController no encontrado");
}

// Verificar cada función antes de usarla
const checkFunction = (funcName, func) => {
  if (typeof func !== "function") {
    console.error(`❌ ${funcName} no es una función:`, typeof func);
    throw new Error(`${funcName} no está definida en SaleController`);
  }
  return func;
};

// GET /api/sales - Get all sales with filters
router.get("/", checkFunction("getSales", saleController.getSales));

// GET /api/sales/summary - Get sales summary/statistics
router.get(
  "/summary",
  checkFunction("getSalesSummary", saleController.getSalesSummary)
);

// POST /api/sales/validate-products - Validate products before creating sale
router.post(
  "/validate-products",
  checkFunction("validateProducts", saleController.validateProducts)
);

// GET /api/sales/customer/:customerId - Get sales by customer
router.get(
  "/customer/:customerId",
  checkFunction("getSalesByCustomer", saleController.getSalesByCustomer)
);

// GET /api/sales/check-stock/:productId - Check product stock availability
router.get(
  "/check-stock/:productId",
  checkFunction("checkProductStock", saleController.checkProductStock)
);

// GET /api/sales/:id - Get specific sale with details
router.get("/:id", checkFunction("getSale", saleController.getSale));

// POST /api/sales - Create new sale
router.post("/", checkFunction("createSale", saleController.createSale));

// PUT /api/sales/:id - Update sale
router.put("/:id", checkFunction("updateSale", saleController.updateSale));

// PATCH /api/sales/:id/status - Update sale status only
router.patch(
  "/:id/status",
  checkFunction("updateSaleStatus", saleController.updateSaleStatus)
);

// DELETE /api/sales/:id - Delete sale (restores stock)
router.delete("/:id", checkFunction("deleteSale", saleController.deleteSale));

console.log("✅ Todas las rutas de ventas configuradas correctamente");

module.exports = router;
