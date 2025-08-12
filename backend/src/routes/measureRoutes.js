const express = require("express");
const router = express.Router();
const measureController = require("../controllers/MeasureController");

// GET /api/measures - Get all measures with pagination and search
router.get("/", measureController.getMeasures);

// GET /api/measures/active - Get only active measures (for selects)
router.get("/active", measureController.getActiveMeasures);

// GET /api/measures/:id - Get specific measure
router.get("/:id", measureController.getMeasure);

// POST /api/measures - Create new measure
router.post("/", measureController.createMeasure);

// PUT /api/measures/:id - Update measure
router.put("/:id", measureController.updateMeasure);

// PATCH /api/measures/:id/toggle - Toggle measure status (activate/deactivate)
router.patch("/:id/toggle", measureController.toggleMeasureStatus);

// DELETE /api/measures/:id - Delete measure permanently (hard delete)
router.delete("/:id", measureController.deleteMeasure);

module.exports = router;
