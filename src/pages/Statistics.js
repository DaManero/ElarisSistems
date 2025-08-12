// pages/Statistics.js
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import DashboardExecutive from "../components/statistics/DashboardExecutive";
import SalesStatistics from "../components/statistics/SalesStatistics";
import ProductStatistics from "../components/statistics/ProductStatistics";
import CustomerStatistics from "../components/statistics/CustomerStatistics";
import PaymentStatistics from "../components/statistics/PaymentStatistics";
import ShipmentStatistics from "../components/statistics/ShipmentStatistics";
import GeographicAnalysis from "../components/statistics/GeographicAnalysis";

// Placeholder component for unimplemented sections
const PlaceholderComponent = ({ title, description }) => (
  <Box sx={{ p: 4, textAlign: "center", color: "#6A736A" }}>
    <Typography variant="h6" sx={{ mb: 2, color: "#1C1C26" }}>
      {title}
    </Typography>
    <Typography variant="body2">
      {description || "Este módulo estará disponible próximamente"}
    </Typography>
  </Box>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

const Statistics = () => {
  const location = useLocation();

  // Debug: mostrar ruta actual
  console.log("Statistics component - Current path:", location.pathname);

  return (
    <Routes>
      {/* Dashboard Ejecutivo */}
      <Route path="dashboard" element={<DashboardExecutive />} />

      {/* Estadísticas de Ventas */}
      <Route path="sales" element={<SalesStatistics />} />

      {/* Estadísticas de Productos */}
      <Route path="products" element={<ProductStatistics />} />

      {/* Estadísticas de Clientes */}
      <Route path="customers" element={<CustomerStatistics />} />

      {/* Estadísticas de Pagos */}
      <Route path="payments" element={<PaymentStatistics />} />

      {/* Estadísticas de Envíos */}
      <Route path="shipments" element={<ShipmentStatistics />} />

      {/* Análisis Geográfico */}
      <Route path="geographic" element={<GeographicAnalysis />} />

      {/* Rutas adicionales específicas */}
      <Route
        path="sales/evolution"
        element={
          <PlaceholderComponent
            title="Evolución Detallada de Ventas"
            description="Análisis temporal avanzado de ventas"
          />
        }
      />

      <Route
        path="products/rotation"
        element={
          <PlaceholderComponent
            title="Análisis de Rotación de Productos"
            description="Estudio detallado de rotación de inventario"
          />
        }
      />

      <Route
        path="customers/rfm"
        element={
          <PlaceholderComponent
            title="Análisis RFM de Clientes"
            description="Segmentación avanzada Recency-Frequency-Monetary"
          />
        }
      />

      {/* Ruta por defecto - redirige a dashboard */}
      <Route path="*" element={<DashboardExecutive />} />
    </Routes>
  );
};

export default Statistics;
