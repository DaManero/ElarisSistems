// hooks/useGeoRef.js
import { useState, useCallback } from "react";
import georefService from "../services/georefService";

export const useGeoRef = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validar/normalizar una dirección completa
  const validateAddress = useCallback(async (address, province = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await georefService.normalizeAddress(address, province);

      if (!result.success) {
        setError(result.error || "Error validando dirección");
      }

      return result;
    } catch (err) {
      const errorMessage = "Error validando dirección";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener lista de provincias desde GeoRef
  const getProvinces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await georefService.getProvinces();

      if (!result.success) {
        setError(result.error || "Error cargando provincias");
      }

      return result;
    } catch (err) {
      const errorMessage = "Error cargando provincias";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener localidades por provincia desde GeoRef
  const getLocalitiesByProvince = useCallback(async (provinceName) => {
    if (!provinceName) {
      return { success: true, data: [] };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await georefService.getLocalitiesByProvince(provinceName);

      if (!result.success) {
        setError(result.error || "Error cargando localidades");
      }

      return result;
    } catch (err) {
      const errorMessage = "Error cargando localidades";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener sugerencias de direcciones para autocompletado
  const getAddressSuggestions = useCallback(async (input) => {
    if (!input || input.length < 3) {
      return { success: true, data: [] };
    }

    // No setear loading aquí porque el componente AddressAutocomplete maneja su propio loading
    setError(null);

    try {
      const result = await georefService.getAddressSuggestions(input);

      if (!result.success) {
        setError(result.error || "Error obteniendo sugerencias");
      }

      return result;
    } catch (err) {
      const errorMessage = "Error obteniendo sugerencias";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Limpiar errores manualmente
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función de utilidad para verificar conectividad con GeoRef
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await georefService.testConnection();

      if (!result.success) {
        setError(result.error || "Error de conexión con GeoRef");
      }

      return result;
    } catch (err) {
      const errorMessage = "Error de conexión con GeoRef";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    validateAddress,
    getProvinces,
    getLocalitiesByProvince,
    getAddressSuggestions,
    clearError,
    testConnection,
  };
};
