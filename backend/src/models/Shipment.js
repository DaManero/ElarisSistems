const { DataTypes, Model, Op } = require("sequelize"); // ✅ AGREGAR Op aquí
const { sequelize } = require("../config/database");

class Shipment extends Model {
  // Verificar si el envío está completado
  isCompleted() {
    return (
      this.estado_entrega === "Entregado" && this.estado_pago_real === "Pagado"
    );
  }

  // Obtener información del estado
  getStatusInfo() {
    return {
      batch_id: this.shipment_batch_id,
      estado_entrega: this.estado_entrega,
      estado_pago_real: this.estado_pago_real,
      is_completed: this.isCompleted(),
    };
  }

  // Generar ID de lote único
  static async generateBatchId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 5).replace(":", ""); // HHMM

    // Buscar cuántos lotes se han creado hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingBatches = await Shipment.findAll({
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("shipment_batch_id")),
          "batch_id",
        ],
      ],
      where: {
        fecha_envio: {
          [Op.gte]: today, // ✅ AHORA Op está disponible
          [Op.lt]: tomorrow,
        },
      },
      raw: true,
    });

    const batchNumber = String(existingBatches.length + 1).padStart(2, "0");
    return `ENV-${dateStr}-${timeStr}-${batchNumber}`;
  }
}

Shipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shipment_batch_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "ID del lote de envío (un Excel = un lote)",
    },
    venta_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sales",
        key: "id",
      },
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Cuándo se generó el reporte",
    },
    pdf_filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Nombre del archivo Excel generado",
    },
    estado_entrega: {
      type: DataTypes.ENUM(
        "Pendiente",
        "Entregado",
        "No encontrado",
        "Reprogramado",
        "Cancelado"
      ),
      defaultValue: "Pendiente",
      allowNull: false,
    },
    estado_pago_real: {
      type: DataTypes.ENUM("Pendiente", "Pagado", "Rechazado"),
      defaultValue: "Pendiente",
      allowNull: false,
      comment: "Estado real del pago según el distribuidor",
    },
    observaciones_distribuidor: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Comentarios del distribuidor sobre la entrega",
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Cuándo se actualizó el estado por última vez",
    },
    actualizado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Usuario que actualizó el estado",
    },
  },
  {
    sequelize,
    modelName: "Shipment",
    tableName: "shipments",
    timestamps: true,
    indexes: [
      {
        fields: ["shipment_batch_id"],
        name: "idx_shipments_batch_id",
      },
      {
        fields: ["venta_id"],
        name: "idx_shipments_venta_id",
      },
      {
        fields: ["fecha_envio"],
        name: "idx_shipments_fecha_envio",
      },
      {
        fields: ["estado_entrega"],
        name: "idx_shipments_estado_entrega",
      },
      {
        fields: ["estado_pago_real"],
        name: "idx_shipments_estado_pago_real",
      },
    ],
    hooks: {
      beforeUpdate: async (shipment) => {
        // Actualizar fecha cuando cambia el estado
        if (
          shipment.changed("estado_entrega") ||
          shipment.changed("estado_pago_real")
        ) {
          shipment.fecha_actualizacion = new Date();
        }
      },
    },
  }
);

// Asociaciones
Shipment.associate = (models) => {
  // Un envío pertenece a una venta
  Shipment.belongsTo(models.Sale, {
    foreignKey: "venta_id",
    as: "venta",
  });

  // Un envío fue actualizado por un usuario
  Shipment.belongsTo(models.User, {
    foreignKey: "actualizado_por",
    as: "usuarioActualizador",
  });
};

module.exports = Shipment;
