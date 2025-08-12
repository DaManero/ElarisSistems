const User = require("../models/User");

class UserController {
  // GET - Get all users
  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: [
          "id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "role",
          "status",
          "last_login",
        ], // Don't return password
      });

      res.json({
        status: "success",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting users",
        error: error.message,
      });
    }
  }

  // GET - Get user by ID
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
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
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting user",
        error: error.message,
      });
    }
  }

  // POST - Create new user
  async createUser(req, res) {
    try {
      const { first_name, last_name, email, phone, password, role } = req.body;

      // Basic validations
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          status: "error",
          message: "First name, last name, email and password are required",
        });
      }

      // Create user
      const newUser = await User.create({
        first_name,
        last_name,
        email,
        phone,
        password,
        role: role || "seller",
      });

      // Return user without password
      const userResponse = {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
      };

      res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: userResponse,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error creating user",
        error: error.message,
      });
    }
  }

  // PUT - Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, phone, role, status } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Update fields
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        email: email || user.email,
        phone: phone || user.phone,
        role: role || user.role,
        status: status !== undefined ? status : user.status,
      });

      res.json({
        status: "success",
        message: "User updated successfully",
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error updating user",
        error: error.message,
      });
    }
  }

  // DELETE - Delete user (change status to false)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Instead of deleting, change status to false
      await user.update({ status: false });

      res.json({
        status: "success",
        message: "User deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error deleting user",
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
