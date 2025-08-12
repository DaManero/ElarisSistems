const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Measure extends Model {
  // Method to check if measure is active
  isActive() {
    return this.status === true;
  }

  // Method to get measure with product count (useful for deletion validation)
  async getProductCount() {
    // Este método lo implementaremos cuando tengamos el modelo Product
    // por ahora retorna 0
    return 0;
  }
}

Measure.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la medida es obligatorio",
        },
        len: {
          args: [1, 50],
          msg: "El nombre debe tener entre 1 y 50 caracteres",
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
    modelName: "Measure",
    tableName: "measures",
    timestamps: true, // Agrega created_at y updated_at automáticamente
    indexes: [
      {
        fields: ["nombre"], // Índice para búsquedas por nombre
      },
      {
        fields: ["status"], // Índice para filtrar por estado
      },
    ],
  }
);

module.exports = Measure;
