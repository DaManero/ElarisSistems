const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Category extends Model {
  // Method to check if category is active
  isActive() {
    return this.status === true;
  }

  // Method to get category with product count (useful for deletion validation)
  async getProductCount() {
    // Este método lo implementaremos cuando tengamos el modelo Product
    // por ahora retorna 0
    return 0;
  }
}

Category.init(
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
          msg: "El nombre de la categoría es obligatorio",
        },
        len: {
          args: [2, 100],
          msg: "El nombre debe tener entre 2 y 100 caracteres",
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
    modelName: "Category",
    tableName: "categories",
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

module.exports = Category;
