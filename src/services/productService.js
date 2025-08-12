import api from "./api";

// ✅ CONSTANTES CENTRALIZADAS
const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999999,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 255,
  CACHE_TTL: 300000, // 5 minutos para cache
  DEFAULT_STOCK_MIN: 5,
};

// ✅ CACHE SIMPLE PARA DATOS ESTÁTICOS
const productCache = {
  data: new Map(),
  timestamps: new Map(),

  get: (key) => {
    const timestamp = productCache.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > PRODUCT_CONSTANTS.CACHE_TTL) {
      productCache.delete(key);
      return null;
    }
    return productCache.data.get(key);
  },

  set: (key, value) => {
    productCache.data.set(key, value);
    productCache.timestamps.set(key, Date.now());
  },

  delete: (key) => {
    productCache.data.delete(key);
    productCache.timestamps.delete(key);
  },

  clear: () => {
    productCache.data.clear();
    productCache.timestamps.clear();
  },
};

// ✅ HELPER PARA VALIDAR PARÁMETROS DE ID
const validateId = (id, fieldName = "ID") => {
  if (!id) {
    throw new Error(`${fieldName} es requerido`);
  }

  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    throw new Error(`${fieldName} debe ser un número válido mayor a 0`);
  }

  return numId;
};

// ✅ HELPER PARA VALIDAR PARÁMETROS DE CONSULTA
const validateQueryParams = (params) => {
  const errors = [];

  if (params.page && (isNaN(params.page) || parseInt(params.page) < 1)) {
    errors.push("Page debe ser un número mayor a 0");
  }

  if (
    params.limit &&
    (isNaN(params.limit) ||
      parseInt(params.limit) < 1 ||
      parseInt(params.limit) > 100)
  ) {
    errors.push("Limit debe ser un número entre 1 y 100");
  }

  if (params.search && typeof params.search !== "string") {
    errors.push("Search debe ser una cadena de texto");
  }

  return errors;
};

// ✅ HELPER PARA LIMPIAR PARÁMETROS DE CONSULTA
const cleanQueryParams = (params) => {
  const cleanParams = {};

  // Solo incluir parámetros válidos y no vacíos
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      // Limpiar strings
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed) cleanParams[key] = trimmed;
      } else {
        cleanParams[key] = value;
      }
    }
  });

  return cleanParams;
};

