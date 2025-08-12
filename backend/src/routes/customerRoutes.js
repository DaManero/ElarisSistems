const express = require("express");
const router = express.Router();
const customerController = require("../controllers/CustomerController");

// GET /api/customers - Get all customers with pagination, search and filters
router.get("/", customerController.getCustomers);

// GET /api/customers/active - Get only active customers (for selects)
router.get("/active", customerController.getActiveCustomers);

// GET /api/customers/search - Search customers by name or phone (for sales)
router.get("/search", customerController.searchCustomers);

// GET /api/customers/provinces - Get distinct provinces (for filters)
router.get("/provinces", customerController.getProvinces);

// GET /api/customers/provinces/:provincia/localities - Get localities by province
router.get(
  "/provinces/:provincia/localities",
  customerController.getLocalitiesByProvince
);

// GET /api/customers/:id - Get specific customer
router.get("/:id", customerController.getCustomer);

// POST /api/customers - Create new customer
router.post("/", customerController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put("/:id", customerController.updateCustomer);

// PATCH /api/customers/:id/toggle - Toggle customer status (activate/deactivate)
router.patch("/:id/toggle", customerController.toggleCustomerStatus);

// PATCH /api/customers/:id/update-type - Update customer type to recurrent
router.patch("/:id/update-type", customerController.updateCustomerType);

// DELETE /api/customers/:id - Delete customer permanently (hard delete)
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
