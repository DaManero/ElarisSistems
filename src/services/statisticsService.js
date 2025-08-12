// services/statisticsService.js - FRONTEND
import api from "./api";

export const statisticsService = {
  // ================================
  // DASHBOARD EJECUTIVO
  // ================================
  getDashboardKPIs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.compare_previous !== undefined)
        queryParams.append("compare_previous", params.compare_previous);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/dashboard?${queryString}`
        : "/statistics/dashboard";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ESTADÍSTICAS DE VENTAS
  // ================================
  getSalesStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.date_from) queryParams.append("date_from", params.date_from);
      if (params.date_to) queryParams.append("date_to", params.date_to);
      if (params.categoria_id && params.categoria_id !== "all")
        queryParams.append("categoria_id", params.categoria_id);
      if (params.group_by) queryParams.append("group_by", params.group_by);
      if (params.compare_previous !== undefined)
        queryParams.append("compare_previous", params.compare_previous);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/sales?${queryString}`
        : "/statistics/sales";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ESTADÍSTICAS DE PRODUCTOS
  // ================================
  getProductStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.categoria_id && params.categoria_id !== "all")
        queryParams.append("categoria_id", params.categoria_id);
      if (params.analysis_type)
        queryParams.append("analysis_type", params.analysis_type);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/products?${queryString}`
        : "/statistics/products";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ESTADÍSTICAS DE CLIENTES
  // ================================
  getCustomerStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.segment_type)
        queryParams.append("segment_type", params.segment_type);
      if (params.provincia && params.provincia !== "all")
        queryParams.append("provincia", params.provincia);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/customers?${queryString}`
        : "/statistics/customers";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ESTADÍSTICAS DE PAGOS
  // ================================
  getPaymentStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/payments?${queryString}`
        : "/statistics/payments";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ESTADÍSTICAS DE ENVÍOS
  // ================================
  getShipmentStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.zona && params.zona !== "all")
        queryParams.append("zona", params.zona);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/shipments?${queryString}`
        : "/statistics/shipments";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ANÁLISIS GEOGRÁFICO
  // ================================
  getGeographicAnalysis: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.metric) queryParams.append("metric", params.metric);
      if (params.level) queryParams.append("level", params.level);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/geographic?${queryString}`
        : "/statistics/geographic";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // ANÁLISIS DE TENDENCIAS
  // ================================
  getTrendAnalysis: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.metric) queryParams.append("metric", params.metric);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/trends?${queryString}`
        : "/statistics/trends";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // TOP RANKINGS
  // ================================
  getTopRankings: async (type, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.period) queryParams.append("period", params.period);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.metric) queryParams.append("metric", params.metric);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/statistics/rankings/${type}?${queryString}`
        : `/statistics/rankings/${type}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // EXPORTAR REPORTES
  // ================================
  exportReport: async (reportType, format, filters = {}) => {
    try {
      const response = await api.post(
        "/statistics/export",
        {
          report_type: reportType,
          format: format,
          filters: filters,
        },
        {
          responseType: format === "json" ? "json" : "blob",
          timeout: 60000, // 60 segundos para reportes grandes
        }
      );

      if (format === "json") {
        return response.data;
      } else {
        // Para PDF/Excel crear URL de descarga
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        // Obtener nombre del archivo
        const contentDisposition = response.headers["content-disposition"];
        let filename = `reporte-${reportType}-${Date.now()}`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Agregar extensión según formato
        if (!filename.includes(".")) {
          const extensions = { pdf: ".pdf", excel: ".xlsx", csv: ".csv" };
          filename += extensions[format] || ".pdf";
        }

        return { url, filename };
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ================================
  // UTILIDADES DE FORMATO
  // ================================
  formatCurrency: (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  },

  formatPercent: (value) => {
    return `${(value || 0).toFixed(2)}%`;
  },

  formatNumber: (value) => {
    return new Intl.NumberFormat("es-AR").format(value || 0);
  },

  calculateGrowth: (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(2);
  },

  getGrowthColor: (growth) => {
    if (growth > 0) return "success";
    if (growth < 0) return "error";
    return "default";
  },

  getGrowthIcon: (growth) => {
    if (growth > 0) return "📈";
    if (growth < 0) return "📉";
    return "➡️";
  },

  // ================================
  // CONFIGURACIONES
  // ================================
  getPeriodPresets: () => [
    { value: "today", label: "Hoy" },
    { value: "yesterday", label: "Ayer" },
    { value: "week", label: "Esta Semana" },
    { value: "month", label: "Este Mes" },
    { value: "quarter", label: "Trimestre" },
    { value: "year", label: "Año" },
    { value: "custom", label: "Personalizado" },
  ],

  getChartColors: () => [
    "#1C1C26", // primary dark
    "#16a34a", // green
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#ec4899", // pink
  ],

  getAnalysisTypes: () => [
    { value: "rotation", label: "Rotación de Stock" },
    { value: "profitability", label: "Rentabilidad" },
    { value: "abc", label: "Análisis ABC" },
  ],

  getSegmentTypes: () => [
    { value: "rfm", label: "Segmentación RFM" },
    { value: "geographic", label: "Análisis Geográfico" },
    { value: "behavioral", label: "Comportamiento" },
  ],

  getRankingTypes: () => [
    { value: "products", label: "Productos" },
    { value: "customers", label: "Clientes" },
    { value: "categories", label: "Categorías" },
  ],

  getMetricTypes: () => [
    { value: "revenue", label: "Ingresos" },
    { value: "quantity", label: "Cantidad" },
    { value: "frequency", label: "Frecuencia" },
  ],

  // ================================
  // VALIDACIONES
  // ================================
  validateDateRange: (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return true; // Fechas opcionales

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from > to) {
      throw new Error("La fecha de inicio debe ser anterior a la fecha de fin");
    }

    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      throw new Error("El rango de fechas no puede ser mayor a 1 año");
    }

    return true;
  },

  validateFilters: (filters) => {
    const errors = [];

    try {
      if (filters.date_from && filters.date_to) {
        this.validateDateRange(filters.date_from, filters.date_to);
      }
    } catch (error) {
      errors.push(error.message);
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      errors.push("El límite debe estar entre 1 y 100");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  },

  // ================================
  // CONSTRUCCIÓN DE PARÁMETROS
  // ================================
  buildSearchParams: (filters) => {
    const params = {};

    if (filters.period && filters.period !== "all") {
      params.period = filters.period;
    }

    if (filters.date_from && filters.date_to) {
      params.date_from = filters.date_from;
      params.date_to = filters.date_to;
    }

    if (filters.categoria_id && filters.categoria_id !== "all") {
      params.categoria_id = filters.categoria_id;
    }

    if (filters.provincia && filters.provincia !== "all") {
      params.provincia = filters.provincia;
    }

    if (filters.group_by) {
      params.group_by = filters.group_by;
    }

    if (filters.analysis_type) {
      params.analysis_type = filters.analysis_type;
    }

    if (filters.segment_type) {
      params.segment_type = filters.segment_type;
    }

    if (filters.metric) {
      params.metric = filters.metric;
    }

    if (filters.level) {
      params.level = filters.level;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    if (filters.compare_previous !== undefined) {
      params.compare_previous = filters.compare_previous;
    }

    return params;
  },
};

// Export por defecto también
export default statisticsService;
