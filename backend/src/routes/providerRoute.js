const express = require("express");
const router = express.Router();
const providerController = require("../controllers/ProviderController");

// GET /api/providers - Get all providers with pagination and search
router.get("/", providerController.getProviders);

// GET /api/providers/active - Get only active providers (for selects)
router.get("/active", providerController.getActiveProviders);

// GET /api/providers/:id - Get specific provider
router.get("/:id", providerController.getProvider);

// POST /api/providers - Create new provider
router.post("/", providerController.createProvider);

// PUT /api/providers/:id - Update provider
router.put("/:id", providerController.updateProvider);

// PATCH /api/providers/:id/toggle - Toggle provider status (activate/deactivate)
router.patch("/:id/toggle", providerController.toggleProviderStatus);

// DELETE /api/providers/:id - Delete provider permanently (hard delete)
router.delete("/:id", providerController.deleteProvider);

module.exports = router;
