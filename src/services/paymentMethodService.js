// services/paymentMethodService.js
import api from "./api";

const paymentMethodService = {
  // ==========================================
  // PAYMENT METHOD CRUD OPERATIONS
  // ==========================================

  // Get all payment methods with filters and pagination
  getPaymentMethods: async (params = {}) => {
    try {
      console.log(
        "💳 PaymentMethodService: Iniciando solicitud getPaymentMethods con params:",
        params
      );

      const queryParams = new URLSearchParams();

      // Pagination
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Search and filters
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/payment-methods?${queryString}`
        : "/payment-methods";

      console.log("💳 PaymentMethodService: URL final:", url);

      const response = await api.get(url);

      console.log("💳 PaymentMethodService: Respuesta exitosa:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "💳 PaymentMethodService: Error en getPaymentMethods:",
        error
      );

      // Manejo de errores más detallado
      if (error.response) {
        // El servidor respondió con un error (4xx, 5xx)
        console.error("💳 Error response:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
        throw {
          message:
            error.response.data?.message ||
            `Error del servidor: ${error.response.status}`,
          status: error.response.status,
          ...error.response.data,
        };
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error("💳 Error request:", error.request);
        throw {
          message:
            "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
          type: "NETWORK_ERROR",
        };
      } else {
        // Algo más salió mal
        console.error("💳 Error config:", error.message);
        throw {
          message: error.message || "Error inesperado al procesar la solicitud",
          type: "UNKNOWN_ERROR",
        };
      }
    }
  },

  // Get payment method by ID
  getPaymentMethod: async (id) => {
    try {
      const response = await api.get(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new payment method
  createPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await api.post("/payment-methods", paymentMethodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update payment method
  updatePaymentMethod: async (id, paymentMethodData) => {
    try {
      const response = await api.put(
        `/payment-methods/${id}`,
        paymentMethodData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle payment method status (activate/deactivate)
  togglePaymentMethodStatus: async (id) => {
    try {
      const response = await api.patch(`/payment-methods/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete payment method permanently
  deletePaymentMethod: async (id) => {
    try {
      const response = await api.delete(`/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // SPECIALIZED QUERIES FOR POS
  // ==========================================

  // Get only active payment methods (for selects in POS)
  getActivePaymentMethods: async () => {
    try {
      const response = await api.get("/payment-methods/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Quick search payment methods by name (for POS)
  searchPaymentMethods: async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [] };
      }
      const response = await api.get(
        `/payment-methods/search?q=${encodeURIComponent(query.trim())}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  // Validate payment method data before submission
  validatePaymentMethodData: (paymentMethodData) => {
    const errors = [];

    // Required fields
    if (!paymentMethodData.nombre || !paymentMethodData.nombre.trim()) {
      errors.push("El nombre del método de pago es obligatorio");
    }

    // Field length validations
    if (
      paymentMethodData.nombre &&
      paymentMethodData.nombre.trim().length < 2
    ) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }

    if (
      paymentMethodData.nombre &&
      paymentMethodData.nombre.trim().length > 50
    ) {
      errors.push("El nombre no puede exceder los 50 caracteres");
    }

    // Description validation (optional)
    if (
      paymentMethodData.descripcion &&
      paymentMethodData.descripcion.trim().length > 200
    ) {
      errors.push("La descripción no puede exceder los 200 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  // Build search params for API calls
  buildSearchParams: (filters) => {
    const params = {};

    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.status && filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    return params;
  },

  // Prepare payment method data for API submission
  preparePaymentMethodData: (formData) => {
    return {
      nombre: formData.nombre?.trim() || "",
      descripcion: formData.descripcion?.trim() || null,
      requiere_referencia: formData.requiere_referencia || false,
      activo: formData.activo !== undefined ? formData.activo : true,
    };
  },

  // ==========================================
  // QUICK ACTIONS FOR POS
  // ==========================================

  // Create payment method quickly for POS (minimal required fields)
  createQuickPaymentMethod: async (basicData) => {
    try {
      const paymentMethodData = {
        nombre: basicData.nombre,
        descripcion: basicData.descripcion || null,
        requiere_referencia: basicData.requiere_referencia || false,
      };

      const response = await api.post("/payment-methods", paymentMethodData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  // Get payment method status info with colors
  getPaymentMethodStatusInfo: (activo) => {
    return activo
      ? {
          color: "success",
          text: "Activo",
          icon: "✅",
          description: "Disponible para usar en ventas",
        }
      : {
          color: "default",
          text: "Inactivo",
          icon: "❌",
          description: "No disponible para ventas",
        };
  },

  // Get reference requirement info
  getReferenceRequirementInfo: (requiere_referencia) => {
    return requiere_referencia
      ? {
          color: "warning",
          text: "Requiere Referencia",
          icon: "📝",
          description: "Necesita número de transacción",
        }
      : {
          color: "info",
          text: "Sin Referencia",
          icon: "💰",
          description: "No requiere número de transacción",
        };
  },

  // Format payment method info for display in POS
  formatPaymentMethodForPOS: (paymentMethod) => {
    if (!paymentMethod) return null;

    return {
      id: paymentMethod.id,
      display_name: paymentMethod.nombre,
      description: paymentMethod.descripcion || "",
      requires_reference: paymentMethod.requiere_referencia,
      status: paymentMethod.activo,
      status_info: {
        color: paymentMethod.activo ? "success" : "default",
        text: paymentMethod.activo ? "Activo" : "Inactivo",
        icon: paymentMethod.activo ? "✅" : "❌",
        description: paymentMethod.activo
          ? "Disponible para usar en ventas"
          : "No disponible para ventas",
      },
      reference_info: {
        color: paymentMethod.requiere_referencia ? "warning" : "info",
        text: paymentMethod.requiere_referencia
          ? "Requiere Referencia"
          : "Sin Referencia",
        icon: paymentMethod.requiere_referencia ? "📝" : "💰",
        description: paymentMethod.requiere_referencia
          ? "Necesita número de transacción"
          : "No requiere número de transacción",
      },
    };
  },

  // ==========================================
  // COMMON PAYMENT METHODS
  // ==========================================

  // Get common payment methods for Argentina
  getCommonPaymentMethods: () => {
    return [
      {
        nombre: "Efectivo",
        descripcion: "Pago en efectivo",
        requiere_referencia: false,
      },
      {
        nombre: "Transferencia Bancaria",
        descripcion: "Transferencia bancaria",
        requiere_referencia: true,
      },
      {
        nombre: "Mercado Pago",
        descripcion: "Pago mediante Mercado Pago",
        requiere_referencia: true,
      },
      {
        nombre: "Tarjeta de Débito",
        descripcion: "Pago con tarjeta de débito",
        requiere_referencia: false,
      },
      {
        nombre: "Tarjeta de Crédito",
        descripcion: "Pago con tarjeta de crédito",
        requiere_referencia: false,
      },
      {
        nombre: "MODO",
        descripcion: "Pago mediante MODO",
        requiere_referencia: true,
      },
      {
        nombre: "QR Digital",
        descripcion: "Pago mediante código QR",
        requiere_referencia: true,
      },
    ];
  },

  // ==========================================
  // BUSINESS LOGIC HELPERS
  // ==========================================

  // Check if payment method can be deleted (no sales associated)
  canDeletePaymentMethod: async (id) => {
    try {
      // TODO: Implement check for associated sales
      // For now, assume it can be deleted
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get payment method usage statistics
  getPaymentMethodStats: async (id) => {
    try {
      // TODO: Implement stats endpoint
      // For now, return empty stats
      return {
        total_sales: 0,
        total_amount: 0,
        last_used: null,
      };
    } catch (error) {
      return {
        total_sales: 0,
        total_amount: 0,
        last_used: null,
      };
    }
  },

  // ==========================================
  // FILTERING AND SORTING
  // ==========================================

  // Sort payment methods by name
  sortByName: (paymentMethods, direction = "asc") => {
    return [...paymentMethods].sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();

      if (direction === "asc") {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
  },

  // Filter payment methods by status
  filterByStatus: (paymentMethods, status) => {
    if (status === "all") return paymentMethods;
    const isActive = status === "true" || status === true;
    return paymentMethods.filter((pm) => pm.activo === isActive);
  },

  // Filter payment methods by reference requirement
  filterByReferenceRequirement: (paymentMethods, requiresReference) => {
    if (requiresReference === "all") return paymentMethods;
    const requires = requiresReference === "true" || requiresReference === true;
    return paymentMethods.filter((pm) => pm.requiere_referencia === requires);
  },
};

// Solo export default
export default paymentMethodService;
