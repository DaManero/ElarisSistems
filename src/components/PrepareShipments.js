// components/PrepareShipments.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import {
  Add,
  Refresh,
  CalendarToday,
  Search,
  SelectAll,
  Clear,
  Receipt,
  Person,
  Phone,
  ShoppingCart,
  Assignment,
  Download,
  Info,
} from "@mui/icons-material";
import { shipmentService } from "../services/shipmentService";
import { saleService } from "../services/salesService";

const PrepareShipments = ({ onLotGenerated, refreshKey, showNotification }) => {
  // ==========================================
  // ESTADOS PRINCIPALES
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para ventas disponibles
  const [availableSales, setAvailableSales] = useState([]);
  const [loadingAvailableSales, setLoadingAvailableSales] = useState(false);

  // Estados para selección
  const [selectedSales, setSelectedSales] = useState([]);
  const [selectionStats, setSelectionStats] = useState({});

  // Estados para filtros
  const [selectedDate, setSelectedDate] = useState("");
  const [showAllAvailable, setShowAllAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Estados para modal de generación
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const loadAvailableSales = useCallback(async () => {
    try {
      setLoadingAvailableSales(true);
      setError("");

      // Si showAllAvailable es true, no filtrar por fecha
      const dateParam = showAllAvailable && !selectedDate ? null : selectedDate;

      const response = await shipmentService.getAvailableSales(dateParam);
      const salesData = response.data || [];

      setAvailableSales(salesData);

      // Limpiar selección al cambiar filtros
      setSelectedSales([]);

      console.log(`📋 Ventas disponibles cargadas: ${salesData.length}`);
    } catch (error) {
      console.error("Error loading available sales:", error);
      setError(error.message || "Error cargando ventas disponibles");
      setAvailableSales([]);
    } finally {
      setLoadingAvailableSales(false);
      setLoading(false);
    }
  }, [selectedDate, showAllAvailable]);

  // Cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadAvailableSales();
  }, [loadAvailableSales, refreshKey]);

  // ==========================================
  // MANEJO DE SELECCIÓN
  // ==========================================

  // Seleccionar/deseleccionar venta individual
  const handleSelectSale = (saleId, isSelected) => {
    if (isSelected) {
      const sale = availableSales.find((s) => s.id === saleId);
      if (sale) {
        setSelectedSales((prev) => [...prev, sale]);
      }
    } else {
      setSelectedSales((prev) => prev.filter((s) => s.id !== saleId));
    }
  };

  // Seleccionar todas las ventas filtradas
  const handleSelectAll = () => {
    const filteredSales = getFilteredSales();
    setSelectedSales(filteredSales);
  };

  // Deseleccionar todas
  const handleDeselectAll = () => {
    setSelectedSales([]);
  };

  // Verificar si una venta está seleccionada
  const isSaleSelected = (saleId) => {
    return selectedSales.some((sale) => sale.id === saleId);
  };

  // Calcular estadísticas de selección
  useEffect(() => {
    const stats = shipmentService.calculateSelectionStats(selectedSales);
    setSelectionStats(stats);
  }, [selectedSales]);

  // ==========================================
  // FILTROS
  // ==========================================

  const getFilteredSales = useCallback(() => {
    return availableSales.filter((sale) => {
      // Filtro por búsqueda
      const matchesSearch =
        !searchTerm ||
        sale.numero_venta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const matchesStatus =
        statusFilter === "all" || sale.estado_venta === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [availableSales, searchTerm, statusFilter]);

  const filteredSales = getFilteredSales();

  // Filtros rápidos
  const handleShowAllAvailable = () => {
    setSelectedDate("");
    setShowAllAvailable(true);
  };

  const handleFilterToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setShowAllAvailable(false);
  };

  const handleQuickFilter = (filterType) => {
    const filter = shipmentService.PREDEFINED_FILTERS.find(
      (f) => f.id === filterType
    );
    if (filter) {
      const value = filter.getValue();
      if (typeof value === "string") {
        setSelectedDate(value);
        setShowAllAvailable(false);
      }
    }
  };

  // ==========================================
  // GENERACIÓN DE LOTES
  // ==========================================

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setError("");

      // Validar selección
      const validation = shipmentService.validateSaleSelection(selectedSales);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return;
      }

      // Preparar datos para el reporte
      const reportData = {
        sale_ids: selectedSales.map((sale) => sale.id),
        fecha: selectedDate || null,
      };

      const response = await shipmentService.generateShipmentsReport(
        reportData
      );

      // Notificar al componente padre
      if (onLotGenerated) {
        onLotGenerated(response.data);
      }

      // Limpiar selección y recargar datos
      setSelectedSales([]);
      await loadAvailableSales();
      setShowGenerateDialog(false);
    } catch (error) {
      if (error.incomplete_addresses) {
        setError(
          `${error.incomplete_addresses.length} ventas tienen direcciones incompletas. Complete las direcciones antes de generar el reporte.`
        );
      } else {
        setError(error.message || "Error generando reporte");
      }
    } finally {
      setGeneratingReport(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header de la Sección */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#1C1C26", fontWeight: 600 }}>
            📦 Preparar Envíos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Selecciona ventas disponibles para generar un nuevo lote de envío
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAvailableSales}
            disabled={loadingAvailableSales}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              color: "#6b7280",
              borderColor: "#e5e7eb",
            }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowGenerateDialog(true)}
            disabled={selectedSales.length === 0}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#1C1C26",
              "&:hover": { bgcolor: "#0D0D0D" },
            }}
          >
            Generar Lote ({selectedSales.length})
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Selector de Fecha */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha específica"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setShowAllAvailable(false);
                }}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: "#6b7280" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: showAllAvailable ? "#f0fdf4" : "#FFFFFF",
                  },
                }}
                helperText={
                  showAllAvailable
                    ? "Mostrando todas las fechas"
                    : "Filtro por fecha específica"
                }
              />
            </Grid>

            {/* Filtros Rápidos */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant={showAllAvailable ? "contained" : "outlined"}
                  size="small"
                  onClick={handleShowAllAvailable}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontSize: "0.8rem",
                    color: showAllAvailable ? "#ffffff" : "#6b7280",
                    bgcolor: showAllAvailable ? "#16a34a" : "transparent",
                    borderColor: showAllAvailable ? "#16a34a" : "#e5e7eb",
                  }}
                >
                  📋 Todas disponibles
                </Button>

                <Button
                  variant={
                    !showAllAvailable &&
                    selectedDate === new Date().toISOString().split("T")[0]
                      ? "contained"
                      : "outlined"
                  }
                  size="small"
                  onClick={handleFilterToday}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontSize: "0.8rem",
                  }}
                >
                  📅 Solo hoy
                </Button>

                {shipmentService.PREDEFINED_FILTERS.filter(
                  (f) => f.id !== "today"
                ).map((filter) => (
                  <Button
                    key={filter.id}
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuickFilter(filter.id)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      fontSize: "0.8rem",
                    }}
                  >
                    {filter.label}
                  </Button>
                ))}
              </Box>
            </Grid>

            {/* Info de ventas disponibles */}
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  Ventas Disponibles
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`${availableSales.length} disponibles`}
                    color={availableSales.length > 0 ? "primary" : "default"}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Panel de Búsqueda y Selección */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por número de venta o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#6b7280" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Filtro por Estado */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  {shipmentService.AVAILABLE_FOR_SHIPMENT_STATES.map(
                    (state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Acciones de Selección */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SelectAll />}
                  onClick={handleSelectAll}
                  disabled={filteredSales.length === 0}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontSize: "0.8rem",
                  }}
                >
                  Todas
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear />}
                  onClick={handleDeselectAll}
                  disabled={selectedSales.length === 0}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontSize: "0.8rem",
                  }}
                >
                  Ninguna
                </Button>
              </Box>
            </Grid>

            {/* Resumen de Selección */}
            <Grid item xs={12} md={2}>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#1C1C26", fontWeight: 500 }}
                >
                  {selectedSales.length} seleccionadas
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  {shipmentService.formatPrice(selectionStats.total_amount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Panel de Estadísticas de Selección */}
      {selectedSales.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#f8fafc" }}>
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: "#1C1C26", fontWeight: 600 }}
            >
              📊 Resumen de Selección
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1C1C26", fontWeight: 700 }}
                  >
                    {selectionStats.count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    Ventas seleccionadas
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#16a34a", fontWeight: 700 }}
                  >
                    {shipmentService.formatPrice(selectionStats.total_amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    Valor total
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#3b82f6", fontWeight: 700 }}
                  >
                    {selectionStats.total_items}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    Items totales
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {Object.entries(selectionStats.estados || {}).map(
                      ([estado, count]) => (
                        <Chip
                          key={estado}
                          label={`${estado}: ${count}`}
                          size="small"
                          sx={{ mx: 0.5, mb: 0.5 }}
                        />
                      )
                    )}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ventas Disponibles */}
      <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
        <CardContent sx={{ p: 0, paddingBottom: "0px !important" }}>
          {loadingAvailableSales ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredSales.length > 0 ? (
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={
                          selectedSales.length > 0 &&
                          selectedSales.length < filteredSales.length
                        }
                        checked={
                          selectedSales.length === filteredSales.length &&
                          filteredSales.length > 0
                        }
                        onChange={(e) =>
                          e.target.checked
                            ? handleSelectAll()
                            : handleDeselectAll()
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Venta
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Cliente
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Items
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Fecha
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const isSelected = isSaleSelected(sale.id);
                    const statusInfo = shipmentService.getSaleStatusInfo(
                      sale.estado_venta
                    );

                    return (
                      <TableRow
                        key={sale.id}
                        sx={{
                          "&:hover": { bgcolor: "#f9fafb" },
                          bgcolor: isSelected ? "#f0f9ff" : "inherit",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSelectSale(sale.id, !isSelected)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectSale(sale.id, e.target.checked);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                p: 0.5,
                                borderRadius: "6px",
                                backgroundColor: "#f8fafc",
                              }}
                            >
                              <Receipt
                                sx={{ color: "#1C1C26", fontSize: 16 }}
                              />
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {sale.numero_venta}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                #{sale.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#1C1C26" }}
                            >
                              {sale.cliente?.nombre || "Sin cliente"}
                            </Typography>
                            {sale.cliente?.telefono && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#6b7280",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Phone sx={{ fontSize: 12 }} />
                                {sale.cliente.telefono}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={statusInfo.text}
                            size="small"
                            icon={<span>{statusInfo.icon}</span>}
                            sx={{
                              backgroundColor: statusInfo.bgColor,
                              color: statusInfo.textColor,
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <ShoppingCart
                              sx={{ fontSize: 14, color: "#6b7280" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#1C1C26" }}
                            >
                              {sale.items?.length || 0} items
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#16a34a" }}
                          >
                            {shipmentService.formatPrice(sale.total)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            {shipmentService.formatDate(sale.fecha)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 8, color: "#6A736A" }}>
              <Assignment sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No hay ventas disponibles
              </Typography>
              <Typography variant="body2">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron ventas con los filtros aplicados"
                  : showAllAvailable
                  ? "No hay ventas en estado 'En proceso' o 'Reprogramado'"
                  : "No hay ventas para la fecha seleccionada"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal: Confirmar Generación de Lote */}
      <Dialog
        open={showGenerateDialog}
        onClose={() => !generatingReport && setShowGenerateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#1C1C26" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Assignment sx={{ color: "#1C1C26" }} />
            Generar Lote de Envío
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Deseas generar un lote de envío con las{" "}
            <strong>{selectedSales.length} ventas seleccionadas</strong>?
          </Typography>

          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
            <Info sx={{ mr: 1 }} />
            Las ventas seleccionadas cambiarán automáticamente al estado
            "Enviado" y se creará un archivo Excel para distribución.
          </Alert>

          {/* Resumen de selección */}
          <Card sx={{ backgroundColor: "#f8fafc", borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#1C1C26" }}>
                📋 Resumen del lote a generar:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Total ventas: <strong>{selectionStats.count}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Valor total:{" "}
                    <strong>
                      {shipmentService.formatPrice(selectionStats.total_amount)}
                    </strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Items totales: <strong>{selectionStats.total_items}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Estados:{" "}
                    {Object.entries(selectionStats.estados || {}).map(
                      ([estado, count]) => (
                        <Chip
                          key={estado}
                          label={`${estado}: ${count}`}
                          size="small"
                          sx={{ mx: 0.5 }}
                        />
                      )
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowGenerateDialog(false)}
            disabled={generatingReport}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            disabled={generatingReport || selectedSales.length === 0}
            startIcon={
              generatingReport ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Download />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#1C1C26",
              "&:hover": { backgroundColor: "#0D0D0D" },
            }}
          >
            {generatingReport ? "Generando Lote..." : "Generar Lote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrepareShipments;