// ✅ SERVICIO MEJORADO
const productService = {
  // ==========================================
  // CORE CRUD OPERATIONS
  // ==========================================

  // ✅ OBTENER PRODUCTOS - Con validaciones y mejor manejo
  getProducts: async (params = {}) => {
    try {
      // Validar parámetros
      const validationErrors = validateQueryParams(params);
      if (validationErrors.length > 0) {
        throw new Error(`Parámetros inválidos: ${validationErrors.join(", ")}`);
      }

      // Limpiar parámetros
      const cleanParams = cleanQueryParams(params);

      // Construir query string solo con parámetros válidos
      const queryParams = new URLSearchParams();

      Object.entries(cleanParams).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      const url = queryString ? `/products?${queryString}` : "/products";

      const response = await api.get(url);

      // Validar respuesta
      if (!response.data) {
        throw new Error("Respuesta inválida del servidor");
      }

      return response.data;
    } catch (error) {
      console.error("Error en getProducts:", error);
      throw (
        error.response?.data || error.message || "Error obteniendo productos"
      );
    }
  },

  // ✅ OBTENER PRODUCTO POR ID - Con validaciones y cache
  getProduct: async (id) => {
    try {
      // Validar ID
      const validId = validateId(id, "Product ID");

      // Verificar cache primero
      const cacheKey = `product_${validId}`;
      const cached = productCache.get(cacheKey);
      if (cached) {
        console.log(`📦 Producto ${validId} obtenido desde cache`);
        return cached;
      }

      const response = await api.get(`/products/${validId}`);

      if (!response.data) {
        throw new Error("Producto no encontrado");
      }

      // Guardar en cache
      productCache.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      console.error(`Error obteniendo producto ${id}:`, error);
      throw (
        error.response?.data || error.message || "Error obteniendo producto"
      );
    }
  },

  // ✅ CREAR PRODUCTO - Con validaciones mejoradas
  createProduct: async (productData) => {
    try {
      // Validar datos antes de enviar
      const validation = productService.validateProductData(productData);
      if (!validation.isValid) {
        const error = new Error(
          `Datos inválidos: ${validation.errors.join(", ")}`
        );
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      // Limpiar y preparar datos
      const cleanData = productService.prepareProductData(productData);

      const response = await api.post("/products", cleanData);

      if (!response.data) {
        throw new Error("Error creando producto");
      }

      // Limpiar cache relacionado
      productCache.clear();

      return response.data;
    } catch (error) {
      console.error("Error creando producto:", error);
      if (error.code === "VALIDATION_ERROR") {
        throw error;
      }
      throw error.response?.data || error.message || "Error creando producto";
    }
  },

  // ✅ ACTUALIZAR PRODUCTO - Con validaciones y cache invalidation
  updateProduct: async (id, productData) => {
    try {
      // Validar ID
      const validId = validateId(id, "Product ID");

      // Validar datos
      const validation = productService.validateProductData(productData);
      if (!validation.isValid) {
        const error = new Error(
          `Datos inválidos: ${validation.errors.join(", ")}`
        );
        error.code = "VALIDATION_ERROR";
        throw error;
      }

      // Limpiar y preparar datos
      const cleanData = productService.prepareProductData(productData);

      const response = await api.put(`/products/${validId}`, cleanData);

      if (!response.data) {
        throw new Error("Error actualizando producto");
      }

      // Invalidar cache
      productCache.delete(`product_${validId}`);
      productCache.clear(); // Limpiar cache de listas también

      return response.data;
    } catch (error) {
      console.error(`Error actualizando producto ${id}:`, error);
      if (error.code === "VALIDATION_ERROR") {
        throw error;
      }
      throw (
        error.response?.data || error.message || "Error actualizando producto"
      );
    }
  },

  // ✅ TOGGLE STATUS - Con validaciones
  toggleProductStatus: async (id) => {
    try {
      const validId = validateId(id, "Product ID");

      const response = await api.patch(`/products/${validId}/toggle`);

      if (!response.data) {
        throw new Error("Error cambiando estado del producto");
      }

      // Invalidar cache
      productCache.delete(`product_${validId}`);
      productCache.clear();

      return response.data;
    } catch (error) {
      console.error(`Error cambiando estado del producto ${id}:`, error);
      throw (
        error.response?.data ||
        error.message ||
        "Error cambiando estado del producto"
      );
    }
  },

  // ✅ ELIMINAR PRODUCTO - Con validaciones
  deleteProduct: async (id) => {
    try {
      const validId = validateId(id, "Product ID");

      const response = await api.delete(`/products/${validId}`);

      // Invalidar cache
      productCache.delete(`product_${validId}`);
      productCache.clear();

      return response.data || { message: "Producto eliminado exitosamente" };
    } catch (error) {
      console.error(`Error eliminando producto ${id}:`, error);
      throw (
        error.response?.data || error.message || "Error eliminando producto"
      );
    }
  },

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  // ✅ FORMATEAR PRECIO - Con validaciones
  formatPrice: (price) => {
    if (price === null || price === undefined) return "$0";

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "$0";

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  },

  // ✅ OBTENER ESTADO DE STOCK - Con validaciones mejoradas
  getStockStatus: (product) => {
    if (!product || typeof product !== "object") {
      return { status: "unknown", color: "default", text: "Desconocido" };
    }

    const stock = parseInt(product.stock) || 0;
    const stockMinimo =
      parseInt(product.stock_minimo) || PRODUCT_CONSTANTS.DEFAULT_STOCK_MIN;

    if (stock <= 0) {
      return {
        status: "sin_stock",
        color: "error",
        text: "Sin Stock",
        icon: "❌",
        description: "Producto agotado",
        priority: 3,
      };
    }

    if (stock <= stockMinimo) {
      return {
        status: "stock_bajo",
        color: "warning",
        text: "Stock Bajo",
        icon: "⚠️",
        description: `Solo quedan ${stock} unidades`,
        priority: 2,
      };
    }

    return {
      status: "stock_normal",
      color: "success",
      text: "Stock Normal",
      icon: "✅",
      description: `${stock} unidades disponibles`,
      priority: 1,
    };
  },

  // ✅ BUILD SEARCH PARAMS - Mejorado con validaciones
  buildSearchParams: (filters) => {
    if (!filters || typeof filters !== "object") {
      return {};
    }

    const params = {};

    // Validar y limpiar cada filtro
    if (filters.search && typeof filters.search === "string") {
      const trimmed = filters.search.trim();
      if (trimmed.length >= 1) {
        // Mínimo 1 carácter
        params.search = trimmed;
      }
    }

    if (filters.categoria_id && filters.categoria_id !== "all") {
      const catId = parseInt(filters.categoria_id);
      if (!isNaN(catId) && catId > 0) {
        params.categoria_id = catId;
      }
    }

    if (filters.proveedor_id && filters.proveedor_id !== "all") {
      const provId = parseInt(filters.proveedor_id);
      if (!isNaN(provId) && provId > 0) {
        params.proveedor_id = provId;
      }
    }

    if (filters.status && filters.status !== "all") {
      // Validar que sea un estado válido
      const validStatuses = ["active", "inactive", "true", "false"];
      if (validStatuses.includes(filters.status.toString().toLowerCase())) {
        params.status = filters.status;
      }
    }

    if (filters.low_stock === true || filters.low_stock === "true") {
      params.low_stock = "true";
    }

    if (filters.order_by && typeof filters.order_by === "string") {
      const validOrderFields = [
        "fragancia",
        "precio_venta",
        "stock",
        "created_at",
      ];
      if (validOrderFields.includes(filters.order_by)) {
        params.order_by = filters.order_by;
        params.order_direction =
          filters.order_direction === "DESC" ? "DESC" : "ASC";
      }
    }

    // Paginación
    if (filters.page) {
      const page = parseInt(filters.page);
      if (!isNaN(page) && page >= 1) {
        params.page = page;
      }
    }

    if (filters.limit) {
      const limit = parseInt(filters.limit);
      if (!isNaN(limit) && limit >= 1 && limit <= 100) {
        params.limit = limit;
      }
    }

    return params;
  },

  // ==========================================
  // VALIDATION HELPERS
  // ==========================================

  // ✅ VALIDAR URL DE IMAGEN - Mejorado
  isValidImageUrl: (url) => {
    if (!url || typeof url !== "string") return true; // URL vacía es válida

    const trimmed = url.trim();
    if (!trimmed) return true;

    try {
      const urlObj = new URL(trimmed);

      // Validar protocolo
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return false;
      }

      // Validar extensiones de imagen comunes (opcional)
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
      ];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some((ext) =>
        pathname.endsWith(ext)
      );

      // Permitir URLs sin extensión (pueden ser URLs dinámicas)
      return true;
    } catch {
      return false;
    }
  },

  // ✅ VALIDAR DATOS DE PRODUCTO - Significativamente mejorado
  validateProductData: (productData) => {
    const errors = [];

    if (!productData || typeof productData !== "object") {
      return { isValid: false, errors: ["Datos de producto requeridos"] };
    }

    // Validar nombre/fragancia
    if (!productData.fragancia || typeof productData.fragancia !== "string") {
      errors.push("El nombre de la fragancia es obligatorio");
    } else {
      const trimmed = productData.fragancia.trim();
      if (trimmed.length < PRODUCT_CONSTANTS.MIN_NAME_LENGTH) {
        errors.push(
          `El nombre debe tener al menos ${PRODUCT_CONSTANTS.MIN_NAME_LENGTH} carácter`
        );
      }
      if (trimmed.length > PRODUCT_CONSTANTS.MAX_NAME_LENGTH) {
        errors.push(
          `El nombre no puede exceder ${PRODUCT_CONSTANTS.MAX_NAME_LENGTH} caracteres`
        );
      }
    }

    // Validar precio de venta
    if (!productData.precio_venta && productData.precio_venta !== 0) {
      errors.push("El precio de venta es obligatorio");
    } else {
      const precio = parseFloat(productData.precio_venta);
      if (isNaN(precio)) {
        errors.push("El precio de venta debe ser un número válido");
      } else if (precio <= PRODUCT_CONSTANTS.MIN_PRICE) {
        errors.push("El precio de venta debe ser mayor a 0");
      } else if (precio > PRODUCT_CONSTANTS.MAX_PRICE) {
        errors.push(
          `El precio de venta no puede ser mayor a ${productService.formatPrice(
            PRODUCT_CONSTANTS.MAX_PRICE
          )}`
        );
      }
    }

    // Validar precio de compra (opcional)
    if (
      productData.precio_compra !== undefined &&
      productData.precio_compra !== null &&
      productData.precio_compra !== ""
    ) {
      const precioCompra = parseFloat(productData.precio_compra);
      if (isNaN(precioCompra)) {
        errors.push("El precio de compra debe ser un número válido");
      } else if (precioCompra < 0) {
        errors.push("El precio de compra no puede ser negativo");
      } else if (precioCompra > PRODUCT_CONSTANTS.MAX_PRICE) {
        errors.push(
          `El precio de compra no puede ser mayor a ${productService.formatPrice(
            PRODUCT_CONSTANTS.MAX_PRICE
          )}`
        );
      }
    }

    // Validar stock
    if (
      productData.stock !== undefined &&
      productData.stock !== null &&
      productData.stock !== ""
    ) {
      const stock = parseInt(productData.stock);
      if (isNaN(stock)) {
        errors.push("El stock debe ser un número entero");
      } else if (stock < PRODUCT_CONSTANTS.MIN_STOCK) {
        errors.push("El stock no puede ser negativo");
      } else if (stock > PRODUCT_CONSTANTS.MAX_STOCK) {
        errors.push(
          `El stock no puede ser mayor a ${PRODUCT_CONSTANTS.MAX_STOCK}`
        );
      }
    }

    // Validar stock mínimo
    if (
      productData.stock_minimo !== undefined &&
      productData.stock_minimo !== null &&
      productData.stock_minimo !== ""
    ) {
      const stockMin = parseInt(productData.stock_minimo);
      if (isNaN(stockMin)) {
        errors.push("El stock mínimo debe ser un número entero");
      } else if (stockMin < 0) {
        errors.push("El stock mínimo no puede ser negativo");
      }
    }

    // Validar URL de imagen
    if (
      productData.imagen_url &&
      !productService.isValidImageUrl(productData.imagen_url)
    ) {
      errors.push("La URL de la imagen no es válida");
    }

    // Validar IDs de relaciones
    if (
      productData.categoria_id !== undefined &&
      productData.categoria_id !== null &&
      productData.categoria_id !== ""
    ) {
      const catId = parseInt(productData.categoria_id);
      if (isNaN(catId) || catId <= 0) {
        errors.push("ID de categoría inválido");
      }
    }

    if (
      productData.proveedor_id !== undefined &&
      productData.proveedor_id !== null &&
      productData.proveedor_id !== ""
    ) {
      const provId = parseInt(productData.proveedor_id);
      if (isNaN(provId) || provId <= 0) {
        errors.push("ID de proveedor inválido");
      }
    }

    if (
      productData.medida_id !== undefined &&
      productData.medida_id !== null &&
      productData.medida_id !== ""
    ) {
      const medId = parseInt(productData.medida_id);
      if (isNaN(medId) || medId <= 0) {
        errors.push("ID de medida inválido");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ==========================================
  // DATA PREPARATION
  // ==========================================

  // ✅ NUEVA FUNCIÓN: Preparar datos para API
  prepareProductData: (formData) => {
    const cleanData = {};

    // Limpiar y preparar strings
    if (formData.fragancia) {
      cleanData.fragancia = formData.fragancia.trim();
    }

    if (formData.descripcion) {
      cleanData.descripcion = formData.descripcion.trim() || null;
    }

    if (formData.imagen_url) {
      cleanData.imagen_url = formData.imagen_url.trim() || null;
    }

    // Convertir números
    if (
      formData.precio_venta !== undefined &&
      formData.precio_venta !== null &&
      formData.precio_venta !== ""
    ) {
      cleanData.precio_venta = parseFloat(formData.precio_venta);
    }

    if (
      formData.precio_compra !== undefined &&
      formData.precio_compra !== null &&
      formData.precio_compra !== ""
    ) {
      cleanData.precio_compra = parseFloat(formData.precio_compra) || null;
    }

    if (
      formData.stock !== undefined &&
      formData.stock !== null &&
      formData.stock !== ""
    ) {
      cleanData.stock = parseInt(formData.stock) || 0;
    }

    if (
      formData.stock_minimo !== undefined &&
      formData.stock_minimo !== null &&
      formData.stock_minimo !== ""
    ) {
      cleanData.stock_minimo =
        parseInt(formData.stock_minimo) || PRODUCT_CONSTANTS.DEFAULT_STOCK_MIN;
    }

    // IDs de relaciones
    if (
      formData.categoria_id !== undefined &&
      formData.categoria_id !== null &&
      formData.categoria_id !== ""
    ) {
      cleanData.categoria_id = parseInt(formData.categoria_id) || null;
    }

    if (
      formData.proveedor_id !== undefined &&
      formData.proveedor_id !== null &&
      formData.proveedor_id !== ""
    ) {
      cleanData.proveedor_id = parseInt(formData.proveedor_id) || null;
    }

    if (
      formData.medida_id !== undefined &&
      formData.medida_id !== null &&
      formData.medida_id !== ""
    ) {
      cleanData.medida_id = parseInt(formData.medida_id) || null;
    }

    // Boolean/status
    if (formData.activo !== undefined) {
      cleanData.activo = Boolean(formData.activo);
    }

    return cleanData;
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  // ✅ NUEVA FUNCIÓN: Obtener productos con stock bajo
  getProductsWithLowStock: async () => {
    try {
      return await productService.getProducts({ low_stock: "true" });
    } catch (error) {
      console.error("Error obteniendo productos con stock bajo:", error);
      throw error;
    }
  },

  // ✅ NUEVA FUNCIÓN: Buscar productos por nombre
  searchProductsByName: async (query, limit = 10) => {
    try {
      if (!query || typeof query !== "string" || query.trim().length < 1) {
        return { data: [] };
      }

      return await productService.getProducts({
        search: query.trim(),
        limit: Math.min(limit, 50), // Máximo 50 resultados
      });
    } catch (error) {
      console.error("Error buscando productos:", error);
      throw error;
    }
  },

  // ✅ NUEVA FUNCIÓN: Limpiar cache
  clearCache: () => {
    productCache.clear();
    console.log("🧹 Cache de productos limpiado");
  },

  // ✅ NUEVA FUNCIÓN: Obtener estadísticas de cache
  getCacheStats: () => {
    return {
      size: productCache.data.size,
      keys: Array.from(productCache.data.keys()),
      oldestEntry: Math.min(...Array.from(productCache.timestamps.values())),
      cleanupNeeded: Array.from(productCache.timestamps.entries()).filter(
        ([_, timestamp]) => Date.now() - timestamp > PRODUCT_CONSTANTS.CACHE_TTL
      ).length,
    };
  },
};

// ✅ EXPORTS COMPATIBLES - Mantener ambos para compatibilidad total
export { productService };
export default productService;
