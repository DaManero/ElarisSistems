const Provider = require("../models/Provider");
const { Op } = require("sequelize");

class ProviderController {
  // GET - Get all providers
  async getProviders(req, res) {
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
        whereConditions[Op.or] = [
          {
            nombre: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            contacto: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      // Paginación
      const offset = (page - 1) * limit;

      const providers = await Provider.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["nombre", "ASC"]],
      });

      res.json({
        status: "success",
        data: {
          providers: providers.rows,
          pagination: {
            total: providers.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(providers.count / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting providers",
        error: error.message,
      });
    }
  }

  // GET - Get provider by ID
  async getProvider(req, res) {
    try {
      const { id } = req.params;
      const provider = await Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({
          status: "error",
          message: "Provider not found",
        });
      }

      res.json({
        status: "success",
        data: provider,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting provider",
        error: error.message,
      });
    }
  }

  // POST - Create new provider
  async createProvider(req, res) {
    try {
      const { nombre, telefono, email, contacto } = req.body;

      // Validación básica
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre del proveedor es obligatorio",
        });
      }

      // Verificar si ya existe un proveedor con el mismo nombre (opcional)
      const existingProvider = await Provider.findOne({
        where: {
          nombre: nombre.trim(),
          status: true,
        },
      });

      if (existingProvider) {
        return res.status(400).json({
          status: "error",
          message: "Ya existe un proveedor activo con ese nombre",
        });
      }

      // Verificar email único si se proporciona
      if (email && email.trim()) {
        const existingEmail = await Provider.findOne({
          where: {
            email: email.trim().toLowerCase(),
            status: true,
          },
        });

        if (existingEmail) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un proveedor activo con ese email",
          });
        }
      }

      // Crear proveedor
      const newProvider = await Provider.create({
        nombre: nombre.trim(),
        telefono: telefono?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        contacto: contacto?.trim() || null,
      });

      res.status(201).json({
        status: "success",
        message: "Proveedor creado exitosamente",
        data: newProvider,
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
        message: "Error creating provider",
        error: error.message,
      });
    }
  }

  // PUT - Update provider
  async updateProvider(req, res) {
    try {
      const { id } = req.params;
      const { nombre, telefono, email, contacto, status } = req.body;

      const provider = await Provider.findByPk(id);
      if (!provider) {
        return res.status(404).json({
          status: "error",
          message: "Provider not found",
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
      if (nombre && nombre.trim() !== provider.nombre) {
        const existingProvider = await Provider.findOne({
          where: {
            nombre: nombre.trim(),
            status: true,
            id: { [Op.ne]: id }, // Excluir el proveedor actual
          },
        });

        if (existingProvider) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un proveedor activo con ese nombre",
          });
        }
      }

      // Verificar email único si se está cambiando
      if (
        email &&
        email.trim() &&
        email.trim().toLowerCase() !== provider.email
      ) {
        const existingEmail = await Provider.findOne({
          where: {
            email: email.trim().toLowerCase(),
            status: true,
            id: { [Op.ne]: id }, // Excluir el proveedor actual
          },
        });

        if (existingEmail) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un proveedor activo con ese email",
          });
        }
      }

      // Actualizar campos
      const updateData = {};
      if (nombre) updateData.nombre = nombre.trim();
      if (telefono !== undefined)
        updateData.telefono = telefono?.trim() || null;
      if (email !== undefined)
        updateData.email = email?.trim().toLowerCase() || null;
      if (contacto !== undefined)
        updateData.contacto = contacto?.trim() || null;
      if (status !== undefined) updateData.status = status;

      await provider.update(updateData);

      res.json({
        status: "success",
        message: "Proveedor actualizado exitosamente",
        data: provider,
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
        message: "Error updating provider",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle provider status (soft delete/activate)
  async toggleProviderStatus(req, res) {
    try {
      const { id } = req.params;

      const provider = await Provider.findByPk(id);
      if (!provider) {
        return res.status(404).json({
          status: "error",
          message: "Provider not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados si se está desactivando

      // Toggle status
      await provider.update({ status: !provider.status });

      res.json({
        status: "success",
        message: `Proveedor ${
          provider.status ? "activado" : "desactivado"
        } exitosamente`,
        data: provider,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error updating provider status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete provider permanently (hard delete)
  async deleteProvider(req, res) {
    try {
      const { id } = req.params;

      const provider = await Provider.findByPk(id);
      if (!provider) {
        return res.status(404).json({
          status: "error",
          message: "Provider not found",
        });
      }

      // TODO: Verificar que no tenga productos asociados

      // Hard delete: eliminar completamente
      await provider.destroy();

      res.json({
        status: "success",
        message: "Proveedor eliminado permanentemente",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error deleting provider",
        error: error.message,
      });
    }
  }

  // GET - Get active providers (para selects)
  async getActiveProviders(req, res) {
    try {
      const providers = await Provider.findAll({
        where: { status: true },
        order: [["nombre", "ASC"]],
        attributes: ["id", "nombre", "telefono", "email", "contacto"], // Campos necesarios para selects
      });

      res.json({
        status: "success",
        data: providers,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error getting active providers",
        error: error.message,
      });
    }
  }
}

module.exports = new ProviderController();
