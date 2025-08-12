const Shipment = require("../models/Shipment");
const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const User = require("../models/User");
const PaymentMethod = require("../models/PaymentMethod");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

const path = require("path");
const fs = require("fs").promises;

// Directorio donde se guardan los archivos de reportes (opcional para logs)
const REPORTS_DIR = path.join(__dirname, "../../storage/shipment_reports");

// Asegurar que el directorio existe
(async () => {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    console.log("📁 Directorio de reportes creado/verificado");
  } catch (error) {
    console.error("❌ Error creando directorio de reportes:", error);
  }
})();

// ✅ FUNCIÓN HELPER para construir dirección completa
const buildFullAddress = (cliente) => {
  if (!cliente) return "Dirección no especificada";

  let direccion = "";

  // Calle y altura
  if (cliente.calle && cliente.altura) {
    direccion += `${cliente.calle} ${cliente.altura}`;
  } else if (cliente.calle) {
    direccion += cliente.calle;
  }

  // Piso y departamento
  if (cliente.piso) {
    direccion += `, Piso ${cliente.piso}`;
    if (cliente.dpto) {
      direccion += ` Dpto ${cliente.dpto}`;
    }
  }

  // Localidad y provincia
  if (cliente.localidad) {
    direccion += `, ${cliente.localidad}`;
  }

  if (cliente.provincia) {
    direccion += `, ${cliente.provincia}`;
  }

  // Código postal
  if (cliente.codigo_postal) {
    direccion += ` (${cliente.codigo_postal})`;
  }

  // Aclaración
  if (cliente.aclaracion) {
    direccion += ` - ${cliente.aclaracion}`;
  }

  return direccion || "Dirección no especificada";
};

class ShipmentController {
  // ==========================================
  // GESTIÓN DE LOTES
  // ==========================================

