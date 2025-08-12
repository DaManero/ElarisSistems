const Measure = require("../models/Measure");
const { Op } = require("sequelize");

class MeasureController {
  // GET - Get all measures
  async getMeasures(req, res) {
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

      const measures = await Measure.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["nombre", "ASC"]],
      });

      res.json({
        status: "success",
        data: {
          measures: measures.rows,
          pagination: {
            total: measures.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(measures.count / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting measures",
        error: error.message,
      });
    }
  }

  // GET - Get measure by ID
  async getMeasure(req, res) {
    try {
      const { id } = req.params;
      const measure = await Measure.findByPk(id);

      if (!measure) {
        return res.status(404).json({
          status: "error",
          message: "Measure not found",
        });
      }

      res.json({
        status: "success",
        data: measure,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting measure",
        error: error.message,
      });
    }
  }

  // POST - Create new measure
  async createMeasure(req, res) {
    try {
      const { nombre } = req.body;

      // Validación básica
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre de la medida es obligatorio",
        });
      }

      // Verificar si ya existe una medida con el mismo nombre (opcional)
      const existingMeasure = await Measure.findOne({
        where: {
          nombre: nombre.trim(),
          status: true,
        },
      });

      if (existingMeasure) {
        return res.status(400).json({
          status: "error",
          message: "Ya existe una medida activa con ese nombre",
        });
      }

      // Crear medida
      const newMeasure = await Measure.create({
        nombre: nombre.trim(),
      });

      res.status(201).json({
        status: "success",
        message: "Medida creada exitosamente",
        data: newMeasure,
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
        message: "Error creating measure",
        error: error.message,
      });
    }
  }

  // PUT - Update measure
  async updateMeasure(req, res) {
    try {
      const { id } = req.params;
      const { nombre, status } = req.body;

      const measure = await Measure.findByPk(id);
      if (!measure) {
        return res.status(404).json({
          status: "error",
          message: "Measure not found",
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
      if (nombre && nombre.trim() !== measure.nombre) {
        const existingMeasure = await Measure.findOne({
          where: {
            nombre: nombre.trim(),
            status: true,
            id: { [Op.ne]: id }, // Excluir la medida actual
          },
        });

        if (existingMeasure) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe una medida activa con ese nombre",
          });
        }
      }

      // Actualizar campos
      const updateData = {};
      if (nombre) updateData.nombre = nombre.trim();
      if (status !== undefined) updateData.status = status;

      await measure.update(updateData);

      res.json({
        status: "success",
        message: "Medida actualizada exitosamente",
        data: measure,
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
        message: "Error updating measure",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle measure status (soft delete/activate)
  async toggleMeasureStatus(req, res) {
    try {
      const { id } = req.params;

      const measure = await Measure.findByPk(id);
      if (!measure) {
        return res.status(404).json({
          status: "error",
          message: "Measure not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados si se está desactivando

      // Toggle status
      await measure.update({ status: !measure.status });

      res.json({
        status: "success",
        message: `Medida ${
          measure.status ? "activada" : "desactivada"
        } exitosamente`,
        data: measure,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error updating measure status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete measure permanently (hard delete)
  async deleteMeasure(req, res) {
    try {
      const { id } = req.params;

      const measure = await Measure.findByPk(id);
      if (!measure) {
        return res.status(404).json({
          status: "error",
          message: "Measure not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados

      // Hard delete: eliminar completamente
      await measure.destroy();

      res.json({
        status: "success",
        message: "Medida eliminada permanentemente",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error deleting measure",
        error: error.message,
      });
    }
  }

  // GET - Get active measures (para selects)
  async getActiveMeasures(req, res) {
    try {
      const measures = await Measure.findAll({
        where: { status: true },
        order: [["nombre", "ASC"]],
        attributes: ["id", "nombre"], // Solo los campos necesarios
      });

      res.json({
        status: "success",
        data: measures,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting active measures",
        error: error.message,
      });
    }
  }
}

module.exports = new MeasureController();
