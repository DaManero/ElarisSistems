const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

// GET /api/users - Get all users
router.get("/", userController.getUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", userController.getUser);

// POST /api/users - Create new user
router.post("/", userController.createUser);

// PUT /api/users/:id - Update user
router.put("/:id", userController.updateUser);

// DELETE /api/users/:id - Delete user (deactivate)
router.delete("/:id", userController.deleteUser);

module.exports = router;
