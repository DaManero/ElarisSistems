const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

class ReportController {
  // GET - Get pending sales with detailed information for preview
  async getPendingSalesDetailed(req, res) {
    try {
      console.log("📋 Obteniendo ventas pendientes detalladas...");

      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      const salesInProcess = await Sale.findAll({
        where: {
          estado_venta: "En proceso",
          fecha: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
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
              "aclaracion",
              "provincia",
              "localidad",
            ],
          },
          {
            model: SaleItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "producto",
                attributes: ["id", "fragancia", "caracteristicas"],
              },
            ],
          },
        ],
        order: [["numero_venta", "ASC"]],
      });

      console.log(`📊 Ventas pendientes encontradas: ${salesInProcess.length}`);

      // Formatear datos para el frontend
      const formattedSales = salesInProcess.map((sale) => {
        // Construir dirección completa
        let direccionCompleta = `${sale.cliente.calle} ${sale.cliente.altura}`;
        if (sale.cliente.piso)
          direccionCompleta += `, Piso ${sale.cliente.piso}`;
        if (sale.cliente.dpto)
          direccionCompleta += `, Dpto ${sale.cliente.dpto}`;
        direccionCompleta += ` - CP: ${sale.cliente.codigo_postal} - ${sale.cliente.localidad}, ${sale.cliente.provincia}`;
        if (sale.cliente.aclaracion)
          direccionCompleta += ` (${sale.cliente.aclaracion})`;

        return {
          id: sale.id,
          numero_venta: sale.numero_venta,
          fecha: sale.fecha,
          cliente: {
            id: sale.cliente.id,
            nombre: `${sale.cliente.nombre} ${sale.cliente.apellido}`,
            telefono: sale.cliente.telefono,
            email: sale.cliente.email || "No registrado",
            direccion_completa: direccionCompleta,
          },
          items: sale.items.map((item) => ({
            id: item.id,
            producto: item.producto.fragancia,
            cantidad: item.cantidad,
            precio_unitario: parseFloat(item.precio_unitario),
            subtotal: parseFloat(item.subtotal),
          })),
          subtotal: parseFloat(sale.subtotal),
          descuento_total: parseFloat(sale.descuento_total),
          costo_envio: parseFloat(sale.costo_envio),
          total: parseFloat(sale.total),
          estado_pago: sale.estado_pago,
          metodo_pago: sale.metodoPago?.nombre || "No especificado",
          observaciones: sale.observaciones,
        };
      });

      res.json({
        status: "success",
        data: formattedSales,
        total: formattedSales.length,
        date: today.toLocaleDateString("es-AR"),
      });
    } catch (error) {
      console.error("❌ Error obteniendo ventas pendientes detalladas:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo ventas pendientes",
        error: error.message,
      });
    }
  }

  // POST - Generate shipments report for distributor (MODIFICADO para aceptar IDs específicos)
  async generateShipmentsReport(req, res) {
    const transaction = await sequelize.transaction();

    try {
      console.log("📦 Iniciando generación de reporte de envíos...");

      const { sale_ids } = req.body; // 🆕 IDs específicos de ventas a procesar

      // 1️⃣ Obtener ventas "En proceso" del día
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      console.log(
        `🔍 Buscando ventas del ${startOfDay.toLocaleDateString()} al ${endOfDay.toLocaleDateString()}`
      );

      let whereConditions = {
        estado_venta: "En proceso",
        fecha: {
          [Op.between]: [startOfDay, endOfDay],
        },
      };

      // 🆕 Si se especifican IDs, filtrar solo esas ventas
      if (sale_ids && Array.isArray(sale_ids) && sale_ids.length > 0) {
        whereConditions.id = { [Op.in]: sale_ids };
        console.log(`🎯 Procesando ventas específicas: ${sale_ids.join(", ")}`);
      }

      const salesInProcess = await Sale.findAll({
        where: whereConditions,
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
              "aclaracion",
              "provincia",
              "localidad",
            ],
          },
          {
            model: SaleItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "producto",
                attributes: ["id", "fragancia", "caracteristicas"],
              },
            ],
          },
        ],
        order: [["numero_venta", "ASC"]],
        transaction,
      });

      console.log(`📊 Ventas encontradas: ${salesInProcess.length}`);

      if (salesInProcess.length === 0) {
        await transaction.rollback();
        return res.json({
          status: "info",
          message: "No hay ventas seleccionadas para generar reporte",
          data: {
            sales_count: 0,
            date_searched: today.toLocaleDateString("es-AR"),
          },
        });
      }

      // 2️⃣ Validar direcciones completas
      const incompleteAddresses = [];
      for (const sale of salesInProcess) {
        const cliente = sale.cliente;
        if (
          !cliente.calle ||
          !cliente.altura ||
          !cliente.codigo_postal ||
          !cliente.localidad ||
          !cliente.provincia
        ) {
          incompleteAddresses.push({
            numero_venta: sale.numero_venta,
            cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
            telefono: cliente.telefono,
            direccion_actual: `${cliente.calle || "SIN CALLE"} ${
              cliente.altura || "SIN ALTURA"
            } - ${cliente.codigo_postal || "SIN CP"} - ${
              cliente.localidad || "SIN LOCALIDAD"
            }, ${cliente.provincia || "SIN PROVINCIA"}`,
          });
        }
      }

      if (incompleteAddresses.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          status: "warning",
          message: `Hay ${incompleteAddresses.length} cliente(s) con direcciones incompletas. Corrígelas antes de generar el reporte.`,
          incomplete_addresses: incompleteAddresses,
        });
      }

      // 3️⃣ Preparar datos para Excel con agrupación por venta
      const excelData = [];
      const salesGroups = []; // Para trackear rangos de merge
      let currentRow = 2; // Empezar después del header
      let totalItems = 0;

      for (const sale of salesInProcess) {
        const saleStartRow = currentRow;

        // Construir dirección completa
        let direccionCompleta = `${sale.cliente.calle} ${sale.cliente.altura}`;
        if (sale.cliente.piso)
          direccionCompleta += `, Piso ${sale.cliente.piso}`;
        if (sale.cliente.dpto)
          direccionCompleta += `, Dpto ${sale.cliente.dpto}`;
        direccionCompleta += ` - CP: ${sale.cliente.codigo_postal} - ${sale.cliente.localidad}, ${sale.cliente.provincia}`;
        if (sale.cliente.aclaracion)
          direccionCompleta += ` (${sale.cliente.aclaracion})`;

        const importePendiente =
          sale.estado_pago === "Pagado" ? 0 : parseFloat(sale.total);
        const nombreCliente = `${sale.cliente.nombre} ${sale.cliente.apellido}`;

        for (let itemIndex = 0; itemIndex < sale.items.length; itemIndex++) {
          const item = sale.items[itemIndex];
          totalItems++;

          excelData.push({
            numero_venta: sale.numero_venta,
            fecha_venta: sale.fecha.toLocaleDateString("es-AR"),
            nombre_cliente: nombreCliente,
            telefono_cliente: sale.cliente.telefono,
            direccion_completa: direccionCompleta,
            importe_pendiente: importePendiente,
            nombre_producto: item.producto.fragancia,
            cantidad: item.cantidad,
            observaciones_distribuidor: "",
          });

          currentRow++;
        }

        // Guardar información para merge de celdas
        const saleEndRow = currentRow - 1;
        if (sale.items.length > 1) {
          salesGroups.push({
            startRow: saleStartRow,
            endRow: saleEndRow,
            itemCount: sale.items.length,
          });
        }
      }

      console.log(`📋 Items totales a procesar: ${totalItems}`);

      // 4️⃣ Crear carpeta si no existe
      const reportsDir = path.join(process.cwd(), "reports");
      const shipmentsDir = path.join(reportsDir, "shipments");

      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      if (!fs.existsSync(shipmentsDir)) {
        fs.mkdirSync(shipmentsDir, { recursive: true });
      }

      // 5️⃣ Generar archivo Excel
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .split(".")[0];
      const filename = `envios_distribuidor_${timestamp}.xlsx`;
      const filepath = path.join(shipmentsDir, filename);

      console.log(`📄 Generando archivo: ${filename}`);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Envíos del Día");

      // Configurar columnas con mejor orden y ancho optimizado
      worksheet.columns = [
        { header: "Nº Venta", key: "numero_venta", width: 15 },
        { header: "Fecha", key: "fecha_venta", width: 10 },
        { header: "Cliente", key: "nombre_cliente", width: 20 },
        { header: "Teléfono", key: "telefono_cliente", width: 12 },
        { header: "Dirección Completa", key: "direccion_completa", width: 25 }, // 🎯 Ancho reducido
        { header: "Importe Pendiente", key: "importe_pendiente", width: 15 },
        { header: "Producto", key: "nombre_producto", width: 20 },
        { header: "Cantidad", key: "cantidad", width: 8 },
        {
          header: "Observaciones Distribuidor",
          key: "observaciones_distribuidor",
          width: 25,
        },
      ];

      // Agregar filas
      worksheet.addRows(excelData);

      // 🎯 CONFIGURAR WRAP TEXT Y ALTURA DE FILAS
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Saltar header
          // Configurar altura de fila para permitir múltiples líneas
          row.height = 45; // Altura suficiente para 2-3 líneas

          // Aplicar alineaciones específicas por columna
          row.eachCell((cell, colNumber) => {
            // Configuración base
            cell.alignment = {
              wrapText: true,
              vertical: "middle", // Todas centradas verticalmente
            };

            // 🎯 ALINEACIONES ESPECÍFICAS POR COLUMNA
            switch (colNumber) {
              case 1: // Nº Venta
              case 3: // Cliente
              case 5: // Dirección
              case 7: // Producto
                cell.alignment = {
                  ...cell.alignment,
                  horizontal: "left", // Izquierda
                };
                break;

              case 2: // Fecha
              case 4: // Teléfono
              case 6: // Importe Pendiente
              case 8: // Cantidad
                cell.alignment = {
                  ...cell.alignment,
                  horizontal: "center", // Centro
                };
                break;

              case 9: // Observaciones
                cell.alignment = {
                  ...cell.alignment,
                  horizontal: "left", // Izquierda para escribir fácil
                };
                break;
            }
          });
        }
      });

      // 🎯 MERGE DE CELDAS para ventas con múltiples productos
      salesGroups.forEach((group) => {
        const { startRow, endRow } = group;

        // Merge celdas de información de venta (columnas que se repiten)
        worksheet.mergeCells(`A${startRow}:A${endRow}`); // Nº Venta
        worksheet.mergeCells(`B${startRow}:B${endRow}`); // Fecha
        worksheet.mergeCells(`C${startRow}:C${endRow}`); // Cliente
        worksheet.mergeCells(`D${startRow}:D${endRow}`); // Teléfono
        worksheet.mergeCells(`E${startRow}:E${endRow}`); // Dirección
        worksheet.mergeCells(`F${startRow}:F${endRow}`); // Importe Pendiente
        worksheet.mergeCells(`I${startRow}:I${endRow}`); // Observaciones

        // 🎯 Alinear celdas mergeadas con configuraciones específicas
        for (let col = 1; col <= 9; col++) {
          if (col !== 7 && col !== 8) {
            // No mergear Producto y Cantidad
            const cell = worksheet.getCell(startRow, col);

            // Configuración base para celdas mergeadas
            let alignment = {
              vertical: "middle",
              wrapText: true,
            };

            // Alineaciones específicas para celdas mergeadas
            switch (col) {
              case 1: // Nº Venta
              case 3: // Cliente
              case 5: // Dirección
                alignment.horizontal = "left";
                break;

              case 2: // Fecha
              case 4: // Teléfono
              case 6: // Importe Pendiente
                alignment.horizontal = "center";
                break;

              case 9: // Observaciones
                alignment.horizontal = "left";
                break;
            }

            cell.alignment = alignment;
          }
        }
      });

      // Formatear header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF366092" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25; // 🎯 Altura específica para header

      // Formatear columna de importe
      worksheet.getColumn("importe_pendiente").numFmt = '"$"#,##0.00';

      // 🎯 CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN HORIZONTAL
      worksheet.pageSetup = {
        paperSize: 9, // A4
        orientation: "landscape", // Horizontal
        fitToPage: true,
        fitToWidth: 1, // Ajustar a 1 página de ancho
        fitToHeight: 0, // Sin límite de altura
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.5,
          bottom: 0.5,
          header: 0.3,
          footer: 0.3,
        },
      };

      // 🎨 Aplicar estilos adicionales a las celdas mergeadas
      salesGroups.forEach((group) => {
        const { startRow, endRow } = group;

        // Estilo especial para el importe (columna F)
        const importeCell = worksheet.getCell(startRow, 6);
        importeCell.font = { bold: true };
        importeCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F8FF" }, // Azul muy claro
        };

        // Añadir borde más grueso alrededor del grupo de venta
        for (let row = startRow; row <= endRow; row++) {
          for (let col = 1; col <= 9; col++) {
            const cell = worksheet.getCell(row, col);

            // Borde superior del grupo
            if (row === startRow) {
              cell.border = {
                ...cell.border,
                top: { style: "medium", color: { argb: "FF366092" } },
              };
            }

            // Borde inferior del grupo
            if (row === endRow) {
              cell.border = {
                ...cell.border,
                bottom: { style: "medium", color: { argb: "FF366092" } },
              };
            }

            // Bordes laterales
            if (col === 1) {
              cell.border = {
                ...cell.border,
                left: { style: "medium", color: { argb: "FF366092" } },
              };
            }
            if (col === 9) {
              cell.border = {
                ...cell.border,
                right: { style: "medium", color: { argb: "FF366092" } },
              };
            }
          }
        }
      });

      // Agregar bordes normales a todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          if (!cell.border || (!cell.border.top && !cell.border.bottom)) {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        });
      });

      // Guardar archivo
      await workbook.xlsx.writeFile(filepath);
      console.log(`💾 Archivo guardado en: ${filepath}`);

      // 6️⃣ Actualizar estado de ventas a "Enviado"
      const saleIds = salesInProcess.map((sale) => sale.id);

      await Sale.update(
        {
          estado_venta: "Enviado",
          // Campos adicionales para tracking
          distribuidor_reporte_generado: new Date(),
          distribuidor_archivo: filename,
        },
        {
          where: { id: saleIds },
          transaction,
        }
      );

      await transaction.commit();

      console.log(`✅ Reporte generado exitosamente:`);
      console.log(`   📦 Archivo: ${filename}`);
      console.log(`   📊 Ventas procesadas: ${salesInProcess.length}`);
      console.log(`   📋 Items totales: ${totalItems}`);
      console.log(`   🔄 Estados actualizados: En proceso → Enviado`);

      res.json({
        status: "success",
        message: "Reporte de envíos generado exitosamente",
        data: {
          filename: filename,
          sales_processed: salesInProcess.length,
          total_items: totalItems,
          file_path: `/api/reports/shipments/${filename}`,
          download_url: `/api/reports/shipments/download/${filename}`,
          generated_at: new Date().toISOString(),
          date_processed: today.toLocaleDateString("es-AR"),
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("❌ Error generando reporte distribuidor:", error);

      res.status(500).json({
        status: "error",
        message: "Error interno generando reporte de envíos",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Error interno del servidor",
      });
    }
  }

  // GET - List generated reports
  async getShipmentReports(req, res) {
    try {
      console.log("📋 Listando reportes de envíos generados...");

      const shipmentsDir = path.join(process.cwd(), "reports", "shipments");

      if (!fs.existsSync(shipmentsDir)) {
        return res.json({
          status: "success",
          data: [],
          message: "No hay reportes generados aún",
        });
      }

      const files = fs
        .readdirSync(shipmentsDir)
        .filter(
          (file) =>
            file.endsWith(".xlsx") && file.startsWith("envios_distribuidor_")
        )
        .map((file) => {
          const stats = fs.statSync(path.join(shipmentsDir, file));
          return {
            filename: file,
            created_at: stats.birthtime,
            size: stats.size,
            size_mb: (stats.size / (1024 * 1024)).toFixed(2),
            download_url: `/api/reports/shipments/download/${file}`,
          };
        })
        .sort((a, b) => b.created_at - a.created_at);

      console.log(`📊 Reportes encontrados: ${files.length}`);

      res.json({
        status: "success",
        data: files,
        total: files.length,
      });
    } catch (error) {
      console.error("❌ Error listando reportes:", error);
      res.status(500).json({
        status: "error",
        message: "Error obteniendo lista de reportes",
        error: error.message,
      });
    }
  }

  // GET - Download specific report
  async downloadShipmentReport(req, res) {
    try {
      const { filename } = req.params;
      console.log(`📥 Descargando reporte: ${filename}`);

      // Validar nombre de archivo por seguridad
      if (
        !filename.startsWith("envios_distribuidor_") ||
        !filename.endsWith(".xlsx")
      ) {
        return res.status(400).json({
          status: "error",
          message: "Nombre de archivo inválido",
        });
      }

      const filepath = path.join(
        process.cwd(),
        "reports",
        "shipments",
        filename
      );

      if (!fs.existsSync(filepath)) {
        return res.status(404).json({
          status: "error",
          message: "Archivo de reporte no encontrado",
        });
      }

      // Configurar headers para descarga
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      // Enviar archivo
      res.download(filepath, filename, (error) => {
        if (error) {
          console.error(`❌ Error descargando ${filename}:`, error);
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              message: "Error descargando archivo",
            });
          }
        } else {
          console.log(`✅ Archivo descargado exitosamente: ${filename}`);
        }
      });
    } catch (error) {
      console.error("❌ Error en descarga:", error);
      res.status(500).json({
        status: "error",
        message: "Error procesando descarga",
        error: error.message,
      });
    }
  }

  // GET - Check if there are sales ready for processing
  async checkPendingSales(req, res) {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

      const pendingSales = await Sale.count({
        where: {
          estado_venta: "En proceso",
          fecha: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      res.json({
        status: "success",
        data: {
          pending_sales: pendingSales,
          has_pending: pendingSales > 0,
          date: today.toLocaleDateString("es-AR"),
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
}

module.exports = new ReportController();
