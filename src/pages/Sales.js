import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import CustomerList from "../components/CustomerList";
import PaymentMethodList from "../components/PaymentMethodList";
import SalesList from "../components/SalesList";
import SalesForm from "../components/SalesForm"; // 🆕 IMPORT DIRECTO CON pageMode
import POS from "../components/POS";
import ShipmentsModule from "../components/ShipmentsModule"; // 🆕 NUEVO IMPORT SIMPLIFICADO
import { saleService } from "../services/salesService";

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
// CUSTOMER WRAPPERS
// ==========================================

// Wrapper component for customer editing (future use)
const CustomerEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // Por ahora, redirect a la lista
    navigate("/dashboard/sales/customers");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for customer creation (future use)
const CustomerCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde CustomerList)
  useEffect(() => {
    navigate("/dashboard/sales/customers");
  }, [navigate]);

  return null;
};

// ==========================================
// PAYMENT METHOD WRAPPERS
// ==========================================

// Wrapper component for payment method editing (future use)
const PaymentMethodEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethodData, setPaymentMethodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // Por ahora, redirect a la lista
    navigate("/dashboard/sales/payment-methods");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for payment method creation (future use)
const PaymentMethodCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde PaymentMethodList)
  useEffect(() => {
    navigate("/dashboard/sales/payment-methods");
  }, [navigate]);

  return null;
};

// ==========================================
// SALES WRAPPERS - 🆕 CON pageMode
// ==========================================

// 🆕 Wrapper para crear nueva venta como PÁGINA
const SalesFormNewWrapper = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/dashboard/sales/history");
  };

  const handleSuccess = (data) => {
    navigate("/dashboard/sales/history");
  };

  return (
    <SalesForm
      open={true}
      saleData={null} // Modo crear
      onClose={handleClose}
      onSuccess={handleSuccess}
      pageMode={true} // 🎯 MODO PÁGINA ACTIVADO
    />
  );
};

// 🆕 Wrapper para editar venta como PÁGINA
const SaleEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saleData, setSaleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadSaleData();
    }
  }, [id]);

  const loadSaleData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await saleService.getSale(id);
      setSaleData(response.data);
    } catch (error) {
      setError(error.message || "Error cargando datos de la venta");
      console.error("Error loading sale:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/dashboard/sales/history");
  };

  const handleSuccess = (data) => {
    navigate("/dashboard/sales/history");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <SalesForm
      open={true}
      saleData={saleData} // Datos de la venta para editar
      onClose={handleClose}
      onSuccess={handleSuccess}
      pageMode={true} // 🎯 MODO PÁGINA ACTIVADO
    />
  );
};

// Wrapper component for sale detail view
const SaleDetailWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Implementar vista de detalle de venta
    // Por ahora, redirect a la lista
    navigate("/dashboard/sales/history");
  }, [id, navigate]);

  return null;
};

// ==========================================
// 🚚 SHIPMENTS WRAPPER - 🆕 SIMPLIFICADO
// ==========================================

// 🆕 Wrapper simplificado que usa el nuevo ShipmentsModule
const ShipmentsWrapper = () => {
  const location = useLocation();

  // Debug: mostrar ruta actual
  console.log("🚚 ShipmentsWrapper - Current path:", location.pathname);

  // El ShipmentsModule maneja todas las sub-rutas internamente
  return <ShipmentsModule />;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const Sales = () => {
  const location = useLocation();

  // Debug: mostrar ruta actual
  console.log("💰 Sales component - Current path:", location.pathname);

  return (
    <Routes>
      {/* ==========================================
          🆕 VENTAS - RUTAS PRINCIPALES
          ========================================== */}

      {/* Nueva Venta - 🆕 MODO PÁGINA COMPLETA */}
      <Route index element={<SalesFormNewWrapper />} />
      <Route path="new" element={<SalesFormNewWrapper />} />
      <Route path="form" element={<SalesFormNewWrapper />} />
      <Route path="create" element={<SalesFormNewWrapper />} />

      {/* POS (Point of Sale) */}
      <Route path="pos" element={<POS />} />

      {/* Historial de Ventas */}
      <Route path="history" element={<SalesList />} />
      <Route path="history/:id" element={<SaleDetailWrapper />} />
      <Route path="history/edit/:id" element={<SaleEditWrapper />} />

      {/* Editar Venta directamente - 🆕 MODO PÁGINA COMPLETA */}
      <Route path="edit/:id" element={<SaleEditWrapper />} />

      {/* ==========================================
          🚚 MÓDULO DE ENVÍOS - 🆕 SIMPLIFICADO
          ========================================== */}

      {/* 
        🎯 ANTES: Múltiples rutas separadas
        <Route path="shipments" element={<ShipmentsWrapper />} />
        <Route path="shipments/history" element={<ShipmentHistoryWrapper />} />
        <Route path="shipments/reports" element={<ShipmentReportsWrapper />} />
        <Route path="shipments/stats" element={<ShipmentStatsWrapper />} />
        
        🎯 DESPUÉS: Una sola ruta que delega al ShipmentsModule
      */}
      <Route path="shipments/*" element={<ShipmentsWrapper />} />

      {/* ==========================================
          👥 CLIENTES Y MÉTODOS DE PAGO
          ========================================== */}

      {/* Facturación/Clientes */}
      <Route path="customers" element={<CustomerList />} />
      <Route path="customers/create" element={<CustomerCreateWrapper />} />
      <Route path="customers/edit/:id" element={<CustomerEditWrapper />} />

      {/* Métodos de Pago */}
      <Route path="payment-methods" element={<PaymentMethodList />} />
      <Route
        path="payment-methods/create"
        element={<PaymentMethodCreateWrapper />}
      />
      <Route
        path="payment-methods/edit/:id"
        element={<PaymentMethodEditWrapper />}
      />

      {/* ==========================================
          🔄 RUTAS LEGACY PARA COMPATIBILIDAD
          ========================================== */}

      {/* Rutas Legacy para compatibilidad */}
      <Route path="billing" element={<CustomerList />} />
      <Route path="billing/create" element={<CustomerCreateWrapper />} />
      <Route path="billing/edit/:id" element={<CustomerEditWrapper />} />

      {/* ==========================================
          🚫 RUTA DE FALLBACK
          ========================================== */}

      {/* Ruta de fallback */}
      <Route
        path="*"
        element={
          <PlaceholderComponent
            title="Página no encontrada"
            description="La ruta solicitada no existe en el módulo de ventas"
          />
        }
      />
    </Routes>
  );
};

export default Sales;
