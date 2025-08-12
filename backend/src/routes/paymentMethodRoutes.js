const express = require("express");
const router = express.Router();
const paymentMethodController = require("../controllers/PaymentMethodController");

// GET /api/payment-methods - Get all payment methods with pagination and search
router.get("/", paymentMethodController.getPaymentMethods);

// GET /api/payment-methods/active - Get only active payment methods (for selects)
router.get("/active", paymentMethodController.getActivePaymentMethods);

// GET /api/payment-methods/:id - Get specific payment method
router.get("/:id", paymentMethodController.getPaymentMethod);

// POST /api/payment-methods - Create new payment method
router.post("/", paymentMethodController.createPaymentMethod);

// PUT /api/payment-methods/:id - Update payment method
router.put("/:id", paymentMethodController.updatePaymentMethod);

// PATCH /api/payment-methods/:id/toggle - Toggle payment method status (activate/deactivate)
router.patch("/:id/toggle", paymentMethodController.togglePaymentMethodStatus);

// DELETE /api/payment-methods/:id - Delete payment method permanently (hard delete)
router.delete("/:id", paymentMethodController.deletePaymentMethod);

module.exports = router;
