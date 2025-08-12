// controllers/StatisticsController.js - VERSIÓN SIMPLIFICADA
const { Op } = require("sequelize");

// Intentar importar modelos - si fallan, usar datos temporales
let Sale,
  SaleItem,
  Product,
  Customer,
  Category,
  Provider,
  Measure,
  User,
  Shipment,
  PaymentMethod,
  sequelize;

try {
  const models = require("../models");
  ({
    Sale,
    SaleItem,
    Product,
    Customer,
    Category,
    Provider,
    Measure,
    User,
    Shipment,
    PaymentMethod,
  } = models);
  ({ sequelize } = require("../config/database"));
  console.log("✅ StatisticsController: Modelos cargados correctamente");
} catch (error) {
  console.error(
    "❌ StatisticsController: Error cargando modelos:",
    error.message
  );
  console.log("⚠️ StatisticsController: Usando datos temporales");
}

class StatisticsController {
  // GET - Dashboard Ejecutivo con KPIs principales
  async getDashboardKPIs(req, res) {
    try {
      console.log("📊 GET /api/statistics/dashboard");

      // Si no hay modelos, devolver datos de ejemplo
      if (!Sale || !sequelize) {
        return res.json({
          status: "success",
          message: "Datos de ejemplo - Base de datos no conectada",
          data: {
            kpis: {
              sales: {
                ventas_mes: {
                  current: 150000,
                  previous: 120000,
                  growth: 25,
                  formatted: "$150.000,00",
                },
                cantidad_ventas: { current: 45, previous: 38, growth: 18.42 },
                ticket_promedio: { current: 3333.33, formatted: "$3.333,33" },
              },
              customers: {
                nuevos_clientes: { current: 12, previous: 8, growth: 50 },
              },
              products: {
                productos_vendidos: { current: 28, unidades: 156 },
              },
              delivery: {
                tasa_entrega: { current: 94.5, entregados: 38, total: 40 },
              },
            },
            charts: {
              salesEvolution: [
                { fecha: "2024-01-01", cantidad: 5, ingresos: 15000 },
                { fecha: "2024-01-02", cantidad: 8, ingresos: 24000 },
              ],
              topProducts: [
                {
                  id: 1,
                  fragancia: "Chanel No. 5",
                  categoria: "Premium",
                  cantidad_vendida: 15,
                  ingresos: 45000,
                },
              ],
              categoryDistribution: [
                { categoria: "Premium", items_vendidos: 25, ingresos: 75000 },
                { categoria: "Clásicos", items_vendidos: 20, ingresos: 40000 },
              ],
            },
            period: {
              current: { start: "2024-01-01", end: "2024-01-31" },
              previous: { start: "2023-12-01", end: "2023-12-31" },
            },
          },
        });
      }

      const { period = "month", compare_previous = "true" } = req.query;

      const dateRanges = this.calculateDateRanges(period);

      // Obtener estadísticas básicas reales
      const salesStats = await Sale.findOne({
        where: {
          fecha: {
            [Op.between]: [dateRanges.current.start, dateRanges.current.end],
          },
          estado_venta: "completada",
        },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "cantidad"],
          [sequelize.fn("SUM", sequelize.col("total")), "ingresos"],
          [sequelize.fn("AVG", sequelize.col("total")), "promedio"],
        ],
        raw: true,
      });

      console.log("✅ Dashboard KPIs generados exitosamente");

      res.json({
        status: "success",
        data: {
          kpis: {
            sales: {
              ventas_mes: {
                current: parseFloat(salesStats?.ingresos) || 0,
                formatted: this.formatCurrency(salesStats?.ingresos || 0),
              },
              cantidad_ventas: { current: parseInt(salesStats?.cantidad) || 0 },
              ticket_promedio: {
                current: parseFloat(salesStats?.promedio) || 0,
                formatted: this.formatCurrency(salesStats?.promedio || 0),
              },
            },
            customers: { nuevos_clientes: { current: 0, growth: 0 } },
            products: { productos_vendidos: { current: 0, unidades: 0 } },
            delivery: { tasa_entrega: { current: 0, entregados: 0, total: 0 } },
          },
          charts: {
            salesEvolution: [],
            topProducts: [],
            categoryDistribution: [],
          },
          period: {
            current: dateRanges.current,
            previous: compare_previous === "true" ? dateRanges.previous : null,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error en getDashboardKPIs:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting dashboard KPIs",
        error: error.message,
      });
    }
  }

