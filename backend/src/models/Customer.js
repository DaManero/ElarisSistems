const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Customer extends Model {
  // Method to check if customer is active
  isActive() {
    return this.status === true;
  }

  // Method to check if customer is recurrent
  isRecurrent() {
    return this.tipo_cliente === "Recurrente";
  }

  // Method to get full name
  getFullName() {
    return `${this.nombre} ${this.apellido}`;
  }

  // Method to get full address
  getFullAddress() {
    let address = `${this.calle} ${this.altura}`;
    if (this.piso) address += `, Piso ${this.piso}`;
    if (this.dpto) address += `, Dpto ${this.dpto}`;
    address += ` - CP: ${this.codigo_postal} - ${this.localidad}, ${this.provincia}`;
    if (this.aclaracion) address += ` (${this.aclaracion})`;
    return address;
  }

  // Method to get full info
  getFullInfo() {
    return {
      id: this.id,
      nombreCompleto: this.getFullName(),
      telefono: this.telefono,
      email: this.email,
      direccionCompleta: this.getFullAddress(),
      tipo: this.tipo_cliente,
      status: this.status,
    };
  }

  // Method to get sales count (useful for determining customer type)
  async getSalesCount() {
    // Este método lo implementaremos cuando tengamos el modelo Sale
    // por ahora retorna 0
    return 0;
  }
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es obligatorio",
        },
        len: {
          args: [2, 100],
          msg: "El nombre debe tener entre 2 y 100 caracteres",
        },
      },
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El apellido es obligatorio",
        },
        len: {
          args: [2, 100],
          msg: "El apellido debe tener entre 2 y 100 caracteres",
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El teléfono es obligatorio",
        },
        len: {
          args: [8, 20],
          msg: "El teléfono debe tener entre 8 y 20 caracteres",
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Debe ser un email válido",
        },
        len: {
          args: [0, 100],
          msg: "El email debe tener máximo 100 caracteres",
        },
      },
    },
    calle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La calle es obligatoria",
        },
        len: {
          args: [2, 200],
          msg: "La calle debe tener entre 2 y 200 caracteres",
        },
      },
    },
    altura: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La altura es obligatoria",
        },
        len: {
          args: [1, 10],
          msg: "La altura debe tener entre 1 y 10 caracteres",
        },
      },
    },
    piso: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    dpto: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
    },
    codigo_postal: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El código postal es obligatorio",
        },
        len: {
          args: [4, 10],
          msg: "El código postal debe tener entre 4 y 10 caracteres",
        },
      },
    },
    aclaracion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      comment:
        "Información adicional para la entrega (entre calles, referencias, etc.)",
    },
    provincia: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La provincia es obligatoria",
        },
        len: {
          args: [2, 100],
          msg: "La provincia debe tener entre 2 y 100 caracteres",
        },
      },
    },
    localidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La localidad es obligatoria",
        },
        len: {
          args: [2, 100],
          msg: "La localidad debe tener entre 2 y 100 caracteres",
        },
      },
    },
    tipo_cliente: {
      type: DataTypes.ENUM("Nuevo", "Recurrente"),
      defaultValue: "Nuevo",
      allowNull: false,
      comment: "Se actualiza automáticamente según el historial de compras",
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true, // created_at y updated_at automáticos
    indexes: [
      {
        fields: ["nombre", "apellido"], // Índice compuesto para búsquedas por nombre completo
      },
      {
        fields: ["telefono"], // Índice para búsquedas por teléfono
      },
      {
        fields: ["email"], // Índice para búsquedas por email
      },
      {
        fields: ["provincia", "localidad"], // Índice compuesto para búsquedas por ubicación
      },
      {
        fields: ["codigo_postal"], // Índice para búsquedas por código postal
      },
      {
        fields: ["tipo_cliente"], // Índice para filtrar por tipo
      },
      {
        fields: ["status"], // Índice para filtrar por estado
      },
    ],
  }
);

module.exports = Customer;
