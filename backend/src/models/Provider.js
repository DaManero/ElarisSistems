const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Provider extends Model {
  // Method to check if provider is active
  isActive() {
    return this.status === true;
  }

  // Method to get provider with product count (useful for deletion validation)
  async getProductCount() {
    // Este método lo implementaremos cuando tengamos el modelo Product
    // por ahora retorna 0
    return 0;
  }
}

Provider.init(
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
          msg: "El nombre del proveedor es obligatorio",
        },
        len: {
          args: [1, 100],
          msg: "El nombre debe tener entre 1 y 100 caracteres",
        },
      },
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: "El teléfono debe tener máximo 20 caracteres",
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
    contacto: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "El contacto debe tener máximo 100 caracteres",
        },
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Provider",
    tableName: "providers",
    timestamps: true, // Agrega created_at y updated_at automáticamente
    indexes: [
      {
        fields: ["nombre"], // Índice para búsquedas por nombre
      },
      {
        fields: ["status"], // Índice para filtrar por estado
      },
      {
        fields: ["email"], // Índice para búsquedas por email
      },
    ],
  }
);

module.exports = Provider;
