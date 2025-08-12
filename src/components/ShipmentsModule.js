// components/ShipmentsModule.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import {
  Assignment,
  LocalShipping,
  History,
  Add,
  ManageSearch,
} from "@mui/icons-material";

// 🚀 IMPORTS de los componentes que crearemos en los siguientes pasos
import PrepareShipments from "./PrepareShipments";
import ManageBatches from "./ManageBatches";
import ShipmentHistoryView from "./ShipmentHistoryView"; // Ya existe

const ShipmentsModule = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para manejar qué tab está activo
  const [activeTab, setActiveTab] = useState(0);

  // Estado para notificaciones entre componentes
  const [notification, setNotification] = useState({ type: "", message: "" });

  // Estado para refresh de datos entre tabs
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================
  // MANEJO DE NAVEGACIÓN Y TABS
  // ==========================================

  // Detectar ruta actual y setear tab correspondiente
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/shipments/batches")) {
      setActiveTab(1);
    } else if (path.includes("/shipments/history")) {
      // No cambiar tab, ya que history es una ruta separada
      return;
    } else {
      setActiveTab(0); // Default: Preparar Envíos
    }
  }, [location]);

  // Manejar cambio de tabs
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    // Navegar según el tab seleccionado
    if (newValue === 0) {
      navigate("/dashboard/sales/shipments/prepare");
    } else if (newValue === 1) {
      navigate("/dashboard/sales/shipments/batches");
    }
  };

  // Navegar al historial
  const handleNavigateToHistory = () => {
    navigate("/dashboard/sales/shipments/history");
  };

  // ==========================================
  // HANDLERS PARA COMUNICACIÓN ENTRE COMPONENTES
  // ==========================================

  // Cuando se genere un lote en PrepareShipments
  const handleLotGenerated = (loteData) => {
    setNotification({
      type: "success",
      message: `✅ Lote ${loteData.batch_id} generado exitosamente con ${loteData.sales_processed} ventas`,
    });

    // Refresh de datos
    setRefreshKey((prev) => prev + 1);

    // Cambiar automáticamente al tab de gestión
    setActiveTab(1);
    navigate("/dashboard/sales/shipments/batches");
  };

  // Cuando se actualice un lote en ManageBatches
  const handleBatchUpdated = (batchData) => {
    setNotification({
      type: "info",
      message: `🔄 Lote actualizado exitosamente`,
    });

    // Refresh de datos
    setRefreshKey((prev) => prev + 1);
  };

  // Limpiar notificaciones
  const clearNotification = () => {
    setNotification({ type: "", message: "" });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box>
      {/* Header Principal */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "#1C1C26",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalShipping sx={{ color: "#1C1C26", fontSize: 28 }} />
            Gestión de Envíos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            Preparar lotes de envío y gestionar distribución
          </Typography>
        </Box>

        {/* Botón para ir al historial */}
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={handleNavigateToHistory}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            color: "#6b7280",
            borderColor: "#e5e7eb",
            "&:hover": {
              backgroundColor: "#f9fafb",
              borderColor: "#d1d5db",
            },
          }}
        >
          Ver Historial
        </Button>
      </Box>

      {/* Notificaciones Globales */}
      {notification.message && (
        <Alert
          severity={notification.type}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={clearNotification}
        >
          {notification.message}
        </Alert>
      )}

      {/* Navegación por Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          backgroundColor: "#FFFFFF",
          borderRadius: "12px 12px 0 0",
          px: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: "auto",
              py: 2,
              px: 3,
              color: "#6A736A",
              fontWeight: 500,
              fontSize: "0.95rem",
              "&.Mui-selected": {
                color: "#1C1C26",
                fontWeight: 600,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1C1C26",
              height: 3,
              borderRadius: "2px 2px 0 0",
            },
          }}
        >
          <Tab
            icon={<Add sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Preparar Envíos"
          />
          <Tab
            icon={<ManageSearch sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Gestión de Lotes"
          />
        </Tabs>
      </Box>

      {/* Área de Contenido con Rutas */}
      <Box
        sx={{
          backgroundColor: "#FAFAFA",
          minHeight: "400px",
          borderRadius: 2,
          p: 1,
        }}
      >
        <Routes>
          {/* Ruta por defecto: Preparar Envíos */}
          <Route
            index
            element={
              <PrepareShipments
                onLotGenerated={handleLotGenerated}
                refreshKey={refreshKey}
                showNotification={(type, message) =>
                  setNotification({ type, message })
                }
              />
            }
          />

          {/* Ruta específica: Preparar Envíos */}
          <Route
            path="prepare"
            element={
              <PrepareShipments
                onLotGenerated={handleLotGenerated}
                refreshKey={refreshKey}
                showNotification={(type, message) =>
                  setNotification({ type, message })
                }
              />
            }
          />

          {/* Ruta específica: Gestión de Lotes */}
          <Route
            path="batches"
            element={
              <ManageBatches
                onBatchUpdated={handleBatchUpdated}
                refreshKey={refreshKey}
                showNotification={(type, message) =>
                  setNotification({ type, message })
                }
              />
            }
          />

          {/* Ruta específica: Historial (fuera de tabs) */}
          <Route
            path="history"
            element={
              <ShipmentHistoryView
                onBackToMain={() => navigate("/dashboard/sales/shipments")}
                showNotification={(type, message) =>
                  setNotification({ type, message })
                }
              />
            }
          />

          {/* Fallback: redirect a preparar */}
          <Route
            path="*"
            element={
              <PrepareShipments
                onLotGenerated={handleLotGenerated}
                refreshKey={refreshKey}
                showNotification={(type, message) =>
                  setNotification({ type, message })
                }
              />
            }
          />
        </Routes>
      </Box>

      {/* Info Footer */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: "#F8F9FA",
          borderRadius: 2,
          borderLeft: "4px solid #3B82F6",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "#6b7280", fontSize: "0.85rem" }}
        >
          💡 <strong>Flujo recomendado:</strong> Usa "Preparar Envíos" para
          seleccionar ventas y generar lotes, luego "Gestión de Lotes" para
          hacer seguimiento y actualizaciones.
        </Typography>
      </Box>
    </Box>
  );
};

export default ShipmentsModule;
