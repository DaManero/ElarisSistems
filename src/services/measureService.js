import api from "./api";

export const measureService = {
  // Get all measures
  getMeasures: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = queryString ? `/measures?${queryString}` : "/measures";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active measures only (for selects)
  getActiveMeasures: async () => {
    try {
      const response = await api.get("/measures/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get measure by ID
  getMeasure: async (id) => {
    try {
      const response = await api.get(`/measures/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new measure
  createMeasure: async (measureData) => {
    try {
      const response = await api.post("/measures", measureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update measure
  updateMeasure: async (id, measureData) => {
    try {
      const response = await api.put(`/measures/${id}`, measureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle measure status (activate/deactivate)
  toggleMeasureStatus: async (id) => {
    try {
      const response = await api.patch(`/measures/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete measure (hard delete)
  deleteMeasure: async (id) => {
    try {
      const response = await api.delete(`/measures/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
