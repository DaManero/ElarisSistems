// hooks/useAuth.js - Hook personalizado para autenticación
import { useState, useEffect, useCallback, useRef } from "react";
import { authService } from "../services/authService";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);

  // Refs para evitar memory leaks
  const monitoringIntervalRef = useRef(null);
  const sessionCheckIntervalRef = useRef(null);

  // ✅ FUNCIÓN PARA VERIFICAR AUTENTICACIÓN
  const checkAuth = useCallback(async (skipBackendCheck = false) => {
    try {
      setLoading(true);

      const isValid = await authService.isLoggedIn(skipBackendCheck);

      if (isValid) {
        const userData = authService.getCurrentUser();
        setIsAuthenticated(true);
        setUser(userData);

        // Iniciar monitoreo de sesión
        if (!monitoringIntervalRef.current) {
          startSessionMonitoring();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSessionTimeRemaining(null);
        stopSessionMonitoring();
      }

      return isValid;
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FUNCIÓN DE LOGIN
  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true);
        const response = await authService.login(email, password);

        // Verificar autenticación después del login
        await checkAuth(true); // Skip backend check ya que acabamos de hacer login

        return response;
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [checkAuth]
  );

  // ✅ FUNCIÓN DE LOGOUT
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setSessionTimeRemaining(null);
      stopSessionMonitoring();
      setLoading(false);
    }
  }, []);

  // ✅ MONITOREO DE SESIÓN
  const startSessionMonitoring = useCallback(() => {
    // Limpiar intervalos existentes
    stopSessionMonitoring();

    // Monitoreo cada 30 segundos
    monitoringIntervalRef.current = setInterval(() => {
      const authData = authService.getAuthData();

      if (!authData) {
        setIsAuthenticated(false);
        setUser(null);
        setSessionTimeRemaining(null);
        stopSessionMonitoring();
        return;
      }

      // Calcular tiempo restante
      const elapsed = Date.now() - authData.loginTime;
      const remaining = authData.expiresIn - elapsed;

      if (remaining <= 0) {
        // Sesión expirada
        setIsAuthenticated(false);
        setUser(null);
        setSessionTimeRemaining(null);
        authService.clearSession();
        stopSessionMonitoring();
      } else {
        setSessionTimeRemaining(remaining);

        // Avisar cuando quedan 5 minutos
        if (remaining <= 5 * 60 * 1000 && remaining > 4.5 * 60 * 1000) {
          window.dispatchEvent(
            new CustomEvent("auth:session_warning", {
              detail: { remaining },
            })
          );
        }
      }
    }, 30000); // Cada 30 segundos

    // Verificación en backend cada 5 minutos
    sessionCheckIntervalRef.current = setInterval(async () => {
      if (isAuthenticated) {
        try {
          const isValid = await authService.isLoggedIn(false); // Con verificación backend
          if (!isValid) {
            setIsAuthenticated(false);
            setUser(null);
            setSessionTimeRemaining(null);
            stopSessionMonitoring();
          }
        } catch (error) {
          console.error("Error en verificación periódica:", error);
        }
      }
    }, 5 * 60 * 1000); // Cada 5 minutos

    console.log("👀 Monitoreo de sesión iniciado");
  }, [isAuthenticated]);

  // ✅ DETENER MONITOREO
  const stopSessionMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    }

    console.log("👀 Monitoreo de sesión detenido");
  }, []);

  // ✅ EXTENDER SESIÓN POR ACTIVIDAD
  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      return authService.extendSession();
    }
    return false;
  }, [isAuthenticated]);

  // ✅ OBTENER INFO DE SESIÓN
  const getSessionInfo = useCallback(() => {
    return authService.getSessionInfo();
  }, []);

  // ✅ VERIFICAR ROLES
  const hasRole = useCallback((role) => {
    return authService.hasRole(role);
  }, []);

  const isAdmin = useCallback(() => {
    return authService.isAdmin();
  }, []);

  // ✅ EFECTOS
  useEffect(() => {
    // Verificar autenticación al cargar
    checkAuth();

    // Listeners para eventos del interceptor
    const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      setSessionTimeRemaining(null);
      stopSessionMonitoring();
    };

    const handleAccessDenied = (event) => {
      console.warn("🚫 Acceso denegado:", event.detail.message);
    };

    const handleNetworkError = (event) => {
      console.warn("🌐 Error de red:", event.detail.message);
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:access_denied", handleAccessDenied);
    window.addEventListener("api:network_error", handleNetworkError);

    // Cleanup
    return () => {
      stopSessionMonitoring();
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:access_denied", handleAccessDenied);
      window.removeEventListener("api:network_error", handleNetworkError);
    };
  }, [checkAuth, stopSessionMonitoring]);

  // ✅ EFECTO PARA ACTIVIDAD DEL USUARIO
  useEffect(() => {
    if (!isAuthenticated) return;

    const extendOnActivity = () => {
      extendSession();
    };

    // Eventos de actividad del usuario
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    let activityTimeout;
    const handleActivity = () => {
      // Debounce para no extender constantemente
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(extendOnActivity, 60000); // Extender cada minuto de actividad
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(activityTimeout);
    };
  }, [isAuthenticated, extendSession]);

  // ✅ FORMATEAR TIEMPO RESTANTE
  const formatTimeRemaining = useCallback(() => {
    if (!sessionTimeRemaining) return null;

    const minutes = Math.floor(sessionTimeRemaining / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  }, [sessionTimeRemaining]);

  return {
    // Estado
    isAuthenticated,
    user,
    loading,
    sessionTimeRemaining,

    // Acciones
    login,
    logout,
    checkAuth,
    extendSession,

    // Utilidades
    hasRole,
    isAdmin,
    getSessionInfo,
    formatTimeRemaining,

    // Datos de sesión
    isSessionExpiringSoon:
      sessionTimeRemaining && sessionTimeRemaining <= 5 * 60 * 1000, // 5 minutos
  };
};
