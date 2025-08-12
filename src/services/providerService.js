import api from "./api";

export const providerService = {
  // Get all providers
  getProviders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = queryString ? `/providers?${queryString}` : "/providers";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active providers only (for selects)
  getActiveProviders: async () => {
    try {
      const response = await api.get("/providers/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get provider by ID
  getProvider: async (id) => {
    try {
      const response = await api.get(`/providers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new provider
  createProvider: async (providerData) => {
    try {
      const response = await api.post("/providers", providerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update provider
  updateProvider: async (id, providerData) => {
    try {
      const response = await api.put(`/providers/${id}`, providerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle provider status (activate/deactivate)
  toggleProviderStatus: async (id) => {
    try {
      const response = await api.patch(`/providers/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete provider (hard delete)
  deleteProvider: async (id) => {
    try {
      const response = await api.delete(`/providers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
