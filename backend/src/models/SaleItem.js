const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class SaleItem extends Model {
  // Method to calculate price with discount
  calculatePriceWithDiscount() {
    if (this.descuento_porcentaje > 0) {
      const descuento =
        (this.precio_unitario * this.descuento_porcentaje) / 100;
      return this.precio_unitario - descuento;
    }
    return this.precio_unitario;
  }

  // Method to calculate subtotal
  calculateSubtotal() {
    return this.precio_con_descuento * this.cantidad;
  }

  // Method to get item summary
  getItemSummary() {
    return {
      producto_id: this.producto_id,
      cantidad: this.cantidad,
      precio_unitario: this.precio_unitario,
      descuento: `${this.descuento_porcentaje}%`,
      precio_final: this.precio_con_descuento,
      subtotal: this.subtotal,
    };
  }
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sales",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "La venta es obligatoria",
        },
      },
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "El producto es obligatorio",
        },
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: "La cantidad debe ser al menos 1",
        },
        isInt: {
          msg: "La cantidad debe ser un número entero",
        },
      },
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "El precio unitario no puede ser negativo",
        },
        notNull: {
          msg: "El precio unitario es obligatorio",
        },
      },
    },
    descuento_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El descuento no puede ser negativo",
        },
        max: {
          args: [100],
          msg: "El descuento no puede ser mayor a 100%",
        },
      },
    },
    descuento_monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El monto de descuento no puede ser negativo",
        },
      },
    },
    precio_con_descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "El precio con descuento no puede ser negativo",
        },
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: "El subtotal no puede ser negativo",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "SaleItem",
    tableName: "sale_items",
    timestamps: true,
    indexes: [
      {
        fields: ["venta_id"], // Índice para búsquedas por venta
      },
      {
        fields: ["producto_id"], // Índice para búsquedas por producto
      },
      {
        fields: ["venta_id", "producto_id"], // Índice compuesto
      },
    ],
    hooks: {
      beforeCreate: async (item) => {
        // Calcular descuento en monto
        if (item.descuento_porcentaje > 0) {
          item.descuento_monto =
            (item.precio_unitario * item.descuento_porcentaje) / 100;
          item.precio_con_descuento =
            item.precio_unitario - item.descuento_monto;
        } else {
          item.descuento_monto = 0;
          item.precio_con_descuento = item.precio_unitario;
        }
        // Calcular subtotal
        item.subtotal = item.precio_con_descuento * item.cantidad;
      },
      beforeUpdate: async (item) => {
        // Recalcular si cambian los valores
        if (
          item.changed("precio_unitario") ||
          item.changed("descuento_porcentaje") ||
          item.changed("cantidad")
        ) {
          // Calcular descuento en monto
          if (item.descuento_porcentaje > 0) {
            item.descuento_monto =
              (item.precio_unitario * item.descuento_porcentaje) / 100;
            item.precio_con_descuento =
              item.precio_unitario - item.descuento_monto;
          } else {
            item.descuento_monto = 0;
            item.precio_con_descuento = item.precio_unitario;
          }
          // Calcular subtotal
          item.subtotal = item.precio_con_descuento * item.cantidad;
        }
      },
    },
  }
);

module.exports = SaleItem;
