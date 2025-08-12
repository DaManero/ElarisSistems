const Customer = require("../models/Customer");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

class CustomerController {
  // GET - Get all customers
  async getCustomers(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        search = "",
        status = "all",
        tipo_cliente = "all",
        provincia = "all",
        localidad = "all",
      } = req.query;

      console.log("👤 GET /api/customers - Parámetros:", {
        page,
        limit,
        search,
        status,
        tipo_cliente,
        provincia,
        localidad,
      });

      // Construir condiciones de búsqueda
      const whereConditions = {};

      // Filtro por estado
      if (status !== "all") {
        whereConditions.status = status === "true";
      }

      // Filtro por tipo de cliente
      if (tipo_cliente !== "all") {
        whereConditions.tipo_cliente = tipo_cliente;
      }

      // Filtro por provincia
      if (provincia !== "all") {
        whereConditions.provincia = provincia;
      }

      // Filtro por localidad
      if (localidad !== "all") {
        whereConditions.localidad = localidad;
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
            apellido: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            telefono: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            email: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            calle: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
          {
            codigo_postal: {
              [Op.like]: `%${search.trim()}%`,
            },
          },
        ];
      }

      // Paginación
      const offset = (page - 1) * limit;

      const customers = await Customer.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["apellido", "ASC"],
          ["nombre", "ASC"],
        ],
      });

      console.log(`✅ Clientes encontrados: ${customers.count}`);

      res.json({
        status: "success",
        data: {
          customers: customers.rows,
          pagination: {
            total: customers.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(customers.count / limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error en getCustomers:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting customers",
        error: error.message,
      });
    }
  }

  // GET - Get customer by ID
  async getCustomer(req, res) {
    try {
      const { id } = req.params;
      console.log(`👤 GET /api/customers/${id}`);

      const customer = await Customer.findByPk(id);

      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Customer not found",
        });
      }

      console.log(`✅ Cliente encontrado: ${customer.getFullName()}`);

      res.json({
        status: "success",
        data: customer,
      });
    } catch (error) {
      console.error(`❌ Error en getCustomer(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting customer",
        error: error.message,
      });
    }
  }

  // POST - Create new customer
  async createCustomer(req, res) {
    try {
      const {
        nombre,
        apellido,
        telefono,
        email,
        calle,
        altura,
        piso,
        dpto,
        codigo_postal,
        aclaracion,
        provincia,
        localidad,
      } = req.body;

      console.log("👤 POST /api/customers - Datos:", req.body);

      // Validación básica
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre es obligatorio",
        });
      }

      if (!apellido || !apellido.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El apellido es obligatorio",
        });
      }

      if (!telefono || !telefono.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El teléfono es obligatorio",
        });
      }

      if (!calle || !calle.trim()) {
        return res.status(400).json({
          status: "error",
          message: "La calle es obligatoria",
        });
      }

      if (!altura || !altura.trim()) {
        return res.status(400).json({
          status: "error",
          message: "La altura es obligatoria",
        });
      }

      if (!codigo_postal || !codigo_postal.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El código postal es obligatorio",
        });
      }

      if (!provincia || !provincia.trim()) {
        return res.status(400).json({
          status: "error",
          message: "La provincia es obligatoria",
        });
      }

      if (!localidad || !localidad.trim()) {
        return res.status(400).json({
          status: "error",
          message: "La localidad es obligatoria",
        });
      }

      // Verificar si ya existe un cliente con el mismo teléfono
      const existingCustomerByPhone = await Customer.findOne({
        where: {
          telefono: telefono.trim(),
          status: true,
        },
      });

      if (existingCustomerByPhone) {
        return res.status(400).json({
          status: "error",
          message: "Ya existe un cliente activo con ese teléfono",
        });
      }

      // Verificar email único si se proporciona
      if (email && email.trim()) {
        const existingCustomerByEmail = await Customer.findOne({
          where: {
            email: email.trim().toLowerCase(),
            status: true,
          },
        });

        if (existingCustomerByEmail) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un cliente activo con ese email",
          });
        }
      }

      // Crear cliente (siempre empieza como "Nuevo")
      const newCustomer = await Customer.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        email: email?.trim().toLowerCase() || null,
        calle: calle.trim(),
        altura: altura.trim(),
        piso: piso?.trim() || null,
        dpto: dpto?.trim() || null,
        codigo_postal: codigo_postal.trim(),
        aclaracion: aclaracion?.trim() || null,
        provincia: provincia.trim(),
        localidad: localidad.trim(),
        tipo_cliente: "Nuevo", // Siempre empieza como nuevo
      });

      console.log(
        `✅ Cliente creado: ${newCustomer.getFullName()} (${
          newCustomer.tipo_cliente
        })`
      );

      res.status(201).json({
        status: "success",
        message: "Cliente creado exitosamente",
        data: newCustomer,
      });
    } catch (error) {
      console.error("❌ Error en createCustomer:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error creating customer",
        error: error.message,
      });
    }
  }

  // PUT - Update customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        apellido,
        telefono,
        email,
        calle,
        altura,
        piso,
        dpto,
        codigo_postal,
        aclaracion,
        provincia,
        localidad,
        status,
      } = req.body;

      console.log(`👤 PUT /api/customers/${id} - Datos:`, req.body);

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Customer not found",
        });
      }

      // Validar datos
      if (nombre && !nombre.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El nombre no puede estar vacío",
        });
      }

      if (apellido && !apellido.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El apellido no puede estar vacío",
        });
      }

      if (telefono && !telefono.trim()) {
        return res.status(400).json({
          status: "error",
          message: "El teléfono no puede estar vacío",
        });
      }

      // Verificar teléfono duplicado si se está cambiando
      if (telefono && telefono.trim() !== customer.telefono) {
        const existingCustomer = await Customer.findOne({
          where: {
            telefono: telefono.trim(),
            status: true,
            id: { [Op.ne]: id }, // Excluir el cliente actual
          },
        });

        if (existingCustomer) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un cliente activo con ese teléfono",
          });
        }
      }

      // Verificar email único si se está cambiando
      if (
        email &&
        email.trim() &&
        email.trim().toLowerCase() !== customer.email
      ) {
        const existingEmail = await Customer.findOne({
          where: {
            email: email.trim().toLowerCase(),
            status: true,
            id: { [Op.ne]: id }, // Excluir el cliente actual
          },
        });

        if (existingEmail) {
          return res.status(400).json({
            status: "error",
            message: "Ya existe un cliente activo con ese email",
          });
        }
      }

      // Actualizar campos
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (apellido !== undefined) updateData.apellido = apellido.trim();
      if (telefono !== undefined) updateData.telefono = telefono.trim();
      if (email !== undefined)
        updateData.email = email?.trim().toLowerCase() || null;
      if (calle !== undefined) updateData.calle = calle.trim();
      if (altura !== undefined) updateData.altura = altura.trim();
      if (piso !== undefined) updateData.piso = piso?.trim() || null;
      if (dpto !== undefined) updateData.dpto = dpto?.trim() || null;
      if (codigo_postal !== undefined)
        updateData.codigo_postal = codigo_postal.trim();
      if (aclaracion !== undefined)
        updateData.aclaracion = aclaracion?.trim() || null;
      if (provincia !== undefined) updateData.provincia = provincia.trim();
      if (localidad !== undefined) updateData.localidad = localidad.trim();
      if (status !== undefined) updateData.status = status;

      // NOTA: tipo_cliente NO se actualiza manualmente, se calcula automáticamente

      await customer.update(updateData);

      console.log(`✅ Cliente actualizado: ${customer.getFullName()}`);

      res.json({
        status: "success",
        message: "Cliente actualizado exitosamente",
        data: customer,
      });
    } catch (error) {
      console.error(`❌ Error en updateCustomer(${req.params.id}):`, error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((err) => err.message),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error updating customer",
        error: error.message,
      });
    }
  }

  // PATCH - Toggle customer status
  async toggleCustomerStatus(req, res) {
    try {
      const { id } = req.params;
      console.log(`👤 PATCH /api/customers/${id}/toggle`);

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Customer not found",
        });
      }

      // TODO: Verificar que no tenga ventas pendientes si se está desactivando

      // Toggle status
      await customer.update({ status: !customer.status });

      console.log(
        `✅ Estado cambiado: ${customer.getFullName()} -> ${
          customer.status ? "Activo" : "Inactivo"
        }`
      );

      res.json({
        status: "success",
        message: `Cliente ${
          customer.status ? "activado" : "desactivado"
        } exitosamente`,
        data: customer,
      });
    } catch (error) {
      console.error(
        `❌ Error en toggleCustomerStatus(${req.params.id}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error updating customer status",
        error: error.message,
      });
    }
  }

  // DELETE - Delete customer permanently (hard delete)
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      console.log(`👤 DELETE /api/customers/${id}`);

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Customer not found",
        });
      }

      // TODO: Verificar que no tenga ventas asociadas

      const customerName = customer.getFullName();
      await customer.destroy();

      console.log(`✅ Cliente eliminado: ${customerName}`);

      res.json({
        status: "success",
        message: "Cliente eliminado permanentemente",
      });
    } catch (error) {
      console.error(`❌ Error en deleteCustomer(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error deleting customer",
        error: error.message,
      });
    }
  }

  // GET - Get active customers (for selects)
  async getActiveCustomers(req, res) {
    try {
      console.log("👤 GET /api/customers/active");

      const customers = await Customer.findAll({
        where: { status: true },
        order: [
          ["apellido", "ASC"],
          ["nombre", "ASC"],
        ],
        attributes: [
          "id",
          "nombre",
          "apellido",
          "telefono",
          "email",
          "calle",
          "altura",
          "piso",
          "dpto",
          "codigo_postal",
          "aclaracion",
          "provincia",
          "localidad",
          "tipo_cliente",
        ],
      });

      console.log(`✅ Clientes activos encontrados: ${customers.length}`);

      res.json({
        status: "success",
        data: customers,
      });
    } catch (error) {
      console.error("❌ Error en getActiveCustomers:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting active customers",
        error: error.message,
      });
    }
  }

  // GET - Search customers by phone or name (for quick search in sales)
  async searchCustomers(req, res) {
    try {
      const { q } = req.query; // query parameter
      console.log(`👤 GET /api/customers/search?q=${q}`);

      if (!q || q.trim().length < 2) {
        return res.json({
          status: "success",
          data: [],
          message: "Ingresa al menos 2 caracteres para buscar",
        });
      }

      const customers = await Customer.findAll({
        where: {
          status: true,
          [Op.or]: [
            {
              nombre: {
                [Op.like]: `%${q.trim()}%`,
              },
            },
            {
              apellido: {
                [Op.like]: `%${q.trim()}%`,
              },
            },
            {
              telefono: {
                [Op.like]: `%${q.trim()}%`,
              },
            },
          ],
        },
        order: [
          ["apellido", "ASC"],
          ["nombre", "ASC"],
        ],
        limit: 10, // Limitar resultados para búsqueda rápida
        attributes: [
          "id",
          "nombre",
          "apellido",
          "telefono",
          "calle",
          "altura",
          "piso",
          "dpto",
          "codigo_postal",
          "provincia",
          "localidad",
          "tipo_cliente",
        ],
      });

      console.log(`✅ Clientes encontrados en búsqueda: ${customers.length}`);

      // Devolver los datos con información adicional útil para mostrar
      const customersWithInfo = customers.map((customer) => ({
        ...customer.toJSON(),
        nombreCompleto: customer.getFullName(),
        direccionCompleta: customer.getFullAddress(),
      }));

      res.json({
        status: "success",
        data: customersWithInfo,
      });
    } catch (error) {
      console.error("❌ Error en searchCustomers:", error);
      res.status(500).json({
        status: "error",
        message: "Error searching customers",
        error: error.message,
      });
    }
  }

  // GET - Get distinct provinces (for filters)
  async getProvinces(req, res) {
    try {
      console.log("👤 GET /api/customers/provinces");

      const provinces = await Customer.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("provincia")), "provincia"],
        ],
        where: { status: true },
        order: [["provincia", "ASC"]],
        raw: true,
      });

      console.log(`✅ Provincias encontradas: ${provinces.length}`);

      res.json({
        status: "success",
        data: provinces.map((p) => p.provincia).filter((p) => p), // Filtrar null
      });
    } catch (error) {
      console.error("❌ Error en getProvinces:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting provinces",
        error: error.message,
      });
    }
  }

  // GET - Get localities by province (for filters)
  async getLocalitiesByProvince(req, res) {
    try {
      const { provincia } = req.params;
      console.log(`👤 GET /api/customers/provinces/${provincia}/localities`);

      const localities = await Customer.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("localidad")), "localidad"],
        ],
        where: {
          status: true,
          provincia: provincia,
        },
        order: [["localidad", "ASC"]],
        raw: true,
      });

      console.log(
        `✅ Localidades encontradas para ${provincia}: ${localities.length}`
      );

      res.json({
        status: "success",
        data: localities.map((l) => l.localidad).filter((l) => l), // Filtrar null
      });
    } catch (error) {
      console.error(
        `❌ Error en getLocalitiesByProvince(${req.params.provincia}):`,
        error
      );
      res.status(500).json({
        status: "error",
        message: "Error getting localities",
        error: error.message,
      });
    }
  }

  // PATCH - Update customer type to recurrent (called when a sale is made)
  async updateCustomerType(req, res) {
    try {
      const { id } = req.params;
      console.log(`👤 PATCH /api/customers/${id}/update-type`);

      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({
          status: "error",
          message: "Customer not found",
        });
      }

      // TODO: Contar ventas reales cuando tengamos el modelo Sale
      // Por ahora, si llaman a este endpoint, significa que ya compró antes
      await customer.update({ tipo_cliente: "Recurrente" });

      console.log(
        `✅ Cliente marcado como recurrente: ${customer.getFullName()}`
      );

      res.json({
        status: "success",
        message: "Tipo de cliente actualizado a recurrente",
        data: customer,
      });
    } catch (error) {
      console.error(`❌ Error en updateCustomerType(${req.params.id}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error updating customer type",
        error: error.message,
      });
    }
  }
}

module.exports = new CustomerController();
