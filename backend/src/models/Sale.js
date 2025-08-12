const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Sale extends Model {
  // Method to check if sale is completed
  isCompleted() {
    return this.estado_venta === "Entregado" && this.estado_pago === "Pagado";
  }

  canBeEdited() {
    // Solo bloquear si está COMPLETO: Entregado Y Pagado, o si está Cancelado
    const result =
      !(this.estado_venta === "Entregado" && this.estado_pago === "Pagado") &&
      this.estado_venta !== "Cancelado";

    // 🔍 DEBUG LOG
    console.log(
      `🔍 DEBUG canBeEdited - Venta: ${this.numero_venta}, Estado: ${this.estado_venta}, Pago: ${this.estado_pago}, Puede editar: ${result}`
    );

    return result;
  }

  // Method to get sale status info
  getStatusInfo() {
    return {
      numero_venta: this.numero_venta,
      estado_venta: this.estado_venta,
      estado_pago: this.estado_pago,
      can_edit: this.canBeEdited(),
      is_completed: this.isCompleted(),
    };
  }

  // Static method to generate next sale number
  static async generateSaleNumber() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    // Buscar la última venta del mes actual
    const lastSale = await Sale.findOne({
      where: sequelize.where(
        sequelize.fn("DATE_FORMAT", sequelize.col("fecha"), "%Y-%m"),
        `${year}-${month}`
      ),
      order: [["numero_venta", "DESC"]],
    });

    let nextNumber = 1;
    if (lastSale) {
      // Extraer el número de la última venta
      const lastNumber = parseInt(lastSale.numero_venta.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    // Formato: VTA-MMYYYY-000001
    return `VTA-${month}${year}-${String(nextNumber).padStart(6, "0")}`;
  }

  // Method to calculate totals
  calculateTotals() {
    const total = this.subtotal - this.descuento_total + this.costo_envio;
    return total;
  }
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_venta: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "El número de venta es obligatorio",
        },
        is: {
          args: /^VTA-\d{6}-\d{6}$/,
          msg: "El formato del número de venta debe ser VTA-MMYYYY-000000",
        },
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: {
          msg: "La fecha debe ser válida",
        },
      },
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "El cliente es obligatorio",
        },
      },
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "El usuario es obligatorio",
        },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El subtotal no puede ser negativo",
        },
      },
    },
    descuento_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El descuento no puede ser negativo",
        },
      },
    },
    costo_envio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El costo de envío no puede ser negativo",
        },
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El total no puede ser negativo",
        },
      },
    },
    metodo_pago_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "payment_methods",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "El método de pago es obligatorio",
        },
      },
    },
    referencia_pago: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "La referencia de pago debe tener máximo 100 caracteres",
        },
      },
    },
    estado_venta: {
      type: DataTypes.ENUM(
        "En proceso",
        "Enviado",
        "Entregado",
        "Reprogramado",
        "Cancelado"
      ),
      defaultValue: "En proceso",
      allowNull: false,
      validate: {
        isIn: {
          args: [
            ["En proceso", "Enviado", "Entregado", "Reprogramado", "Cancelado"],
          ],
          msg: "Estado de venta inválido",
        },
      },
    },
    estado_pago: {
      type: DataTypes.ENUM("Pendiente", "Pagado"),
      defaultValue: "Pendiente",
      allowNull: false,
      validate: {
        isIn: {
          args: [["Pendiente", "Pagado"]],
          msg: "Estado de pago inválido",
        },
      },
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Sale",
    tableName: "sales",
    timestamps: true,
    indexes: [
      {
        fields: ["numero_venta"], // Índice único para número de venta
        unique: true,
      },
      {
        fields: ["fecha"], // Índice para búsquedas por fecha
      },
      {
        fields: ["cliente_id"], // Índice para búsquedas por cliente
      },
      {
        fields: ["usuario_id"], // Índice para búsquedas por usuario
      },
      {
        fields: ["estado_venta"], // Índice para filtrar por estado de venta
      },
      {
        fields: ["estado_pago"], // Índice para filtrar por estado de pago
      },
      {
        fields: ["metodo_pago_id"], // Índice para búsquedas por método de pago
      },
    ],
    hooks: {
      beforeCreate: async (sale) => {
        // Generar número de venta si no existe
        if (!sale.numero_venta) {
          sale.numero_venta = await Sale.generateSaleNumber();
        }
        // Calcular total
        sale.total = sale.subtotal - sale.descuento_total + sale.costo_envio;
      },
      beforeUpdate: async (sale) => {
        // Recalcular total si cambian los valores
        if (
          sale.changed("subtotal") ||
          sale.changed("descuento_total") ||
          sale.changed("costo_envio")
        ) {
          sale.total = sale.subtotal - sale.descuento_total + sale.costo_envio;
        }
      },
    },
  }
);

// Definir asociaciones
Sale.associate = (models) => {
  // Una venta pertenece a un cliente
  Sale.belongsTo(models.Customer, {
    foreignKey: "cliente_id",
    as: "cliente",
  });

  // Una venta pertenece a un usuario
  Sale.belongsTo(models.User, {
    foreignKey: "usuario_id",
    as: "usuario",
  });

  // Una venta pertenece a un método de pago
  Sale.belongsTo(models.PaymentMethod, {
    foreignKey: "metodo_pago_id",
    as: "metodoPago",
  });

  // Una venta tiene muchos items
  Sale.hasMany(models.SaleItem, {
    foreignKey: "venta_id",
    as: "items",
    onDelete: "CASCADE",
  });
};

module.exports = Sale;
