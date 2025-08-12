const PaymentMethod = require("../models/PaymentMethod");
const { Op } = require("sequelize");

class PaymentMethodController {
  // GET - Get all payment methods
  async getPaymentMethods(req, res) {
    try {
      const { page = 1, limit = 50, search = "", status = "all" } = req.query;

      console.log("💳 GET /api/payment-methods - Parámetros:", {
        page,
        limit,
        search,
        status,
      });

      // Construir condiciones de búsqueda
      const whereConditions = {};

      // Filtro por estado
      if (status !== "all") {
        whereConditions.activo = status === "true";
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
            descripcion: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      // Paginación
      const offset = (page - 1) * limit;

      const paymentMethods = await PaymentMethod.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["nombre", "ASC"]],
      });

      console.log(`✅ Métodos de pago encontrados: ${paymentMethods.count}`);

      res.json({
        status: "success",
        data: {
          paymentMethods: paymentMethods.rows,
          pagination: {
            total: paymentMethods.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(paymentMethods.count / limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error en getPaymentMethods:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting payment methods",
        error: error.message,
      });
    }
  }

  // GET - Get payment method by ID
  async getPaymentMethod(req, res) {
    try {
      const { id } = req.params;
      console.log(`💳 GET /api/payment-methods/${id}`);

      const paymentMethod = await PaymentMethod.findByPk(id);

      if (!paymentMethod) {
        return res.status(404).json({
          status: "error",
          message: "Payment method not found",
        });
      }

      console.log(`✅ Método de pago encontrado: ${paymentMethod.nombre}`);

      res.json({
        status: "success",
        data: paymentMethod,
      });
    } catch (error) {
      console.error(`❌ Error en getPaymentMethod(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting payment method",
        error: error.message,
      });
    }
  }

  // POST - Create new payment method
  async createPaymentMethod(req, res) {
    try {
      const { nombre, descripcion, requiere_referencia } = req.body;

      console.log("💳 POST /api/payment-methods - Datos:", req.body);

      // Validación básica
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre del método de pago es obligatorio",
        });
      }

      // Verificar si ya existe un método con el mismo nombre
      const existingMethod = await PaymentMethod.findOne({
        where: {
          nombre: nombre.trim(),
        },
      });

      if (existingMethod) {
        return res.status(400).json({
          status: "error",
          message: "Ya existe un método de pago con ese nombre",
        });
      }

      // Crear método de pago
      const newPaymentMethod = await PaymentMethod.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        requiere_referencia: requiere_referencia || false,
      });

      console.log(`✅ Método de pago creado: ${newPaymentMethod.nombre}`);

      res.status(201).json({
        status: "success",
        message: "Método de pago creado exitosamente",
        data: newPaymentMethod,
      });
    } catch (error) {
      console.error("❌ Error en createPaymentMethod:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error creating payment method",
        error: error.message,
      });
    }
  }

  // PUT - Update payment method
  async updatePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, requiere_referencia, activo } = req.body;

      console.log(`💳 PUT /api/payment-methods/${id} - Datos:`, req.body);

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: "error",
          message: "Payment method not found",
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
      if (nombre && nombre.trim() !== paymentMethod.nombre) {
        const existingMethod = await PaymentMethod.findOne({
          where: {
            nombre: nombre.trim(),
            id: { [Op.ne]: id }, // Excluir el método actual
          },
        });

        if (existingMethod) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un método de pago con ese nombre",
          });
        }
      }

      // Actualizar campos
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (descripcion !== undefined)
        updateData.descripcion = descripcion?.trim() || null;
      if (requiere_referencia !== undefined)
        updateData.requiere_referencia = requiere_referencia;
      if (activo !== undefined) updateData.activo = activo;

      await paymentMethod.update(updateData);

      console.log(`✅ Método de pago actualizado: ${paymentMethod.nombre}`);

      res.json({
        status: "success",
        message: "Método de pago actualizado exitosamente",
        data: paymentMethod,
      });
    } catch (error) {
      console.error(
        `❌ Error en updatePaymentMethod(${req.params.id}):`,
        error
      );

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error updating payment method",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle payment method status
  async togglePaymentMethodStatus(req, res) {
    try {
      const { id } = req.params;
      console.log(`💳 PATCH /api/payment-methods/${id}/toggle`);

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: "error",
          message: "Payment method not found",
        });
      }

      // Toggle status
      await paymentMethod.update({ activo: !paymentMethod.activo });

      console.log(
        `✅ Estado cambiado: ${paymentMethod.nombre} -> ${
          paymentMethod.activo ? "Activo" : "Inactivo"
        }`
      );

      res.json({
        status: "success",
        message: `Método de pago ${
          paymentMethod.activo ? "activado" : "desactivado"
        } exitosamente`,
        data: paymentMethod,
      });
    } catch (error) {
      console.error(
        `❌ Error en togglePaymentMethodStatus(${req.params.id}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error updating payment method status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete payment method permanently (hard delete)
  async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      console.log(`💳 DELETE /api/payment-methods/${id}`);

      const paymentMethod = await PaymentMethod.findByPk(id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: "error",
          message: "Payment method not found",
        });
      }

      // TODO: Verificar que no tenga ventas asociadas

      const methodName = paymentMethod.nombre;
      await paymentMethod.destroy();

      console.log(`✅ Método de pago eliminado: ${methodName}`);

      res.json({
        status: "success",
        message: "Método de pago eliminado permanentemente",
      });
    } catch (error) {
      console.error(
        `❌ Error en deletePaymentMethod(${req.params.id}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error deleting payment method",
        error: error.message,
      });
    }
  }

  // GET - Get active payment methods (for selects)
  async getActivePaymentMethods(req, res) {
    try {
      console.log("💳 GET /api/payment-methods/active");

      const paymentMethods = await PaymentMethod.findAll({
        where: { activo: true },
        order: [["nombre", "ASC"]],
        attributes: ["id", "nombre", "descripcion", "requiere_referencia"],
      });

      console.log(`✅ Métodos de pago activos: ${paymentMethods.length}`);

      res.json({
        status: "success",
        data: paymentMethods,
      });
    } catch (error) {
      console.error("❌ Error en getActivePaymentMethods:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting active payment methods",
        error: error.message,
      });
    }
  }
}

module.exports = new PaymentMethodController();