  // GET - Estadísticas detalladas de ventas
  async getSalesStatistics(req, res) {
    try {
      console.log("📊 GET /api/statistics/sales");

      if (!Sale || !sequelize) {
        return res.json({
          status: "success",
          message: "Datos de ejemplo - Base de datos no conectada",
          data: {
            summary: {
              cantidad_ventas: 45,
              ingresos_totales: 150000,
              ticket_promedio: 3333.33,
            },
            evolution: [],
            rankings: { topProducts: [], topCustomers: [] },
          },
        });
      }

      const { period = "month" } = req.query;
      const dateRanges = this.calculateDateRanges(period);

      const basicStats = await Sale.findOne({
        where: {
          fecha: {
            [Op.between]: [dateRanges.current.start, dateRanges.current.end],
          },
          estado_venta: "completada",
        },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "cantidad_ventas"],
          [sequelize.fn("SUM", sequelize.col("total")), "ingresos_totales"],
          [sequelize.fn("AVG", sequelize.col("total")), "ticket_promedio"],
        ],
        raw: true,
      });

      res.json({
        status: "success",
        data: {
          summary: {
            cantidad_ventas: parseInt(basicStats?.cantidad_ventas) || 0,
            ingresos_totales: parseFloat(basicStats?.ingresos_totales) || 0,
            ticket_promedio: parseFloat(basicStats?.ticket_promedio) || 0,
            ingresos_formatted: this.formatCurrency(
              basicStats?.ingresos_totales || 0
            ),
          },
          evolution: [],
          rankings: { topProducts: [], topCustomers: [] },
        },
      });
    } catch (error) {
      console.error("❌ Error en getSalesStatistics:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting sales statistics",
        error: error.message,
      });
    }
  }

  // GET - Estadísticas de productos
  async getProductStatistics(req, res) {
    try {
      console.log("📊 GET /api/statistics/products");

      res.json({
        status: "success",
        data: {
          rotation: { highRotation: [], lowRotation: [], noMovement: [] },
          profitability: { profitable: [], marginal: [], unprofitable: [] },
          categories: [],
        },
        analysis_type: req.query.analysis_type || "rotation",
      });
    } catch (error) {
      console.error("❌ Error en getProductStatistics:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting product statistics",
        error: error.message,
      });
    }
  }

  // GET - Estadísticas de clientes
  async getCustomerStatistics(req, res) {
    try {
      console.log("📊 GET /api/statistics/customers");

      res.json({
        status: "success",
        data: {
          rfm: { vip: 0, frequent: 0, new: 0, inactive: 0 },
          geographic: [],
          behavioral: [],
        },
        segment_type: req.query.segment_type || "rfm",
      });
    } catch (error) {
      console.error("❌ Error en getCustomerStatistics:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting customer statistics",
        error: error.message,
      });
    }
  }

  // GET - Estadísticas de pagos
  async getPaymentStatistics(req, res) {
    try {
      console.log("📊 GET /api/statistics/payments");

      res.json({
        status: "success",
        data: {
          paymentMethods: [],
          paymentStatus: [],
        },
      });
    } catch (error) {
      console.error("❌ Error en getPaymentStatistics:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting payment statistics",
        error: error.message,
      });
    }
  }

  // GET - Estadísticas de envíos
  async getShipmentStatistics(req, res) {
    try {
      console.log("📊 GET /api/statistics/shipments");

      res.json({
        status: "success",
        data: {
          shipmentStatus: [],
          geographicDistribution: [],
        },
      });
    } catch (error) {
      console.error("❌ Error en getShipmentStatistics:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting shipment statistics",
        error: error.message,
      });
    }
  }

  // GET - Análisis geográfico
  async getGeographicAnalysis(req, res) {
    try {
      console.log("📊 GET /api/statistics/geographic");

      res.json({
        status: "success",
        data: [],
        level: req.query.level || "province",
        metric: req.query.metric || "sales",
      });
    } catch (error) {
      console.error("❌ Error en getGeographicAnalysis:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting geographic analysis",
        error: error.message,
      });
    }
  }

  // GET - Análisis de tendencias
  async getTrendAnalysis(req, res) {
    try {
      console.log("📊 GET /api/statistics/trends");

      res.json({
        status: "success",
        data: {
          monthly: [],
          summary: { periods_analyzed: 0, total_sales: 0, total_revenue: 0 },
        },
        metric: req.query.metric || "sales",
      });
    } catch (error) {
      console.error("❌ Error en getTrendAnalysis:", error);
      res.status(500).json({
        status: "error",
        message: "Error getting trend analysis",
        error: error.message,
      });
    }
  }

  // GET - Top rankings
  async getTopRankings(req, res) {
    try {
      const { type } = req.params;
      console.log(`📊 GET /api/statistics/rankings/${type}`);

      res.json({
        status: "success",
        data: [],
        type,
        metric: req.query.metric || "revenue",
        period: req.query.period || "month",
      });
    } catch (error) {
      console.error(`❌ Error en getTopRankings(${req.params.type}):`, error);
      res.status(500).json({
        status: "error",
        message: "Error getting top rankings",
        error: error.message,
      });
    }
  }

  // POST - Exportar reportes
  async exportReport(req, res) {
    try {
      console.log("📊 POST /api/statistics/export");

      res.json({
        status: "success",
        message: "Función de exportación no implementada aún",
        format: req.body.format || "json",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error en exportReport:", error);
      res.status(500).json({
        status: "error",
        message: "Error exporting report",
        error: error.message,
      });
    }
  }

  // Métodos auxiliares adicionales (implementación temporal)
  async getSalesEvolutionDetailed(req, res) {
    try {
      res.json({ status: "success", data: [] });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Error", error: error.message });
    }
  }

  async getProductRotationDetailed(req, res) {
    try {
      res.json({ status: "success", data: [] });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Error", error: error.message });
    }
  }

  async getCustomerRFMDetailed(req, res) {
    try {
      res.json({ status: "success", data: [] });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Error", error: error.message });
    }
  }

  async getPeriodSummary(req, res) {
    try {
      res.json({ status: "success", data: {} });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "Error", error: error.message });
    }
  }

  // ================================
  // MÉTODOS AUXILIARES
  // ================================

  // Calcular rangos de fechas según período
  calculateDateRanges(period) {
    const now = new Date();
    let current_start, current_end, previous_start, previous_end;

    switch (period) {
      case "today":
        current_start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        current_end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        );
        previous_start = new Date(
          current_start.getTime() - 24 * 60 * 60 * 1000
        );
        previous_end = new Date(current_end.getTime() - 24 * 60 * 60 * 1000);
        break;

      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        current_start = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate()
        );
        current_end = new Date(
          current_start.getTime() + 6 * 24 * 60 * 60 * 1000
        );
        previous_start = new Date(
          current_start.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        previous_end = new Date(
          current_end.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        break;

      case "month":
      default:
        current_start = new Date(now.getFullYear(), now.getMonth(), 1);
        current_end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        previous_start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previous_end = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59
        );
        break;
    }

    return {
      current: {
        start: current_start.toISOString().split("T")[0],
        end: current_end.toISOString().split("T")[0],
      },
      previous: {
        start: previous_start.toISOString().split("T")[0],
        end: previous_end.toISOString().split("T")[0],
      },
    };
  }

  // Formatear moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  }

  // Calcular crecimiento porcentual
  calculateGrowth(current, previous) {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  }
}

module.exports = new StatisticsController();
