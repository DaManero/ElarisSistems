// services/customerService.js
import api from "./api";

export const customerService = {
  // ==========================================
  // CUSTOMER CRUD OPERATIONS
  // ==========================================

  // Get all customers with filters and pagination
  getCustomers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Search and filters
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params.tipo_cliente && params.tipo_cliente !== "all")
        queryParams.append("tipo_cliente", params.tipo_cliente);
      if (params.provincia && params.provincia !== "all")
        queryParams.append("provincia", params.provincia);
      if (params.localidad && params.localidad !== "all")
        queryParams.append("localidad", params.localidad);

      const queryString = queryParams.toString();
      const url = queryString ? `/customers?${queryString}` : "/customers";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer by ID
  getCustomer: async (id) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle customer status (activate/deactivate)
  toggleCustomerStatus: async (id) => {
    try {
      const response = await api.patch(`/customers/${id}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete customer permanently
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // SPECIALIZED QUERIES FOR POS
  // ==========================================

  // Get only active customers (for selects in POS)
  getActiveCustomers: async () => {
    try {
      const response = await api.get("/customers/active");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Quick search customers by phone or name (for POS)
  searchCustomers: async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        return { data: [] };
      }
      const response = await api.get(
        `/customers/search?q=${encodeURIComponent(query.trim())}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // LOCATION HELPERS
  // ==========================================

  // Get distinct provinces for filters
  getProvinces: async () => {
    try {
      const response = await api.get("/customers/provinces");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get localities by province
  getLocalitiesByProvince: async (provincia) => {
    try {
      const response = await api.get(
        `/customers/provinces/${encodeURIComponent(provincia)}/localities`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  // Validate customer data before submission
  validateCustomerData: (customerData) => {
    const errors = [];

    // Required fields
    if (!customerData.nombre || !customerData.nombre.trim()) {
      errors.push("El nombre es obligatorio");
    }

    if (!customerData.apellido || !customerData.apellido.trim()) {
      errors.push("El apellido es obligatorio");
    }

    if (!customerData.telefono || !customerData.telefono.trim()) {
      errors.push("El teléfono es obligatorio");
    }

    if (!customerData.calle || !customerData.calle.trim()) {
      errors.push("La calle es obligatoria");
    }

    if (!customerData.altura || !customerData.altura.trim()) {
      errors.push("La altura es obligatoria");
    }

    if (!customerData.codigo_postal || !customerData.codigo_postal.trim()) {
      errors.push("El código postal es obligatorio");
    }

    if (!customerData.provincia || !customerData.provincia.trim()) {
      errors.push("La provincia es obligatoria");
    }

    if (!customerData.localidad || !customerData.localidad.trim()) {
      errors.push("La localidad es obligatoria");
    }

    // Field length validations
    if (customerData.nombre && customerData.nombre.trim().length < 2) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }

    if (customerData.apellido && customerData.apellido.trim().length < 2) {
      errors.push("El apellido debe tener al menos 2 caracteres");
    }

    if (customerData.telefono && customerData.telefono.trim().length < 8) {
      errors.push("El teléfono debe tener al menos 8 caracteres");
    }

    // Email validation (optional)
    if (customerData.email && customerData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email.trim())) {
        errors.push("El email debe tener un formato válido");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate phone number format (Argentina)
  validatePhoneNumber: (phone) => {
    if (!phone) return false;

    // Remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Check if it's a valid Argentine phone number
    // Should be 8-15 digits
    const phoneRegex = /^[\d]{8,15}$/;
    return phoneRegex.test(cleanPhone);
  },

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  // Get full customer name
  getFullName: (customer) => {
    if (!customer) return "";
    return `${customer.nombre || ""} ${customer.apellido || ""}`.trim();
  },

  // Get full customer address
  getFullAddress: (customer) => {
    if (!customer) return "";

    let address = `${customer.calle || ""} ${customer.altura || ""}`.trim();

    if (customer.piso) address += `, Piso ${customer.piso}`;
    if (customer.dpto) address += `, Dpto ${customer.dpto}`;

    address += ` - CP: ${customer.codigo_postal || ""} - ${
      customer.localidad || ""
    }, ${customer.provincia || ""}`;

    if (customer.aclaracion) address += ` (${customer.aclaracion})`;

    return address;
  },

  // Get customer type info with colors
  getCustomerTypeInfo: (tipo_cliente) => {
    const typeMap = {
      Nuevo: {
        color: "info",
        text: "Nuevo Cliente",
        icon: "✨",
        description: "Primera vez comprando",
      },
      Recurrente: {
        color: "success",
        text: "Cliente Recurrente",
        icon: "⭐",
        description: "Ya realizó compras anteriores",
      },
    };
    return (
      typeMap[tipo_cliente] || {
        color: "default",
        text: tipo_cliente || "Desconocido",
        icon: "❓",
        description: "",
      }
    );
  },

  // Format customer info for display in POS
  formatCustomerForPOS: (customer) => {
    if (!customer) return null;

    return {
      id: customer.id,
      display_name: customerService.getFullName(customer),
      phone: customer.telefono,
      email: customer.email || "",
      address: customerService.getFullAddress(customer),
      type: customerService.getCustomerTypeInfo(customer.tipo_cliente),
      status: customer.status,
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

    if (filters.tipo_cliente && filters.tipo_cliente !== "all") {
      params.tipo_cliente = filters.tipo_cliente;
    }

    if (filters.provincia && filters.provincia !== "all") {
      params.provincia = filters.provincia;
    }

    if (filters.localidad && filters.localidad !== "all") {
      params.localidad = filters.localidad;
    }

    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    return params;
  },

  // Prepare customer data for API submission
  prepareCustomerData: (formData) => {
    return {
      nombre: formData.nombre?.trim() || "",
      apellido: formData.apellido?.trim() || "",
      telefono: formData.telefono?.trim() || "",
      email: formData.email?.trim() || null,
      calle: formData.calle?.trim() || "",
      altura: formData.altura?.trim() || "",
      piso: formData.piso?.trim() || null,
      dpto: formData.dpto?.trim() || null,
      codigo_postal: formData.codigo_postal?.trim() || "",
      aclaracion: formData.aclaracion?.trim() || null,
      provincia: formData.provincia?.trim() || "",
      localidad: formData.localidad?.trim() || "",
      status: formData.status !== undefined ? formData.status : true,
    };
  },

  // Clean phone number for storage
  cleanPhoneNumber: (phone) => {
    if (!phone) return "";

    // Remove common formatting characters but keep the digits
    return phone.replace(/[\s\-\(\)]/g, "");
  },

  // Format phone number for display
  formatPhoneNumber: (phone) => {
    if (!phone) return "";

    const cleaned = customerService.cleanPhoneNumber(phone);

    // For Argentine numbers, try to format nicely
    if (cleaned.length === 10) {
      // Format as (011) 1234-5678
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 7)}-${cleaned.slice(
        7
      )}`;
    } else if (cleaned.length === 8) {
      // Format as 1234-5678
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }

    return cleaned;
  },

  // ==========================================
  // QUICK ACTIONS FOR POS
  // ==========================================

  // Create customer quickly for POS (minimal required fields)
  createQuickCustomer: async (basicData) => {
    try {
      const customerData = {
        nombre: basicData.nombre,
        apellido: basicData.apellido,
        telefono: basicData.telefono,
        email: basicData.email || null,
        calle: basicData.calle || "Sin especificar",
        altura: basicData.altura || "S/N",
        codigo_postal: basicData.codigo_postal || "0000",
        provincia: basicData.provincia || "Buenos Aires",
        localidad: basicData.localidad || "CABA",
        aclaracion: "Cliente creado desde POS",
      };

      const response = await customerService.createCustomer(customerData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Check if customer already exists by phone
  checkCustomerExists: async (telefono) => {
    try {
      const results = await customerService.searchCustomers(telefono);
      const exactMatch = results.data?.find(
        (customer) =>
          customerService.cleanPhoneNumber(customer.telefono) ===
          customerService.cleanPhoneNumber(telefono)
      );
      return exactMatch || null;
    } catch (error) {
      return null;
    }
  },

  // ==========================================
  // ARGENTINA SPECIFIC HELPERS
  // ==========================================

  // Common Argentine provinces
  getArgentineProvinces: () => {
    return [
      "Buenos Aires",
      "Catamarca",
      "Chaco",
      "Chubut",
      "Córdoba",
      "Corrientes",
      "Entre Ríos",
      "Formosa",
      "Jujuy",
      "La Pampa",
      "La Rioja",
      "Mendoza",
      "Misiones",
      "Neuquén",
      "Río Negro",
      "Salta",
      "San Juan",
      "San Luis",
      "Santa Cruz",
      "Santa Fe",
      "Santiago del Estero",
      "Tierra del Fuego",
      "Tucumán",
      "Ciudad Autónoma de Buenos Aires",
    ];
  },
};

// Export por defecto también
export default customerService;
