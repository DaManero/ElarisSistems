const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class PaymentMethod extends Model {
  // Method to check if payment method is active
  isActive() {
    return this.activo === true;
  }

  // Method to check if requires reference (transaction number)
  requiresReference() {
    return this.requiere_referencia === true;
  }
}

PaymentMethod.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "El nombre del método de pago es obligatorio",
        },
        len: {
          args: [1, 50],
          msg: "El nombre debe tener entre 1 y 50 caracteres",
        },
      },
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: "La descripción debe tener máximo 200 caracteres",
        },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    requiere_referencia: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: "Si necesita número de transacción/referencia",
    },
  },
  {
    sequelize,
    modelName: "PaymentMethod",
    tableName: "payment_methods",
    timestamps: true, // created_at y updated_at automáticos
    indexes: [
      {
        fields: ["nombre"], // Índice para búsquedas por nombre
      },
      {
        fields: ["activo"], // Índice para filtrar por activos
      },
    ],
  }
);

module.exports = PaymentMethod;
