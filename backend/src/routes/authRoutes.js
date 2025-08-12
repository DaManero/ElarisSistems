const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/login - Login user
router.post("/login", authController.login);

// POST /api/auth/logout - Logout user
router.post("/logout", authenticate, authController.logout);

// GET /api/auth/profile - Get current user profile (protected)
router.get("/profile", authenticate, authController.getProfile);

// POST /api/auth/refresh - Refresh token (protected)
router.post("/refresh", authenticate, authController.refreshToken);

module.exports = router;
