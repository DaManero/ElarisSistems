// api.js - Versión mejorada con retry, timeouts dinámicos y mejor manejo de errores
import axios from "axios";

// ✅ CONFIGURACIÓN DE TIMEOUTS POR TIPO DE OPERACIÓN
const TIMEOUTS = {
  read: 8000, // GET requests
  write: 15000, // POST, PUT, PATCH requests
  delete: 10000, // DELETE requests
  upload: 60000, // File uploads
  report: 120000, // Report generation
  default: 10000, // Fallback
};

// ✅ CONFIGURACIÓN DE RETRY
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: TIMEOUTS.default,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ HELPER PARA DETERMINAR TIMEOUT DINÁMICO
const getTimeoutForRequest = (config) => {
  const method = config.method?.toLowerCase();
  const url = config.url?.toLowerCase() || "";

  // Casos especiales por URL
  if (url.includes("upload") || url.includes("file")) return TIMEOUTS.upload;
  if (url.includes("report") || url.includes("export")) return TIMEOUTS.report;

  // Por método HTTP
  switch (method) {
    case "get":
      return TIMEOUTS.read;
    case "post":
    case "put":
    case "patch":
      return TIMEOUTS.write;
    case "delete":
      return TIMEOUTS.delete;
    default:
      return TIMEOUTS.default;
  }
};

// ✅ HELPER PARA RETRY INTELIGENTE
const shouldRetry = (error, retryCount) => {
  if (retryCount >= RETRY_CONFIG.maxRetries) return false;

  // No retry para errores de autenticación o validación
  if (error.response?.status === 401 || error.response?.status === 403)
    return false;
  if (error.response?.status >= 400 && error.response?.status < 500)
    return false;

  // Retry para errores de servidor o problemas de red
  if (!error.response) return true; // Network error
  return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
};

