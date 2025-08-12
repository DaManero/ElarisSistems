// authService.js - Versión mejorada con validaciones, mejor cache y consistencia
import api from "./api";

// ✅ CONSTANTES CENTRALIZADAS
const AUTH_CONSTANTS = {
  MAX_SESSION_TIME: 8 * 60 * 60 * 1000, // 8 horas
  INACTIVITY_TIME: 10 * 60 * 1000, // 10 minutos
  THROTTLE_TIME: 30000, // 30 segundos
  CHECK_INTERVAL: 60000, // 1 minuto
  STORAGE_KEY: "authData",
};

// ✅ EVENTOS DE ACTIVIDAD OPTIMIZADOS
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keypress",
  "scroll",
  "touchstart",
  "click",
  "keydown",
  "wheel",
  "touchmove",
  "touchend",
];

// ✅ HELPER PARA VALIDAR PARÁMETROS
const validateLoginParams = (email, password) => {
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email es requerido");
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password es requerido");
  }

  if (email && email.length > 255) {
    errors.push("Email demasiado largo");
  }

  if (password && password.length > 255) {
    errors.push("Password demasiado largo");
  }

  return errors;
};

// ✅ HELPER PARA MANEJO SEGURO DE STORAGE
const safeStorageHandler = {
  get: (key) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error leyendo ${key} del storage:`, error);
      sessionStorage.removeItem(key);
      return null;
    }
  },

  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error guardando ${key} en storage:`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removiendo ${key} del storage:`, error);
      return false;
    }
  },
};

// ✅ HELPER PARA VALIDAR ESTRUCTURA DE AUTH DATA
const validateAuthData = (data) => {
  if (!data || typeof data !== "object") return false;

  const requiredFields = ["token", "user", "loginTime"];
  return requiredFields.every(
    (field) =>
      data.hasOwnProperty(field) &&
      data[field] !== null &&
      data[field] !== undefined
  );
};

// ✅ SERVICIO MEJORADO
const authService = {
  // ==========================================
  // CORE AUTH METHODS
  // ==========================================

  // ✅ LOGIN MEJORADO - Con validaciones y mejor manejo de errores
  login: async (email, password) => {
    // Validar parámetros de entrada
    const validationErrors = validateLoginParams(email, password);
    if (validationErrors.length > 0) {
      const error = new Error(validationErrors.join(", "));
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      // Validar respuesta del servidor
      if (!response.data?.data?.token || !response.data?.data?.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      // ✅ ALMACENAMIENTO MEJORADO con validación
      const authData = {
        token: response.data.data.token,
        user: response.data.data.user,
        loginTime: Date.now(),
        lastActivity: Date.now(),
        expiresIn: AUTH_CONSTANTS.MAX_SESSION_TIME,
      };

      const saved = safeStorageHandler.set(
        AUTH_CONSTANTS.STORAGE_KEY,
        authData
      );
      if (!saved) {
        console.warn("No se pudo guardar la sesión, continuando en memoria");
      }

      // Limpiar localStorage viejo por seguridad
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignorar errores de localStorage
      }

      // ✅ Iniciar monitoreo de inactividad
      authService.startInactivityMonitoring();

      return response.data;
    } catch (error) {
      // ✅ MANEJO DE ERRORES MEJORADO Y CONSISTENTE
      console.log("=== AUTH SERVICE DEBUG ===");
      console.log("Error response:", error.response);

      if (error.code === "VALIDATION_ERROR") {
        throw error; // Re-throw validation errors as-is
      }

      if (
        error.response?.status === 403 &&
        error.response?.data?.code === "USER_INACTIVE"
      ) {
        const customError = new Error(error.response.data.message);
        customError.code = "USER_INACTIVE";
        customError.title = "Cuenta Inactiva";
        throw customError;
      }

      if (error.response?.status === 403) {
        const customError = new Error(
          error.response.data?.message ||
            "Usuario inactivo. Contacta al administrador para reactivar tu cuenta."
        );
        customError.code = "USER_INACTIVE";
        customError.title = "Cuenta Inactiva";
        throw customError;
      }

      if (error.response?.status === 401) {
        const customError = new Error(
          "Credenciales incorrectas. Verifica tu email y contraseña."
        );
        customError.code = "INVALID_CREDENTIALS";
        throw customError;
      }

      if (error.response?.status >= 500) {
        const customError = new Error(
          "Error del servidor. Intenta de nuevo más tarde."
        );
        customError.code = "SERVER_ERROR";
        throw customError;
      }

      // ✅ Error genérico mejorado
      const genericError = new Error(
        error.response?.data?.message ||
          error.message ||
          "Error inesperado durante el login"
      );
      genericError.code = "UNKNOWN_ERROR";
      throw genericError;
    }
  },

  // ✅ LOGOUT MEJORADO - Con mejor limpieza
  logout: async () => {
    try {
      // Intentar notificar al servidor (opcional)
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Error en logout del servidor:", error.message);
      // No fallar el logout por errores del servidor
    } finally {
      // ✅ Limpieza completa y segura
      authService.stopInactivityMonitoring();

      // Limpiar sessionStorage
      safeStorageHandler.remove(AUTH_CONSTANTS.STORAGE_KEY);

      // Limpiar localStorage por seguridad
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignorar errores de localStorage
      }
    }

    return { status: "success", message: "Logout successful" };
  },

  // ==========================================
  // SESSION VALIDATION METHODS
  // ==========================================

  // ✅ VERIFICACIÓN MEJORADA - Con validaciones robustas
  isLoggedIn: () => {
    try {
      const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);

      // Validar estructura de datos
      if (!validateAuthData(authData)) {
        return false;
      }

      const now = Date.now();

      // ✅ Verificar expiración por tiempo total (8 horas)
      const totalElapsed = now - authData.loginTime;
      if (totalElapsed > AUTH_CONSTANTS.MAX_SESSION_TIME) {
        console.log("🔒 Sesión expirada por tiempo máximo (8h)");
        authService.forceLogout("Sesión expirada después de 8 horas");
        return false;
      }

      // ✅ Verificar inactividad (10 minutos)
      const inactivityElapsed =
        now - (authData.lastActivity || authData.loginTime);
      if (inactivityElapsed > AUTH_CONSTANTS.INACTIVITY_TIME) {
        console.log("😴 Sesión expirada por inactividad (10min)");
        authService.forceLogout("Sesión cerrada por inactividad");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verificando sesión:", error);
      safeStorageHandler.remove(AUTH_CONSTANTS.STORAGE_KEY);
      return false;
    }
  },

  // ✅ ACTUALIZAR ACTIVIDAD MEJORADO - Con throttling inteligente
  updateActivity: () => {
    try {
      const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);
      if (!validateAuthData(authData)) return;

      const now = Date.now();

      // ✅ Throttling inteligente - solo actualizar si ha pasado suficiente tiempo
      const timeSinceLastUpdate =
        now - (authData.lastActivity || authData.loginTime);
      if (timeSinceLastUpdate < AUTH_CONSTANTS.THROTTLE_TIME) {
        return; // No actualizar tan frecuentemente
      }

      authData.lastActivity = now;
      safeStorageHandler.set(AUTH_CONSTANTS.STORAGE_KEY, authData);

      // Debug ocasional (cada ~30 segundos)
      if (timeSinceLastUpdate >= AUTH_CONSTANTS.THROTTLE_TIME) {
        console.log("👆 Actividad actualizada");
      }
    } catch (error) {
      console.error("Error actualizando actividad:", error);
    }
  },

  // ✅ LOGOUT FORZADO MEJORADO - Con mejor cleanup
  forceLogout: (reason = "Sesión expirada") => {
    try {
      authService.stopInactivityMonitoring();

      // Limpiar storage de forma segura
      safeStorageHandler.remove(AUTH_CONSTANTS.STORAGE_KEY);

      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignorar errores de localStorage
      }

      // Emitir evento para que la app pueda mostrar el mensaje
      window.dispatchEvent(
        new CustomEvent("auth:force_logout", {
          detail: { reason },
        })
      );

      console.log("🚪 Logout forzado:", reason);
    } catch (error) {
      console.error("Error en forceLogout:", error);
      // Asegurar redirección incluso si hay errores
      setTimeout(() => {
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }, 100);
    }
  },

  // ==========================================
  // INACTIVITY MONITORING
  // ==========================================

  // ✅ MONITOREO DE INACTIVIDAD MEJORADO
  startInactivityMonitoring: () => {
    // Detener monitoreo existente por seguridad
    authService.stopInactivityMonitoring();

    // ✅ Throttle mejorado para no actualizar constantemente
    let lastUpdate = 0;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > AUTH_CONSTANTS.THROTTLE_TIME) {
        authService.updateActivity();
        lastUpdate = now;
      }
    };

    // ✅ Agregar listeners con passive para mejor performance
    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, handleActivity, {
        passive: true,
        capture: false,
      });
    });

    // Guardar referencias para cleanup
    window.authActivityEvents = ACTIVITY_EVENTS;
    window.authActivityHandler = handleActivity;

    // ✅ VERIFICACIÓN PERIÓDICA MEJORADA
    window.authInactivityCheck = setInterval(() => {
      try {
        if (!authService.isLoggedIn()) {
          authService.stopInactivityMonitoring();
        }
      } catch (error) {
        console.error("Error en verificación periódica:", error);
        authService.stopInactivityMonitoring();
      }
    }, AUTH_CONSTANTS.CHECK_INTERVAL);

    console.log(
      "👀 Monitoreo de inactividad iniciado (logout automático en 10min sin actividad)"
    );
  },

  // ✅ DETENER MONITOREO MEJORADO - Con cleanup completo
  stopInactivityMonitoring: () => {
    try {
      // Remover event listeners de forma segura
      if (window.authActivityEvents && window.authActivityHandler) {
        window.authActivityEvents.forEach((event) => {
          document.removeEventListener(event, window.authActivityHandler);
        });
        delete window.authActivityEvents;
        delete window.authActivityHandler;
      }

      // Limpiar interval
      if (window.authInactivityCheck) {
        clearInterval(window.authInactivityCheck);
        delete window.authInactivityCheck;
      }

      console.log("👀 Monitoreo de inactividad detenido");
    } catch (error) {
      console.error("Error deteniendo monitoreo:", error);
    }
  },

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  // ✅ INFO DE INACTIVIDAD MEJORADA - Con validaciones
  getInactivityInfo: () => {
    try {
      const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);
      if (!validateAuthData(authData)) return null;

      const now = Date.now();
      const lastActivity = authData.lastActivity || authData.loginTime;
      const inactiveTime = now - lastActivity;
      const remainingTime = AUTH_CONSTANTS.INACTIVITY_TIME - inactiveTime;

      return {
        inactiveMinutes: Math.floor(inactiveTime / (60 * 1000)),
        remainingMinutes: Math.max(0, Math.floor(remainingTime / (60 * 1000))),
        isNearExpiry: remainingTime <= 2 * 60 * 1000, // Últimos 2 minutos
        totalSessionMinutes: Math.floor(
          (now - authData.loginTime) / (60 * 1000)
        ),
      };
    } catch (error) {
      console.error("Error obteniendo info de inactividad:", error);
      return null;
    }
  },

  // ✅ OBTENER USER MEJORADO - Con validaciones
  getCurrentUser: () => {
    try {
      const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);
      if (!validateAuthData(authData)) return null;

      const now = Date.now();

      // Verificar expiración por tiempo total
      const totalElapsed = now - authData.loginTime;
      if (totalElapsed > AUTH_CONSTANTS.MAX_SESSION_TIME) {
        authService.forceLogout("Sesión expirada después de 8 horas");
        return null;
      }

      // Verificar inactividad
      const inactivityElapsed =
        now - (authData.lastActivity || authData.loginTime);
      if (inactivityElapsed > AUTH_CONSTANTS.INACTIVITY_TIME) {
        authService.forceLogout("Sesión cerrada por inactividad");
        return null;
      }

      return authData.user;
    } catch (error) {
      console.error("Error obteniendo usuario actual:", error);
      return null;
    }
  },

  // ✅ OBTENER TOKEN MEJORADO - Con validaciones
  getToken: () => {
    try {
      const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);
      if (!validateAuthData(authData)) return null;

      const now = Date.now();

      // Verificar expiración por tiempo total
      const totalElapsed = now - authData.loginTime;
      if (totalElapsed > AUTH_CONSTANTS.MAX_SESSION_TIME) {
        authService.forceLogout("Sesión expirada después de 8 horas");
        return null;
      }

      // Verificar inactividad
      const inactivityElapsed =
        now - (authData.lastActivity || authData.loginTime);
      if (inactivityElapsed > AUTH_CONSTANTS.INACTIVITY_TIME) {
        authService.forceLogout("Sesión cerrada por inactividad");
        return null;
      }

      return authData.token;
    } catch (error) {
      console.error("Error obteniendo token:", error);
      return null;
    }
  },

  // ✅ PERFIL DEL BACKEND - Sin cambios
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // ROLE & PERMISSION METHODS
  // ==========================================

  // ✅ VALIDACIÓN DE ROLES MEJORADA - Con validaciones
  hasRole: (role) => {
    if (!role || typeof role !== "string") return false;

    const user = authService.getCurrentUser();
    return user && user.role === role.trim();
  },

  isAdmin: () => {
    return authService.hasRole("admin");
  },

  isActive: () => {
    const user = authService.getCurrentUser();
    return user && user.status === true;
  },

  // ==========================================
  // CLEANUP METHODS
  // ==========================================

  // ✅ LIMPIAR SESIÓN MEJORADO
  clearSession: () => {
    try {
      authService.stopInactivityMonitoring();
      safeStorageHandler.remove(AUTH_CONSTANTS.STORAGE_KEY);

      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignorar errores de localStorage
      }

      console.log("🧹 Sesión limpiada completamente");
    } catch (error) {
      console.error("Error limpiando sesión:", error);
    }
  },

  // ✅ NUEVA FUNCIÓN: Validar estado de la sesión
  validateSession: () => {
    const authData = safeStorageHandler.get(AUTH_CONSTANTS.STORAGE_KEY);

    return {
      isValid: validateAuthData(authData),
      hasToken: authData?.token ? true : false,
      hasUser: authData?.user ? true : false,
      isExpired: authData
        ? Date.now() - authData.loginTime > AUTH_CONSTANTS.MAX_SESSION_TIME
        : true,
      isInactive: authData
        ? Date.now() - (authData.lastActivity || authData.loginTime) >
          AUTH_CONSTANTS.INACTIVITY_TIME
        : true,
    };
  },

  // ✅ NUEVA FUNCIÓN: Extender sesión (refresh token si está disponible)
  extendSession: async () => {
    try {
      if (!authService.isLoggedIn()) {
        throw new Error("No hay sesión activa para extender");
      }

      // Si el backend soporta refresh token, implementar aquí
      // Por ahora, solo actualizamos la actividad
      authService.updateActivity();

      return { success: true, message: "Sesión extendida" };
    } catch (error) {
      console.error("Error extendiendo sesión:", error);
      throw error;
    }
  },
};

// ✅ EXPORTS COMPATIBLES - Mantener ambos para compatibilidad total
export { authService };
export default authService;
