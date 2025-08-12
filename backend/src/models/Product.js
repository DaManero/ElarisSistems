const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Product extends Model {
  // Method to check if product is active
  isActive() {
    return this.status === true;
  }

  // Method to check if product has stock
  hasStock() {
    return this.stock > 0;
  }

  // Method to check if product has low stock
  isLowStock() {
    return this.stock <= (this.stock_minimo || 5);
  }

  // Method to get stock status
  getStockStatus() {
    if (this.stock <= 0) return "sin_stock";
    if (this.isLowStock()) return "stock_bajo";
    return "stock_normal";
  }

  // Method to get product with relations count (useful for deletion validation)
  async getSalesCount() {
    // Este método lo implementaremos cuando tengamos el modelo Sales
    // por ahora retorna 0
    return 0;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fragancia: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la fragancia es obligatorio",
        },
        len: {
          args: [1, 100],
          msg: "La fragancia debe tener entre 1 y 100 caracteres",
        },
      },
    },
    caracteristicas: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 5000],
          msg: "Las características no pueden exceder 5000 caracteres",
        },
      },
    },
    imagen: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida",
        },
        len: {
          args: [0, 500],
          msg: "La URL de la imagen debe tener máximo 500 caracteres",
        },
      },
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "La categoría debe ser un número válido",
        },
      },
    },
    medida_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "measures",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "La medida debe ser un número válido",
        },
      },
    },
    proveedor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "providers",
        key: "id",
      },
      validate: {
        isInt: {
          msg: "El proveedor debe ser un número válido",
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El stock debe ser mayor o igual a 0",
        },
        isInt: {
          msg: "El stock debe ser un número entero",
        },
      },
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: {
          args: [0],
          msg: "El stock mínimo debe ser mayor o igual a 0",
        },
        isInt: {
          msg: "El stock mínimo debe ser un número entero",
        },
      },
    },
    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "El precio de venta debe ser mayor o igual a 0",
        },
        isDecimal: {
          msg: "El precio de venta debe ser un número válido",
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
    modelName: "Product",
    tableName: "products",
    timestamps: true, // Agrega created_at y updated_at automáticamente
    indexes: [
      {
        fields: ["fragancia"], // Índice para búsquedas por nombre
      },
      {
        fields: ["status"], // Índice para filtrar por estado
      },
      {
        fields: ["categoria_id"], // Índice para filtrar por categoría
      },
      {
        fields: ["proveedor_id"], // Índice para filtrar por proveedor
      },
      {
        fields: ["stock"], // Índice para consultas de stock
      },
      {
        fields: ["precio_venta"], // Índice para consultas de precio
      },
    ],
  }
);

module.exports = Product;
