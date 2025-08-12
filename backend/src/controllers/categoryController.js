const Category = require("../models/Category");
const { Op } = require("sequelize");

class CategoryController {
  // GET - Get all categories
  async getCategories(req, res) {
    try {
      const { page = 1, limit = 50, search = "", status = "all" } = req.query;

      // Construir condiciones de búsqueda
      const whereConditions = {};

      // Filtro por estado
      if (status !== "all") {
        whereConditions.status = status === "true";
      }

      // Filtro por búsqueda de texto
      if (search.trim()) {
        whereConditions.nombre = {
          [Op.like]: `%${search.trim()}%`,
        };
      }

      // Paginación
      const offset = (page - 1) * limit;

      const categories = await Category.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["nombre", "ASC"]],
      });

      res.json({
        status: "success",
        data: {
          categories: categories.rows,
          pagination: {
            total: categories.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(categories.count / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting categories",
        error: error.message,
      });
    }
  }

  // GET - Get category by ID
  async getCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      res.json({
        status: "success",
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting category",
        error: error.message,
      });
    }
  }

  // POST - Create new category
  async createCategory(req, res) {
    try {
      const { nombre } = req.body;

      // Validación básica
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre de la categoría es obligatorio",
        });
      }

      // Verificar si ya existe una categoría con el mismo nombre (opcional)
      const existingCategory = await Category.findOne({
        where: {
          nombre: nombre.trim(),
          status: true,
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          status: "error",
          message: "Ya existe una categoría activa con ese nombre",
        });
      }

      // Crear categoría
      const newCategory = await Category.create({
        nombre: nombre.trim(),
      });

      res.status(201).json({
        status: "success",
        message: "Categoría creada exitosamente",
        data: newCategory,
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error creating category",
        error: error.message,
      });
    }
  }

  // PUT - Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { nombre, status } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      // Validar datos
      if (nombre && !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre no puede estar vacío",
        });
      }

      // Verificar nombre duplicado si se está cambiando
      if (nombre && nombre.trim() !== category.nombre) {
        const existingCategory = await Category.findOne({
          where: {
            nombre: nombre.trim(),
            status: true,
            id: { [Op.ne]: id }, // Excluir la categoría actual
          },
        });

        if (existingCategory) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe una categoría activa con ese nombre",
          });
        }
      }

      // Actualizar campos
      const updateData = {};
      if (nombre) updateData.nombre = nombre.trim();
      if (status !== undefined) updateData.status = status;

      await category.update(updateData);

      res.json({
        status: "success",
        message: "Categoría actualizada exitosamente",
        data: category,
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error updating category",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle category status (soft delete/activate)
  async toggleCategoryStatus(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados si se está desactivando
      // if (!category.status) {
      //   const productCount = await category.getProductCount();
      //   if (productCount > 0) {
      //     return res.status(400).json({
      //       status: "error",
      //       message: `No se puede desactivar la categoría porque tiene ${productCount} productos asociados`,
      //     });
      //   }
      // }

      // Toggle status
      await category.update({ status: !category.status });

      res.json({
        status: "success",
        message: `Categoría ${
          category.status ? "activada" : "desactivada"
        } exitosamente`,
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error updating category status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete category permanently (hard delete)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados
      // const productCount = await category.getProductCount();
      // if (productCount > 0) {
      //   return res.status(400).json({
      //     status: "error",
      //     message: `No se puede eliminar la categoría porque tiene ${productCount} productos asociados`,
      //   });
      // }

      // Hard delete: eliminar completamente
      await category.destroy();

      res.json({
        status: "success",
        message: "Categoría eliminada permanentemente",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error deleting category",
        error: error.message,
      });
    }
  }

  // GET - Get active categories (para selects)
  async getActiveCategories(req, res) {
    try {
      const categories = await Category.findAll({
        where: { status: true },
        order: [["nombre", "ASC"]],
        attributes: ["id", "nombre"], // Solo los campos necesarios
      });

      res.json({
        status: "success",
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting active categories",
        error: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