  // GET - Obtener lotes de envío (SIN filtro de fecha para mostrar todos)
  async getShipmentBatches(req, res) {
    try {
      const { fecha } = req.query;

      console.log(`📦 GET /shipments/batches - Obteniendo lotes`);

      // 🎯 CAMBIO: Si no hay fecha, obtener TODOS los lotes
      let whereCondition = {};

      if (fecha) {
        const targetDate = new Date(fecha);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        whereCondition.fecha_envio = {
          [Op.between]: [startOfDay, endOfDay],
        };

        console.log(`📅 Filtrando por fecha: ${targetDate.toDateString()}`);
      } else {
        console.log(`📋 Obteniendo TODOS los lotes`);
      }

      // Obtener lotes únicos con estadísticas
      const batches = await Shipment.findAll({
        attributes: [
          "shipment_batch_id",
          "pdf_filename",
          "fecha_envio",
          [sequelize.fn("COUNT", sequelize.col("Shipment.id")), "total_envios"],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_entrega = 'Entregado' THEN 1 ELSE 0 END"
              )
            ),
            "entregados",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_entrega = 'Pendiente' THEN 1 ELSE 0 END"
              )
            ),
            "pendientes",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_pago_real = 'Pagado' THEN 1 ELSE 0 END"
              )
            ),
            "pagados",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_pago_real = 'Pendiente' THEN 1 ELSE 0 END"
              )
            ),
            "pagos_pendientes",
          ],
        ],
        where: whereCondition,
        group: ["shipment_batch_id", "pdf_filename", "fecha_envio"],
        order: [["fecha_envio", "DESC"]], // Más nuevos primero
      });

      console.log(`✅ ${batches.length} lotes encontrados`);

      res.json({
        status: "success",
        data: batches,
      });
    } catch (error) {
      console.error("❌ Error obteniendo lotes de envío:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo lotes de envío",
        error: error.message,
      });
    }
  }

  // GET - Obtener envíos de un lote específico
  async getShipmentsByBatch(req, res) {
    try {
      const { batchId } = req.params;
      console.log(`📦 GET /shipments/batch/${batchId}`);

      const shipments = await Shipment.findAll({
        where: { shipment_batch_id: batchId },
        include: [
          {
            model: Sale,
            as: "venta",
            attributes: [
              "id",
              "numero_venta",
              "fecha",
              "subtotal",
              "descuento_total",
              "costo_envio",
              "total",
              "estado_venta",
              "estado_pago",
              "observaciones",
              "referencia_pago",
            ],
            include: [
              {
                model: Customer,
                as: "cliente",
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
                  "localidad",
                  "provincia",
                  "aclaracion",
                ],
              },
              {
                model: PaymentMethod,
                as: "metodoPago",
                attributes: ["id", "nombre"],
              },
              {
                model: SaleItem,
                as: "items",
                attributes: [
                  "id",
                  "producto_id",
                  "cantidad",
                  "precio_unitario",
                  "descuento_porcentaje",
                  "descuento_monto",
                  "precio_con_descuento",
                  "subtotal",
                ],
                include: [
                  {
                    model: Product,
                    as: "producto",
                    attributes: [
                      "id",
                      "fragancia",
                      "categoria_id",
                      "medida_id",
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: "usuarioActualizador",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
        order: [["id", "ASC"]],
      });

      console.log(
        `✅ ${shipments.length} envíos encontrados para lote ${batchId}`
      );

      res.json({
        status: "success",
        data: shipments,
      });
    } catch (error) {
      console.error("❌ Error obteniendo envíos del lote:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo envíos del lote",
        error: error.message,
      });
    }
  }

  // ==========================================
  // GENERACIÓN DE REPORTES
  // ==========================================

  // GET - Verificar ventas pendientes para reporte
  async checkPendingSales(req, res) {
    try {
      const { fecha } = req.query;

      console.log(
        `🔍 Verificando ventas pendientes para fecha: ${
          fecha || "TODAS LAS FECHAS"
        }`
      );

      let whereCondition = {
        estado_venta: {
          [Op.in]: ["En proceso", "Reprogramado"],
        },
      };

      // Solo agregar filtro de fecha si se proporciona
      if (fecha) {
        const targetDate = new Date(fecha);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        whereCondition.fecha = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }

      const pendingSales = await Sale.count({
        where: whereCondition,
      });

      console.log(
        `✅ ${pendingSales} ventas pendientes encontradas (En proceso + Reprogramado)`
      );

      res.json({
        status: "success",
        data: {
          pending_sales: pendingSales,
          fecha: fecha || "todas_las_fechas",
        },
      });
    } catch (error) {
      console.error("❌ Error verificando ventas pendientes:", error);
      res.status(500).json({
        status: "error",
        message: "Error verificando ventas pendientes",
        error: error.message,
      });
    }
  }

  // GET - Obtener ventas detalladas para reporte
  async getPendingSalesDetailed(req, res) {
    try {
      const { fecha } = req.query;

      console.log(
        `📋 Obteniendo ventas detalladas para fecha: ${
          fecha || "TODAS LAS FECHAS"
        }`
      );

      let whereCondition = {
        estado_venta: {
          [Op.in]: ["En proceso", "Reprogramado"],
        },
      };

      // Solo agregar filtro de fecha si se proporciona
      if (fecha) {
        const targetDate = new Date(fecha);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        whereCondition.fecha = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }

      const sales = await Sale.findAll({
        where: whereCondition,
        include: [
          {
            model: Customer,
            as: "cliente",
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
              "localidad",
              "provincia",
              "aclaracion",
            ],
          },
          {
            model: User,
            as: "usuario",
            attributes: ["id", "first_name", "last_name"],
          },
          {
            model: PaymentMethod,
            as: "metodoPago",
            attributes: ["id", "nombre"],
          },
          {
            model: SaleItem,
            as: "items",
            attributes: [
              "id",
              "producto_id",
              "cantidad",
              "precio_unitario",
              "descuento_porcentaje",
              "subtotal",
            ],
            include: [
              {
                model: Product,
                as: "producto",
                attributes: ["id", "fragancia"],
              },
            ],
          },
        ],
        order: [
          ["fecha", "DESC"],
          ["numero_venta", "DESC"],
        ],
      });

      // Procesar datos para el frontend
      const processedSales = sales.map((sale) => ({
        id: sale.id,
        numero_venta: sale.numero_venta,
        fecha: sale.fecha,
        estado_venta: sale.estado_venta,
        cliente: {
          nombre: `${sale.cliente.nombre} ${sale.cliente.apellido}`.trim(),
          telefono: sale.cliente.telefono,
          email: sale.cliente.email,
          direccion_completa: buildFullAddress(sale.cliente),
        },
        items: sale.items.map((item) => ({
          producto:
            item.producto?.fragancia || `Producto ID: ${item.producto_id}`,
          cantidad: item.cantidad,
        })),
        total: parseFloat(sale.total),
        estado_pago: sale.estado_pago,
        metodo_pago: sale.metodoPago?.nombre || "Sin método",
      }));

      console.log(
        `✅ ${processedSales.length} ventas procesadas (En proceso + Reprogramado)`
      );

      res.json({
        status: "success",
        data: processedSales,
      });
    } catch (error) {
      console.error("❌ Error obteniendo ventas detalladas:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo ventas detalladas",
        error: error.message,
      });
    }
  }

  // POST - Generar reporte de envíos
  async generateShipmentsReport(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { sale_ids, fecha } = req.body;

      console.log(`🚀 Generando reporte de envíos`, {
        sale_ids: sale_ids?.length,
        fecha: fecha || "TODAS LAS FECHAS",
      });

      let salesToProcess;

      if (sale_ids && Array.isArray(sale_ids) && sale_ids.length > 0) {
        salesToProcess = await Sale.findAll({
          where: {
            id: sale_ids,
            estado_venta: {
              [Op.in]: ["En proceso", "Reprogramado"],
            },
          },
          include: [
            {
              model: Customer,
              as: "cliente",
              attributes: [
                "calle",
                "altura",
                "piso",
                "dpto",
                "codigo_postal",
                "localidad",
                "provincia",
                "aclaracion",
              ],
            },
          ],
          transaction,
        });
      } else {
        let whereCondition = {
          estado_venta: {
            [Op.in]: ["En proceso", "Reprogramado"],
          },
        };

        if (fecha) {
          const targetDate = new Date(fecha);
          const startOfDay = new Date(targetDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(targetDate);
          endOfDay.setHours(23, 59, 59, 999);

          whereCondition.fecha = {
            [Op.between]: [startOfDay, endOfDay],
          };
        }

        salesToProcess = await Sale.findAll({
          where: whereCondition,
          include: [
            {
              model: Customer,
              as: "cliente",
              attributes: [
                "nombre",
                "apellido",
                "telefono",
                "calle",
                "altura",
                "piso",
                "dpto",
                "codigo_postal",
                "localidad",
                "provincia",
                "aclaracion",
              ],
            },
          ],
          transaction,
        });
      }

      if (salesToProcess.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "No hay ventas en proceso o reprogramadas para generar reporte",
        });
      }

      // Verificar direcciones incompletas usando buildFullAddress
      const incompleteAddresses = salesToProcess.filter((sale) => {
        const direccionCompleta = buildFullAddress(sale.cliente);
        return (
          !direccionCompleta ||
          direccionCompleta === "Dirección no especificada" ||
          direccionCompleta.trim().length < 10
        );
      });

      if (incompleteAddresses.length > 0) {
        await transaction.rollback();
        return res.status(422).json({
          status: "warning",
          message: `${incompleteAddresses.length} ventas tienen direcciones incompletas`,
          incomplete_addresses: incompleteAddresses.map((sale) => ({
            numero_venta: sale.numero_venta,
            cliente_nombre: `${sale.cliente?.nombre || ""} ${
              sale.cliente?.apellido || ""
            }`.trim(),
            telefono: sale.cliente?.telefono || "",
            direccion_actual: buildFullAddress(sale.cliente),
          })),
        });
      }

      // Generar ID de lote y nombre de archivo
      const batchId = await Shipment.generateBatchId();
      const filename = `${batchId}.html`; // Cambiado a HTML

      console.log(
        `📦 Creando lote: ${batchId} con ${salesToProcess.length} ventas`
      );

      // Crear envíos para cada venta
      const shipments = [];
      for (const sale of salesToProcess) {
        const shipment = await Shipment.create(
          {
            shipment_batch_id: batchId,
            venta_id: sale.id,
            pdf_filename: filename, // Mantener nombre de columna para compatibilidad
            estado_entrega: "Pendiente",
            estado_pago_real: "Pendiente",
          },
          { transaction }
        );

        shipments.push(shipment);

        // Actualizar estado de la venta a "Enviado"
        await sale.update(
          {
            estado_venta: "Enviado",
          },
          { transaction }
        );
      }

      // Calcular total de items
      const totalItems = await SaleItem.sum("cantidad", {
        where: {
          venta_id: salesToProcess.map((sale) => sale.id),
        },
        transaction,
      });

      await transaction.commit();

      console.log(`✅ Lote ${batchId} creado exitosamente`);

      res.status(201).json({
        status: "success",
        message: `Lote de envío creado exitosamente`,
        data: {
          batch_id: batchId,
          filename: filename,
          sales_processed: shipments.length,
          total_items: totalItems || 0,
          fecha_envio: new Date().toISOString(),
          shipments: shipments.map((s) => ({
            id: s.id,
            venta_id: s.venta_id,
          })),
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error generando reporte de envíos:", error);
      res.status(500).json({
        status: "error",
        message: "Error generando reporte de envíos",
        error: error.message,
      });
    }
  }

  // ==========================================
  // 🆕 VISUALIZACIÓN HTML (REEMPLAZA PDF)
  // ==========================================

  // 🆕 GET - Generar y mostrar HTML imprimible para un lote
  async viewBatchHTML(req, res) {
    try {
      const { batchId } = req.params;

      console.log(`📄 Generando HTML para lote: ${batchId}`);

      // Obtener datos del lote
      const shipments = await Shipment.findAll({
        where: { shipment_batch_id: batchId },
        include: [
          {
            model: Sale,
            as: "venta",
            attributes: [
              "id",
              "numero_venta",
              "fecha",
              "total",
              "estado_venta",
              "estado_pago",
            ],
            include: [
              {
                model: Customer,
                as: "cliente",
                attributes: [
                  "nombre",
                  "apellido",
                  "telefono",
                  "email",
                  "calle",
                  "altura",
                  "piso",
                  "dpto",
                  "codigo_postal",
                  "localidad",
                  "provincia",
                  "aclaracion",
                ],
              },
              {
                model: PaymentMethod,
                as: "metodoPago",
                attributes: ["nombre"],
              },
              {
                model: SaleItem,
                as: "items",
                attributes: ["cantidad", "precio_unitario", "subtotal"],
                include: [
                  {
                    model: Product,
                    as: "producto",
                    attributes: ["fragancia"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      if (shipments.length === 0) {
        return res.status(404).send(`
          <html>
            <head><title>Lote no encontrado</title></head>
            <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
              <h1>Lote no encontrado</h1>
              <p>No se encontraron envíos para el lote <strong>${batchId}</strong></p>
              <button onclick="window.close()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Cerrar
              </button>
            </body>
          </html>
        `);
      }

      // 🎯 GENERAR HTML COMPLETO CON CSS PARA IMPRESIÓN
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lote de Envío - ${batchId}</title>
          <style>
            /* 🎯 ESTILOS PARA PANTALLA */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background-color: #f5f5f5;
              padding: 20px;
            }
            
            .container {
              max-width: 1000px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #333;
            }
            
            .header .info {
              font-size: 14px;
              color: #666;
            }
            
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #007bff;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0,123,255,0.3);
            }
            
            .print-button:hover {
              background: #0056b3;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            
            .table th {
              background: #f8f9fa;
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 11px;
            }
            
            .table td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              font-size: 10px;
              vertical-align: top;
            }
            
            .table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            .table tr:hover {
              background-color: #f0f8ff;
            }
            
            .productos {
              font-size: 9px;
              color: #666;
              font-style: italic;
              margin-top: 5px;
            }
            
            .monto {
              font-weight: bold;
              color: #007bff;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            
            /* 🎯 ESTILOS ESPECÍFICOS PARA IMPRESIÓN */
            @media print {
              body {
                background: white !important;
                padding: 0 !important;
                font-size: 11px !important;
              }
              
              .container {
                max-width: none !important;
                padding: 15px !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              
              .print-button {
                display: none !important;
              }
              
              .header h1 {
                font-size: 20px !important;
              }
              
              .table th {
                background: #f0f0f0 !important;
                font-size: 10px !important;
                padding: 8px 6px !important;
              }
              
              .table td {
                font-size: 9px !important;
                padding: 6px 4px !important;
              }
              
              .productos {
                font-size: 8px !important;
              }
              
              /* Evitar saltos de página dentro de las filas */
              .table tr {
                page-break-inside: avoid;
              }
              
              /* Repetir encabezados en cada página */
              .table thead {
                display: table-header-group;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Botón de impresión -->
            <button class="print-button" onclick="window.print()">
              🖨️ Imprimir
            </button>
            
            <!-- Encabezado -->
            <div class="header">
              <h1>LOTE DE ENVÍO</h1>
              <div class="info">
                <strong>Lote:</strong> ${batchId}<br>
                <strong>Fecha:</strong> ${new Date().toLocaleDateString(
                  "es-ES"
                )}<br>
                <strong>Total de envíos:</strong> ${shipments.length}
              </div>
            </div>
            
            <!-- Tabla de envíos -->
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 5%">N°</th>
                  <th style="width: 12%">Venta</th>
                  <th style="width: 20%">Cliente</th>
                  <th style="width: 12%">Teléfono</th>
                  <th style="width: 35%">Dirección</th>
                  <th style="width: 16%">Monto</th>
                </tr>
              </thead>
              <tbody>
                ${shipments
                  .map((shipment, index) => {
                    const venta = shipment.venta;
                    const cliente = venta?.cliente;
                    const items = venta?.items || [];

                    const direccion = buildFullAddress(cliente);
                    const nombreCompleto =
                      `${cliente?.nombre || ""} ${
                        cliente?.apellido || ""
                      }`.trim() || "Sin nombre";
                    const telefono = cliente?.telefono || "";

                    const metodoPago =
                      venta?.metodoPago?.nombre || "No especificado";
                    let monto = "";
                    if (
                      metodoPago === "Efectivo" ||
                      metodoPago === "Contraentrega"
                    ) {
                      monto = `$${parseFloat(venta.total || 0).toLocaleString(
                        "es-ES"
                      )}`;
                    } else {
                      monto = "Pagado";
                    }

                    const productos =
                      items
                        .map(
                          (item) =>
                            `${item.cantidad}x ${
                              item.producto?.fragancia || "Producto"
                            }`
                        )
                        .join(", ") || "Sin productos";

                    return `
                    <tr>
                      <td style="text-align: center;">${index + 1}</td>
                      <td><strong>${venta?.numero_venta || "N/A"}</strong></td>
                      <td>
                        <strong>${nombreCompleto}</strong>
                        <div class="productos">Productos: ${productos}</div>
                      </td>
                      <td>${telefono}</td>
                      <td>${direccion}</td>
                      <td class="monto">
                        <strong>${monto}</strong><br>
                        <small>${metodoPago}</small>
                      </td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
            
            <!-- Pie de página -->
            <div class="footer">
              <p>Generado el ${new Date().toLocaleString("es-ES")}</p>
              <p>Sistema de Gestión de Envíos</p>
            </div>
          </div>
          
          <script>
            // Auto-focus para impresión rápida con Ctrl+P
            document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
              }
            });
            
            // Mensaje de confirmación al cerrar
            window.addEventListener('beforeunload', function(e) {
              // No mostrar confirmación si viene de impresión
              if (document.hidden) return;
            });
          </script>
        </body>
        </html>
      `;

      // Configurar headers para HTML
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");

      // Enviar HTML
      res.send(htmlContent);

      console.log(`✅ HTML generado exitosamente para lote: ${batchId}`);
    } catch (error) {
      console.error("❌ Error generando HTML:", error);
      res.status(500).send(`
        <html>
          <head><title>Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #e74c3c;">Error generando reporte</h1>
            <p>No se pudo generar el reporte para el lote <strong>${req.params.batchId}</strong></p>
            <p style="color: #7f8c8d;">Error: ${error.message}</p>
            <button onclick="window.close()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Cerrar
            </button>
          </body>
        </html>
      `);
    }
  }

  async generateBatchLabels(req, res) {
    try {
      const { batchId } = req.params;

      console.log(`🏷️ Generando etiquetas para lote: ${batchId}`);

      // 🔧 MODIFICAR: Incluir los productos en la consulta
      const shipments = await Shipment.findAll({
        where: { shipment_batch_id: batchId },
        include: [
          {
            model: Sale,
            as: "venta",
            attributes: [
              "id",
              "numero_venta",
              "fecha",
              "total",
              "estado_venta",
              "estado_pago",
            ],
            include: [
              {
                model: Customer,
                as: "cliente",
                attributes: [
                  "nombre",
                  "apellido",
                  "telefono",
                  "email",
                  "calle",
                  "altura",
                  "piso",
                  "dpto",
                  "codigo_postal",
                  "localidad",
                  "provincia",
                  "aclaracion",
                ],
              },
              {
                model: PaymentMethod,
                as: "metodoPago",
                attributes: ["nombre"],
              },
              // 🆕 AGREGAR: Los items con productos
              {
                model: SaleItem,
                as: "items",
                attributes: ["cantidad", "precio_unitario", "subtotal"],
                include: [
                  {
                    model: Product,
                    as: "producto",
                    attributes: ["id", "fragancia", "caracteristicas"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      if (shipments.length === 0) {
        return res.status(404).send(`
        <html>
          <head><title>Lote no encontrado</title></head>
          <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
            <h1>Lote no encontrado</h1>
            <p>No se encontraron envíos para el lote <strong>${batchId}</strong></p>
            <button onclick="window.close()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Cerrar
            </button>
          </body>
        </html>
      `);
      }

      // 2. Formatear datos para etiquetas CON PRODUCTOS
      const labels = shipments.map((shipment) => {
        const sale = shipment.venta;
        const cliente = sale.cliente;

        // 🆕 OBTENER TODOS los productos de la venta (en varias líneas)
        let productInfo = "Sin productos especificados";

        try {
          if (
            sale.items &&
            Array.isArray(sale.items) &&
            sale.items.length > 0
          ) {
            // 🔄 CAMBIO: Mostrar TODOS los productos en líneas separadas
            productInfo = sale.items
              .map((item) => {
                const cantidad = item.cantidad || 1;
                const nombreProducto = item.producto?.fragancia || "Producto";
                return `${cantidad}x ${nombreProducto}`;
              })
              .join("<br>"); // 🔄 USAR <br> para saltos de línea en HTML
          } else {
            productInfo = "Productos no especificados";
          }
        } catch (error) {
          console.warn(
            `⚠️ Error obteniendo productos para venta ${sale.numero_venta}:`,
            error
          );
          productInfo = "Error cargando productos";
        }

        return {
          saleNumber: sale.numero_venta,
          saleDate: new Date(sale.fecha).toLocaleDateString("es-ES"),
          shipmentDate: new Date(shipment.fecha_envio).toLocaleDateString(
            "es-ES"
          ),
          customerName:
            `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() ||
            "Cliente no especificado",
          customerPhone: cliente.telefono || "Sin teléfono",
          customerAddress: buildFullAddress(cliente),
          isPaid:
            sale.estado_pago === "Pagado" ||
            shipment.estado_pago_real === "Pagado",
          amountToPay: `$${parseFloat(sale.total || 0).toLocaleString(
            "es-ES"
          )}`,
          rawAmount: parseFloat(sale.total || 0),
          productInfo: productInfo, // 🆕 Productos incluidos
        };
      });

      // 🆕 AGREGAR logs para debug
      console.log(`🔍 Debug productos para lote ${batchId}:`);
      labels.slice(0, 3).forEach((label, index) => {
        console.log(
          `  Etiqueta ${index + 1}: ${label.saleNumber} -> ${label.productInfo}`
        );
      });

      // 3. Organizar en páginas (6 etiquetas por página)
      const pages = [];
      for (let i = 0; i < labels.length; i += 6) {
        const pageLabels = labels.slice(i, i + 6);
        // Rellenar con nulls para completar la grilla si es necesario
        while (pageLabels.length < 6) {
          pageLabels.push(null);
        }
        pages.push({ labels: pageLabels });
      }

      // 4. Generar HTML completo con las etiquetas
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Etiquetas de Envío - Lote ${batchId}</title>
          <style>
              @page {
                  size: A4;
                  margin: 10mm;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
              }
              
              * {
                  box-sizing: border-box;
              }
              
              body {
                  font-family: Arial, Helvetica, sans-serif;
                  margin: 0;
                  padding: 0;
                  background: white;
                  color: black;
                  font-size: 14px;
              }
              
              .page {
                  width: 210mm;
                  height: 297mm;
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  grid-template-rows: repeat(3, 1fr);
                  gap: 3mm;
                  page-break-after: always;
                  padding: 5mm;
              }
              
              .page:last-child {
                  page-break-after: avoid;
              }
              
              .label {
                  width: 95mm;
                  height: 90mm;
                  border: 2px solid #000;
                  padding: 3mm;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  background: white;
                  position: relative;
              }
              
              .label-empty {
                  border: 1px dashed #ccc;
                  background: #f9f9f9;
              }
              
              .label-header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 2mm;
                  margin-bottom: 3mm;
              }
              
              .sale-number {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 1mm;
                  letter-spacing: 1px;
              }
              
              .dates {
                  font-size: 10px;
                  line-height: 1.3;
                  color: #333;
              }
              
              .date-line {
                  margin-bottom: 1mm;
              }
              
              .customer-info {
                  flex-grow: 1;
                  margin-bottom: 2mm;
              }
              
              .customer-name {
                  font-size: 15px;
                  font-weight: bold;
                  margin-bottom: 2mm;
                  text-transform: uppercase;
                  border-bottom: 1px solid #ccc;
                  padding-bottom: 1mm;
                  display: flex; /* 🆕 Flexbox para alinear nombre y teléfono */
                  justify-content: space-between; /* 🆕 Espacio entre nombre y teléfono */
                  align-items: center; /* 🆕 Centrado vertical */
              }
              
              .customer-name-text {
                  flex: 1; /* 🆕 El nombre toma el espacio disponible */
                  margin-right: 2mm; /* 🆕 Espacio entre nombre y teléfono */
              }
              
              .customer-phone-inline {
                  font-size: 11px; /* 🆕 Ligeramente más pequeño que el nombre */
                  font-weight: normal; /* 🆕 Peso normal (no bold) */
                  text-transform: none; /* 🆕 Sin mayúsculas */
                  color: #666; /* 🆕 Color más suave */
                  white-space: nowrap; /* 🆕 No romper línea */
              }
              
              /* 🔧 ELIMINAR el estilo del teléfono separado ya que ahora va inline */
              .customer-phone {
                  display: none; /* 🆕 Ocultar el teléfono separado */
              }
              
              .phone-icon {
                  font-weight: bold;
              }
              
              .customer-address {
                  font-size: 11px;
                  line-height: 1.4;
                  margin-bottom: 2mm;
                  padding: 2mm;
                  border: 1px solid #ddd;
                  border-radius: 2mm;
                  background: #f9f9f9;
                  min-height: 10mm;
              }
              
              .address-icon {
                  font-weight: bold;
                  margin-bottom: 1mm;
                  display: block;
              }

              .product-info {
                  font-size: 10px;
                  line-height: 1.4; /* 🔄 AUMENTADO para mejor espaciado */
                  margin-bottom: 2mm;
                  padding: 1.5mm;
                  border: 1px solid #ddd;
                  border-radius: 2mm;
                  background: #f0f8ff;
                  color: #2c3e50;
                  min-height: 15mm; /* 🔄 AUMENTADO para acomodar más productos */
                  max-height: 25mm; /* 🆕 MÁXIMO para no desbalancear la etiqueta */
                  overflow-y: auto; /* 🆕 SCROLL si hay demasiados productos */
              }

              .product-icon {
                  font-weight: bold;
                  margin-bottom: 1mm;
                  display: block;
              }
              
              .payment-info {
                  text-align: center;
                  padding: 2mm;
                  border: 2px solid #000;
                  font-size: 13px;
                  font-weight: bold;
                  margin-top: auto;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5mm;
              }
              
              .payment-paid {
                  background-color: #e8f5e8;
                  border-color: #16a34a;
                  color: #16a34a;
              }
              
              .payment-pending {
                  background-color: #fff3cd;
                  border-color: #f59e0b;
                  color: #d97706;
              }
              
              .payment-amount {
                  font-size: 13px;
                  font-weight: bold;
              }
              
              @media print {
                  body {
                      margin: 0;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
                  
                  .page {
                      page-break-after: always;
                      margin: 0;
                  }
                  
                  .page:last-child {
                      page-break-after: avoid;
                  }
                  
                  .label {
                      break-inside: avoid;
                  }
                  
                  .payment-paid,
                  .payment-pending,
                  .customer-address,
                  .product-info {
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
                  
                  .header-info {
                      display: none !important;
                  }
              }
              
              @media screen and (max-width: 1200px) {
                  .page {
                      transform: scale(0.7);
                      transform-origin: top left;
                      margin-bottom: 60mm;
                  }
              }
              
              @media screen and (max-width: 800px) {
                  .page {
                      grid-template-columns: 1fr;
                      grid-template-rows: repeat(6, 1fr);
                      transform: scale(0.5);
                  }
              }
          </style>
      </head>
      <body>
          <!-- HEADER INFORMATIVO -->
          <div class="header-info" style="text-align: center; padding: 10mm 0; border-bottom: 1px solid #ccc; margin-bottom: 5mm;">
              <h1 style="margin: 0; font-size: 20px; color: #333;">
                  🏷️ Etiquetas de Envío - Lote ${batchId}
              </h1>
              <p style="margin: 5mm 0 0 0; font-size: 14px; color: #666;">
                  Total de etiquetas: ${labels.length} | Páginas: ${
        pages.length
      } | 
                  Generado: ${new Date().toLocaleString("es-ES")}
              </p>
              <p style="margin: 2mm 0 0 0; font-size: 12px; color: #999;">
                  Presiona <strong>Ctrl+P</strong> para imprimir | 6 etiquetas por página (95x90mm)
              </p>
          </div>

          <!-- PÁGINAS DE ETIQUETAS -->
          ${pages
            .map(
              (page) => `
          <div class="page">
              ${page.labels
                .map((label) => {
                  if (label) {
                    return `
                  <div class="label">
                      <!-- Header de la etiqueta -->
                      <div class="label-header">
                          <div class="sale-number">${label.saleNumber}</div>
                          <div class="dates">
                              <div class="date-line"><strong>Venta:</strong> ${
                                label.saleDate
                              }</div>
                              <div class="date-line"><strong>Envío:</strong> ${
                                label.shipmentDate
                              }</div>
                          </div>
                      </div>
                      
                      <!-- Información del cliente -->
                      <div class="customer-info">
                          <div class="customer-name">
                              <span class="customer-name-text">${
                                label.customerName
                              }</span>
                              <span class="customer-phone-inline">📞 ${
                                label.customerPhone
                              }</span>
                          </div>
                          
                          <div class="customer-address">
                              <span class="address-icon">📍 Dirección:</span>
                              ${label.customerAddress}
                          </div>
                          
                          <div class="product-info">
                              <span class="product-icon">📦 Productos:</span>
                              <div style="margin-top: 1mm;">${
                                label.productInfo
                              }</div>
                          </div>
                      </div>
                      
                      <!-- Información de pago -->
                      <div class="payment-info ${
                        label.isPaid ? "payment-paid" : "payment-pending"
                      }">
                          ${
                            label.isPaid
                              ? "✅ PAGADO"
                              : `<span>💰 A PAGAR</span><span class="payment-amount">${label.amountToPay}</span>`
                          }
                      </div>
                  </div>
                  `;
                  } else {
                    return `
                  <div class="label label-empty">
                      <!-- Espacio vacío -->
                  </div>
                  `;
                  }
                })
                .join("")}
          </div>
          `
            )
            .join("")}

          <script>
              window.focus();
              
              console.log('🏷️ Etiquetas cargadas:', {
                  batchId: '${batchId}',
                  totalLabels: ${labels.length},
                  totalPages: ${pages.length},
                  etiquetasPorPagina: 6,
                  tamañoEtiqueta: '95x90mm',
                  conProductos: true,
                  timestamp: new Date().toISOString()
              });
              
              // Atajos de teclado
              document.addEventListener('keydown', function(e) {
                  if (e.ctrlKey && e.key === 'p') {
                      e.preventDefault();
                      window.print();
                  }
                  
                  if (e.key === 'Escape') {
                      window.close();
                  }
              });
              
              console.log('🔧 Instrucciones:');
              console.log('  - Ctrl+P: Imprimir etiquetas');
              console.log('  - Escape: Cerrar ventana');
              console.log('  - Configuración: 6 etiquetas de 95x90mm por página A4');
              console.log('  - Incluye: Cliente, dirección, productos y estado de pago');
          </script>
      </body>
      </html>
    `;

      // Configurar headers para HTML
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");

      // Enviar HTML
      res.send(htmlContent);

      console.log(
        `✅ Etiquetas generadas exitosamente para lote: ${batchId} (${labels.length} etiquetas)`
      );
    } catch (error) {
      console.error("❌ Error generando etiquetas:", error);
      res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
          <h1 style="color: #e74c3c;">Error generando etiquetas</h1>
          <p>No se pudieron generar las etiquetas para el lote <strong>${req.params.batchId}</strong></p>
          <p style="color: #7f8c8d;">Error: ${error.message}</p>
          <button onclick="window.close()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cerrar
          </button>
        </body>
        </html>
    `);
    }
  } // ACTUALIZACIÓN DE ESTADOS
  // ==========================================

  // PUT - Actualizar estado de un envío específico
  async updateShipmentStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const { estado_entrega, estado_pago_real, observaciones_distribuidor } =
        req.body;

      console.log(`🔄 Actualizando envío ${id}:`, {
        estado_entrega,
        estado_pago_real,
      });

      const shipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Sale,
            as: "venta",
          },
        ],
        transaction,
      });

      if (!shipment) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Envío no encontrado",
        });
      }

      // Actualizar el envío
      const updateData = {
        fecha_actualizacion: new Date(),
        actualizado_por: req.user?.id || 1,
      };

      if (estado_entrega !== undefined)
        updateData.estado_entrega = estado_entrega;
      if (estado_pago_real !== undefined)
        updateData.estado_pago_real = estado_pago_real;
      if (observaciones_distribuidor !== undefined)
        updateData.observaciones_distribuidor = observaciones_distribuidor;

      await shipment.update(updateData, { transaction });

      // 🎯 ACTUALIZAR LA VENTA ORIGINAL
      const venta = shipment.venta;
      const ventaUpdateData = {};

      // Actualizar estado de entrega en la venta
      if (estado_entrega === "Entregado") {
        ventaUpdateData.estado_venta = "Entregado";
      } else if (estado_entrega === "Cancelado") {
        ventaUpdateData.estado_venta = "Cancelado";
      } else if (estado_entrega === "Reprogramado") {
        ventaUpdateData.estado_venta = "Reprogramado";
      }

      // Actualizar estado de pago en la venta
      if (estado_pago_real === "Pagado") {
        ventaUpdateData.estado_pago = "Pagado";
      } else if (estado_pago_real === "Rechazado") {
        ventaUpdateData.estado_pago = "Pendiente";
      }

      // Aplicar cambios a la venta si hay alguno
      if (Object.keys(ventaUpdateData).length > 0) {
        await venta.update(ventaUpdateData, { transaction });
        console.log(
          `🔄 Venta ${venta.numero_venta} actualizada:`,
          ventaUpdateData
        );
      }

      await transaction.commit();

      // Recargar el envío con sus relaciones
      const updatedShipment = await Shipment.findByPk(id, {
        include: [
          {
            model: Sale,
            as: "venta",
            include: [
              {
                model: Customer,
                as: "cliente",
                attributes: ["id", "nombre", "apellido", "telefono"],
              },
            ],
          },
          {
            model: User,
            as: "usuarioActualizador",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });

      console.log(`✅ Envío ${id} actualizado exitosamente`);

      res.json({
        status: "success",
        message: "Estado de envío actualizado exitosamente",
        data: updatedShipment,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error actualizando estado de envío:", error);
      res.status(500).json({
        status: "error",
        message: "Error actualizando estado de envío",
        error: error.message,
      });
    }
  }

  // PUT - Actualizar múltiples envíos de un lote
  async updateBatchStatus(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { batchId } = req.params;
      const { updates } = req.body; // Array de { shipment_id, estado_entrega, estado_pago_real, observaciones }

      console.log(
        `🔄 Actualizando lote ${batchId} con ${updates?.length} cambios`
      );

      if (!Array.isArray(updates) || updates.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Se requiere un array de actualizaciones",
        });
      }

      const results = [];

      for (const update of updates) {
        const {
          shipment_id,
          estado_entrega,
          estado_pago_real,
          observaciones_distribuidor,
        } = update;

        const shipment = await Shipment.findOne({
          where: {
            id: shipment_id,
            shipment_batch_id: batchId,
          },
          include: [{ model: Sale, as: "venta" }],
          transaction,
        });

        if (shipment) {
          // Actualizar shipment
          const updateData = {
            fecha_actualizacion: new Date(),
            actualizado_por: req.user?.id || 1,
          };

          if (estado_entrega !== undefined)
            updateData.estado_entrega = estado_entrega;
          if (estado_pago_real !== undefined)
            updateData.estado_pago_real = estado_pago_real;
          if (observaciones_distribuidor !== undefined)
            updateData.observaciones_distribuidor = observaciones_distribuidor;

          await shipment.update(updateData, { transaction });

          // Actualizar venta relacionada
          const venta = shipment.venta;
          const ventaUpdateData = {};

          if (estado_entrega === "Entregado")
            ventaUpdateData.estado_venta = "Entregado";
          else if (estado_entrega === "Cancelado")
            ventaUpdateData.estado_venta = "Cancelado";
          else if (estado_entrega === "Reprogramado")
            ventaUpdateData.estado_venta = "Reprogramado";

          if (estado_pago_real === "Pagado")
            ventaUpdateData.estado_pago = "Pagado";
          else if (estado_pago_real === "Rechazado")
            ventaUpdateData.estado_pago = "Pendiente";

          if (Object.keys(ventaUpdateData).length > 0) {
            await venta.update(ventaUpdateData, { transaction });
          }

          results.push({
            shipment_id,
            status: "updated",
            numero_venta: venta.numero_venta,
          });
        } else {
          results.push({
            shipment_id,
            status: "not_found",
          });
        }
      }

      await transaction.commit();

      console.log(
        `✅ Lote ${batchId} actualizado: ${
          results.filter((r) => r.status === "updated").length
        } envíos`
      );

      res.json({
        status: "success",
        message: `${
          results.filter((r) => r.status === "updated").length
        } envíos actualizados`,
        data: {
          batch_id: batchId,
          results,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error actualizando lote de envíos:", error);
      res.status(500).json({
        status: "error",
        message: "Error actualizando lote de envíos",
        error: error.message,
      });
    }
  }

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  // GET - Estadísticas de envíos
  async getShipmentStats(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;

      console.log(`📊 Obteniendo estadísticas de envíos`);

      const whereConditions = {};
      if (fecha_desde || fecha_hasta) {
        whereConditions.fecha_envio = {};
        if (fecha_desde)
          whereConditions.fecha_envio[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta)
          whereConditions.fecha_envio[Op.lte] = new Date(
            fecha_hasta + " 23:59:59"
          );
      }

      const stats = await Shipment.findAll({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "total_envios"],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_entrega = 'Entregado' THEN 1 ELSE 0 END"
              )
            ),
            "entregados",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_entrega = 'Pendiente' THEN 1 ELSE 0 END"
              )
            ),
            "pendientes",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_entrega = 'No encontrado' THEN 1 ELSE 0 END"
              )
            ),
            "no_encontrados",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN estado_pago_real = 'Pagado' THEN 1 ELSE 0 END"
              )
            ),
            "pagados",
          ],
          [
            sequelize.fn(
              "COUNT",
              sequelize.literal("DISTINCT shipment_batch_id")
            ),
            "total_lotes",
          ],
        ],
        where: whereConditions,
      });

      console.log(`✅ Estadísticas generadas`);

      res.json({
        status: "success",
        data: stats[0],
      });
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas de envíos:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo estadísticas",
        error: error.message,
      });
    }
  }

  // ==========================================
  // MÉTODOS AUXILIARES (OPCIONAL)
  // ==========================================

  // GET - Health check del módulo de envíos
  async healthCheck(req, res) {
    try {
      // Verificar conexión a la base de datos
      const testQuery = await Shipment.count();

      res.json({
        status: "success",
        message: "Módulo de envíos funcionando correctamente",
        data: {
          total_shipments: testQuery,
          timestamp: new Date().toISOString(),
          features: ["HTML Reports", "Batch Management", "Status Updates"],
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error en health check",
        error: error.message,
      });
    }
  }
}

console.log("✅ ShipmentController creado correctamente");
module.exports = new ShipmentController();
