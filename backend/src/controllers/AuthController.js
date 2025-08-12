const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthController {
  // Generate JWT Token
  generateToken(userId) {
    //console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debug temporal
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    });
  }

  // POST - Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        });
      }

      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Check if user is active - FIXED VERSION
      if (!user.status || user.status === false || user.status === 0) {
        return res.status(403).json({
          status: "error",
          message:
            "Usuario inactivo. Contacta al administrador para reactivar tu cuenta.",
          code: "USER_INACTIVE",
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
      });

      // Return user data with token (without password)
      res.json({
        status: "success",
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            last_login: user.last_login,
          },
          token: token,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error during login",
        error: error.message,
      });
    }
  }

  // GET - Get current user profile
  async getProfile(req, res) {
    try {
      // req.user comes from auth middleware
      const user = req.user;

      res.json({
        status: "success",
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          last_login: user.last_login,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting profile",
        error: error.message,
      });
    }
  }

  // POST - Refresh token
  async refreshToken(req, res) {
    try {
      // req.user comes from auth middleware
      const user = req.user;

      // Generate new token
      const newToken = this.generateToken(user.id);

      res.json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error refreshing token",
        error: error.message,
      });
    }
  }

  // POST - Logout user
  async logout(req, res) {
    try {
      res.json({
        status: "success",
        message: "Logout successful",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error during logout",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
