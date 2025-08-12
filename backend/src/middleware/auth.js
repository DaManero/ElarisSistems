const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  // console.log("🔍 AUTH MIDDLEWARE EJECUTÁNDOSE:", req.method, req.path);
  // console.log("🔍 TOKEN RECIBIDO:", req.headers.authorization || "NO TOKEN");
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "role",
        "status",
        "last_login",
      ],
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. User not found.",
      });
    }

    if (!user.status) {
      return res.status(401).json({
        status: "error",
        message: "User account is deactivated.",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Error verifying token",
      error: error.message,
    });
  }
};

// Middleware to check user roles
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. User not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
