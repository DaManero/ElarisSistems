import api from "./api";

export const categoryService = {
  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de consulta si existen
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = queryString ? `/category?${queryString}` : "/category";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active categories only (for selects)
  getActiveCategories: async () => {
    try {
      const response = await api.get("/category/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get category by ID
  getCategory: async (id) => {
    try {
      const response = await api.get(`/category/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/category", categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle category status (activate/deactivate)
  toggleCategoryStatus: async (id) => {
    try {
      const response = await api.patch(`/category/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete category (hard delete)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/category/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
