// services/saleService.js
import api from "./api";

export const saleService = {
  // ==========================================
  // SALE CRUD OPERATIONS
  // ==========================================

  // Get all sales with filters and pagination
  getSales: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.cliente_id && params.cliente_id !== "all")
        queryParams.append("cliente_id", params.cliente_id);
      if (params.usuario_id && params.usuario_id !== "all")
        queryParams.append("usuario_id", params.usuario_id);
      if (params.estado_venta && params.estado_venta !== "all")
        queryParams.append("estado_venta", params.estado_venta);
      if (params.estado_pago && params.estado_pago !== "all")
        queryParams.append("estado_pago", params.estado_pago);
      if (params.metodo_pago_id && params.metodo_pago_id !== "all")
        queryParams.append("metodo_pago_id", params.metodo_pago_id);
      if (params.fecha_desde)
        queryParams.append("fecha_desde", params.fecha_desde);
      if (params.fecha_hasta)
        queryParams.append("fecha_hasta", params.fecha_hasta);

      const queryString = queryParams.toString();
      const url = queryString ? `/sales?${queryString}` : "/sales";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sale by ID with all details
  getSale: async (id) => {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new sale
  createSale: async (saleData) => {
    try {
      const response = await api.post("/sales", saleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update sale - MODIFICADO para indicar que es edición
  updateSale: async (id, saleData) => {
    try {
      // Agregar flag para indicar que es una actualización
      const updateData = {
        ...saleData,
        _isUpdate: true, // Flag para el backend
      };

      const response = await api.put(`/sales/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update sale status only
  updateSaleStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/sales/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete sale
  deleteSale: async (id) => {
    try {
      const response = await api.delete(`/sales/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // SALE ITEMS OPERATIONS
  // ==========================================

  // Get items by sale ID
  getSaleItems: async (saleId) => {
    try {
      const response = await api.get(`/salesitems/sale/${saleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add item to sale
  addItemToSale: async (saleId, itemData) => {
    try {
      const response = await api.post(`/salesitems/sale/${saleId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update sale item
  updateSaleItem: async (itemId, itemData) => {
    try {
      const response = await api.put(`/salesitems/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete sale item
  deleteSaleItem: async (itemId) => {
    try {
      const response = await api.delete(`/salesitems/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // SPECIALIZED QUERIES
  // ==========================================

  // Get sales by customer
  getSalesByCustomer: async (customerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/sales/customer/${customerId}?${queryString}`
        : `/sales/customer/${customerId}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check product stock
  checkProductStock: async (productId, cantidad = 1) => {
    try {
      const response = await api.get(
        `/sales/check-stock/${productId}?cantidad=${cantidad}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sales summary/statistics
  getSalesSummary: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.fecha_desde)
        queryParams.append("fecha_desde", params.fecha_desde);
      if (params.fecha_hasta)
        queryParams.append("fecha_hasta", params.fecha_hasta);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/sales/summary?${queryString}`
        : "/sales/summary";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get best selling products
  getBestSellingProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.fecha_desde)
        queryParams.append("fecha_desde", params.fecha_desde);
      if (params.fecha_hasta)
        queryParams.append("fecha_hasta", params.fecha_hasta);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/salesitems/best-sellers?${queryString}`
        : "/salesitems/best-sellers";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  // Format price for display
  formatPrice: (price) => {
    if (!price) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  // Format date for display
  formatDate: (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  // Format datetime for display
  formatDateTime: (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Get sale status info with colors
  getSaleStatusInfo: (estado_venta) => {
    const statusMap = {
      "En proceso": {
        color: "info",
        text: "En Proceso",
        icon: "🔄",
        description: "Venta en preparación",
      },
      Enviado: {
        color: "warning",
        text: "Enviado",
        icon: "🚚",
        description: "En camino al cliente",
      },
      Entregado: {
        color: "success",
        text: "Entregado",
        icon: "✅",
        description: "Entrega completada",
      },
      Reprogramado: {
        color: "secondary",
        text: "Reprogramado",
        icon: "📅",
        description: "Entrega reprogramada",
      },
      Cancelado: {
        color: "error",
        text: "Cancelado",
        icon: "❌",
        description: "Venta cancelada",
      },
    };
    return (
      statusMap[estado_venta] || {
        color: "default",
        text: estado_venta || "Desconocido",
        icon: "❓",
        description: "",
      }
    );
  },

  // Get payment status info with colors
  getPaymentStatusInfo: (estado_pago) => {
    const statusMap = {
      Pendiente: {
        color: "warning",
        text: "Pendiente",
        icon: "⏳",
        description: "Pago pendiente",
      },
      Pagado: {
        color: "success",
        text: "Pagado",
        icon: "💰",
        description: "Pago confirmado",
      },
    };
    return (
      statusMap[estado_pago] || {
        color: "default",
        text: estado_pago || "Desconocido",
        icon: "❓",
        description: "",
      }
    );
  },

  // Get customer full name
  getCustomerFullName: (customer) => {
    if (!customer) return "Sin cliente";
    return `${customer.nombre || ""} ${customer.apellido || ""}`.trim();
  },

  // Get user full name
  getUserFullName: (user) => {
    if (!user) return "Sin vendedor";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim();
  },

  // Calculate item total
  calculateItemTotal: (item) => {
    if (!item) return 0;
    return item.precio_con_descuento * item.cantidad;
  },

  // Calculate sale total items count
  calculateTotalItems: (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + item.cantidad, 0);
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

    if (filters.cliente_id && filters.cliente_id !== "all") {
      params.cliente_id = filters.cliente_id;
    }

    if (filters.usuario_id && filters.usuario_id !== "all") {
      params.usuario_id = filters.usuario_id;
    }

    if (filters.estado_venta && filters.estado_venta !== "all") {
      params.estado_venta = filters.estado_venta;
    }

    if (filters.estado_pago && filters.estado_pago !== "all") {
      params.estado_pago = filters.estado_pago;
    }

    if (filters.metodo_pago_id && filters.metodo_pago_id !== "all") {
      params.metodo_pago_id = filters.metodo_pago_id;
    }

    if (filters.fecha_desde) {
      params.fecha_desde = filters.fecha_desde;
    }

    if (filters.fecha_hasta) {
      params.fecha_hasta = filters.fecha_hasta;
    }

    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    return params;
  },

  // Validate sale data - MODIFICADO para considerar modo edición
  validateSaleData: (saleData, isEditMode = false) => {
    const errors = [];

    if (!saleData.cliente_id) {
      errors.push("El cliente es obligatorio");
    }

    if (!saleData.metodo_pago_id) {
      errors.push("El método de pago es obligatorio");
    }

    if (
      !saleData.items ||
      !Array.isArray(saleData.items) ||
      saleData.items.length === 0
    ) {
      errors.push("Debe agregar al menos un producto a la venta");
    }

    // Validar items
    if (saleData.items && Array.isArray(saleData.items)) {
      saleData.items.forEach((item, index) => {
        if (!item.producto_id) {
          errors.push(`Item ${index + 1}: El producto es obligatorio`);
        }
        if (!item.cantidad || item.cantidad <= 0) {
          errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (!item.precio_unitario || item.precio_unitario <= 0) {
          errors.push(`Item ${index + 1}: El precio debe ser mayor a 0`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Prepare sale data for API submission - MODIFICADO para manejar edición
  prepareSaleData: async (
    formData,
    isEditMode = false,
    originalSaleId = null
  ) => {
    const preparedData = {
      cliente_id: formData.cliente_id,
      usuario_id: formData.usuario_id,
      metodo_pago_id: formData.metodo_pago_id,
      referencia_pago: formData.referencia_pago?.trim() || null,
      costo_envio: parseFloat(formData.costo_envio) || 0,
      observaciones: formData.observaciones?.trim() || null,
      items: formData.items || [],
      // 🛠️ INCLUIR ESTADOS SIEMPRE
      estado_venta: formData.estado_venta || "En proceso",
      estado_pago: formData.estado_pago || "Pendiente",
    };

    // Si es modo edición, agregar flags y datos adicionales
    if (isEditMode) {
      preparedData._isUpdate = true;
      preparedData._skipStockValidation = true; // Flag para el backend

      if (originalSaleId) {
        preparedData._originalSaleId = originalSaleId;
      }
    }

    return preparedData;
  },
  // ==========================================
  // CONSTANTS
  // ==========================================

  // Sale states
  SALE_STATES: [
    "En proceso",
    "Enviado",
    "Entregado",
    "Reprogramado",
    "Cancelado",
  ],

  // Payment states
  PAYMENT_STATES: ["Pendiente", "Pagado"],

  // Default pagination
  DEFAULT_PAGINATION: {
    page: 1,
    limit: 20,
  },

  // ==========================================
  // BUSINESS LOGIC HELPERS
  // ==========================================

  // Check if sale can be edited
  canSaleBeEdited: (sale) => {
    if (!sale) return false;
    // Solo bloquear si está COMPLETO: Entregado Y Pagado, o si está Cancelado
    return (
      !(sale.estado_venta === "Entregado" && sale.estado_pago === "Pagado") &&
      sale.estado_venta !== "Cancelado"
    );
  },

  // Check if sale is completed
  isSaleCompleted: (sale) => {
    if (!sale) return false;
    return sale.estado_venta === "Entregado" && sale.estado_pago === "Pagado";
  },

  // Get sale progress percentage
  getSaleProgress: (sale) => {
    if (!sale) return 0;

    const stateProgress = {
      "En proceso": 25,
      Enviado: 50,
      Entregado: 100,
      Reprogramado: 40,
      Cancelado: 0,
    };

    return stateProgress[sale.estado_venta] || 0;
  },

  // Format sale for display in lists
  formatSaleForDisplay: (sale) => {
    if (!sale) return null;

    return {
      id: sale.id,
      numero_venta: sale.numero_venta,
      fecha: saleService.formatDate(sale.fecha),
      cliente: saleService.getCustomerFullName(sale.cliente),
      vendedor: saleService.getUserFullName(sale.usuario),
      total: saleService.formatPrice(sale.total),
      estado_venta: saleService.getSaleStatusInfo(sale.estado_venta),
      estado_pago: saleService.getPaymentStatusInfo(sale.estado_pago),
      metodo_pago: sale.metodoPago?.nombre || "Sin método",
      total_items: saleService.calculateTotalItems(sale.items),
      can_edit: saleService.canSaleBeEdited(sale),
      is_completed: saleService.isSaleCompleted(sale),
      progress: saleService.getSaleProgress(sale),
    };
  },
};

// Export por defecto también
export default saleService;
