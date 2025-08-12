const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET /api/category - Get all categories with pagination and search
router.get("/", categoryController.getCategories);

// GET /api/category/active - Get only active categories (for selects)
router.get("/active", categoryController.getActiveCategories);

// GET /api/category/:id - Get specific category
router.get("/:id", categoryController.getCategory);

// POST /api/category - Create new category
router.post("/", categoryController.createCategory);

router.patch("/:id/toggle", categoryController.toggleCategoryStatus);

// PUT /api/category/:id - Update category
router.put("/:id", categoryController.updateCategory);

// DELETE /api/category/:id - Delete category (soft delete)
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