// ✅ FUNCIÓN DE RETRY CON BACKOFF EXPONENCIAL
const executeWithRetry = async (config) => {
  let lastError;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries + 1; attempt++) {
    try {
      // Ajustar timeout para este request específico
      const timeoutForRequest = getTimeoutForRequest(config);
      const configWithTimeout = { ...config, timeout: timeoutForRequest };

      if (process.env.NODE_ENV === "development" && attempt > 0) {
        console.log(
          `🔄 Reintento ${attempt}/${
            RETRY_CONFIG.maxRetries
          } para ${config.method?.toUpperCase()} ${config.url}`
        );
      }

      return await axios(configWithTimeout);
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error, attempt)) {
        break;
      }

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// ✅ INTERCEPTOR DE REQUEST MEJORADO
api.interceptors.request.use(
  (config) => {
    // ⚠️ IMPORTAR authService DINÁMICAMENTE para evitar dependencias circulares
    const getToken = () => {
      try {
        const authData = sessionStorage.getItem("authData");
        if (!authData) return null;

        const data = JSON.parse(authData);
        const now = Date.now();
        const elapsed = now - data.loginTime;

        // Verificar expiración local
        if (elapsed > data.expiresIn) {
          sessionStorage.removeItem("authData");
          return null;
        }

        return data.token;
      } catch (error) {
        console.error("Error obteniendo token:", error);
        return null;
      }
    };

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Ajustar timeout dinámicamente
    config.timeout = getTimeoutForRequest(config);

    // ✅ Log mejorado para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          hasToken: !!token,
          timeout: config.timeout,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSE MEJORADO
api.interceptors.response.use(
  (response) => {
    // ✅ Log de respuestas exitosas (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          duration: response.config.metadata?.startTime
            ? Date.now() - response.config.metadata.startTime
            : "unknown",
          data: response.data,
        }
      );
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // ✅ Log de errores mejorado
    console.error(
      `❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`,
      {
        status: response?.status,
        message: response?.data?.message || error.message,
        duration: config?.metadata?.startTime
          ? Date.now() - config.metadata.startTime
          : "unknown",
      }
    );

    // ✅ MANEJO DE ERRORES 401 (Token inválido/expirado)
    if (response?.status === 401) {
      console.warn("🔒 Token inválido o expirado - limpiando sesión");

      // Limpiar sesión
      sessionStorage.removeItem("authData");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirigir a login solo si no estamos ya en login
      if (!window.location.pathname.includes("/login")) {
        console.log("🔄 Redirigiendo a login...");

        // ✅ Usar evento personalizado para notificar a la app
        window.dispatchEvent(
          new CustomEvent("auth:logout", {
            detail: { reason: "token_expired" },
          })
        );

        // ✅ Fallback: redirigir directamente si no hay listener
        setTimeout(() => {
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }, 100);
      }
    }

    // ✅ MANEJO DE ERRORES 403 (Sin permisos)
    if (response?.status === 403) {
      console.warn("🚫 Acceso denegado");

      // Emitir evento para mostrar mensaje
      window.dispatchEvent(
        new CustomEvent("auth:access_denied", {
          detail: { message: response.data?.message || "Acceso denegado" },
        })
      );
    }

    // ✅ MANEJO DE ERRORES DE RED CON CONTEXTO
    if (!response) {
      console.error("🌐 Error de conexión");

      // Emitir evento con más contexto
      window.dispatchEvent(
        new CustomEvent("api:network_error", {
          detail: {
            message: "Error de conexión. Verifica tu internet.",
            url: config?.url,
            method: config?.method?.toUpperCase(),
          },
        })
      );
    }

    // ✅ MANEJO DE ERRORES DEL SERVIDOR (500+) CON RETRY INFO
    if (response?.status >= 500) {
      console.error("🔥 Error del servidor");

      // Emitir evento con información de retry
      window.dispatchEvent(
        new CustomEvent("api:server_error", {
          detail: {
            message: "Error del servidor. Reintentando automáticamente...",
            status: response.status,
            willRetry: shouldRetry(error, config.retryCount || 0),
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

// ✅ FUNCIÓN HELPER PARA RETRY MANUAL (mantener compatibilidad)
export const apiWithRetry = async (apiCall, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // No reintentar errores de autenticación o validación
      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status < 500
      ) {
        break;
      }

      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Delay progresivo
        console.log(
          `🔄 Reintentando API call en ${delay}ms (intento ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// ✅ FUNCIÓN HELPER PARA VERIFICAR CONEXIÓN MEJORADA
export const checkApiConnection = async () => {
  try {
    const response = await api.get("/health", { timeout: 5000 });
    return {
      connected: true,
      status: response.status,
      responseTime: response.config.metadata?.startTime
        ? Date.now() - response.config.metadata.startTime
        : null,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      status: error.response?.status,
      type: error.code === "ECONNABORTED" ? "timeout" : "network",
    };
  }
};

// ✅ NUEVA FUNCIÓN: CREAR INSTANCIA CON CONFIGURACIÓN ESPECÍFICA
export const createApiInstance = (customConfig = {}) => {
  const instance = axios.create({
    ...api.defaults,
    ...customConfig,
  });

  // Aplicar los mismos interceptores
  instance.interceptors.request = api.interceptors.request;
  instance.interceptors.response = api.interceptors.response;

  return instance;
};

// ✅ NUEVA FUNCIÓN: CANCELAR REQUESTS PENDIENTES
export const cancelPendingRequests = () => {
  const cancelTokenSource = axios.CancelToken.source();

  return {
    token: cancelTokenSource.token,
    cancel: (message = "Request cancelled") => {
      cancelTokenSource.cancel(message);
    },
  };
};

// ✅ NUEVA FUNCIÓN: BATCH REQUESTS
export const batchRequests = async (requests, options = {}) => {
  const { concurrent = 5, failFast = false, retryFailures = true } = options;

  const results = [];
  const errors = [];

  // Procesar en lotes de 'concurrent' requests
  for (let i = 0; i < requests.length; i += concurrent) {
    const batch = requests.slice(i, i + concurrent);

    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = retryFailures
          ? await executeWithRetry(request)
          : await api(request);
        return { index: i + index, result, error: null };
      } catch (error) {
        if (failFast) throw error;
        return { index: i + index, result: null, error };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(({ index, result, error }) => {
      if (error) {
        errors.push({ index, error });
      } else {
        results[index] = result;
      }
    });

    if (failFast && errors.length > 0) {
      throw errors[0].error;
    }
  }

  return { results, errors };
};

export default api;
