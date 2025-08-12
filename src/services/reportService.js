// services/reportService.js
import api from "./api"; // Asumiendo que tienes tu configuración de axios aquí

const reportService = {
  // Generar reporte de envíos
  generateShipmentsReport: async (data = {}) => {
    try {
      const response = await api.post("/reports/generate-shipments", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener lista de reportes generados
  getShipmentReports: async () => {
    try {
      const response = await api.get("/reports/shipments");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Descargar reporte específico
  downloadShipmentReport: async (filename) => {
    try {
      const response = await api.get(
        `/reports/shipments/download/${filename}`,
        {
          responseType: "blob", // Importante para archivos
        }
      );

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Archivo descargado exitosamente" };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verificar ventas pendientes
  checkPendingSales: async () => {
    try {
      const response = await api.get("/reports/pending-sales");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 🆕 Obtener ventas pendientes con detalles completos
  getPendingSalesDetailed: async () => {
    try {
      const response = await api.get("/reports/pending-sales-detailed");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default reportService;
