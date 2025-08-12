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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  History,
  Search,
  FilterList,
  Archive,
  Download,
  Visibility,
  MoreVert,
  CalendarToday,
  TrendingUp,
  Refresh,
  Delete,
  Restore,
  Assignment,
  LocalShipping,
  PictureAsPdf,
} from "@mui/icons-material";
import { shipmentService } from "../services/shipmentService";
import { authService } from "../services/authService"; // 🔧 IMPORT AGREGADO
import ShipmentBatchDetail from "./ShipmentBatchDetail";

const ShipmentHistoryView = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para datos
  const [historyData, setHistoryData] = useState({
    batches: [],
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      items_per_page: 20,
    },
    stats: {},
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    estado: "all",
    fecha_desde: "",
    fecha_hasta: "",
    incluir_archivados: false,
    solo_completados: false,
    search: "",
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados para modales
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetail, setShowBatchDetail] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archivingBatch, setArchivingBatch] = useState(null);

  // Estados para menús
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuBatch, setMenuBatch] = useState(null);

  // Estados para operaciones
  const [archiving, setArchiving] = useState(false);
  const [autoArchiving, setAutoArchiving] = useState(false);

  // Estados para descarga de PDF
  const [downloadingPDF, setDownloadingPDF] = useState({});

  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const loadHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === "all") {
          delete params[key];
        }
      });

      const [historyResponse, statsResponse] = await Promise.all([
        shipmentService.getBatchHistory(params),
        shipmentService.getHistoryStats(params),
      ]);

      setHistoryData({
        batches: historyResponse.data?.batches || [],
        pagination: historyResponse.data?.pagination || {},
        stats: statsResponse.data || {},
      });
    } catch (error) {
      console.error("Error loading history:", error);
      setError(error.message || "Error cargando historial de lotes");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadHistoryData();
  }, [loadHistoryData]);

  // ==========================================
  // MANEJO DE FILTROS
  // ==========================================

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1); // Resetear a primera página
  };

  const handleQuickFilter = (filterType) => {
    const filter = shipmentService.HISTORY_FILTERS.find(
      (f) => f.id === filterType
    );
    if (filter) {
      const filterValue = filter.getValue();
      setFilters((prev) => ({
        ...prev,
        ...filterValue,
      }));
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({
      estado: "all",
      fecha_desde: "",
      fecha_hasta: "",
      incluir_archivados: false,
      solo_completados: false,
      search: "",
    });
    setCurrentPage(1);
  };

  // ==========================================
  // VISUALIZACIÓN DE HTML
  // ==========================================

  const handleViewHTML = async (batch) => {
    const batchId = batch.shipment_batch_id;

    try {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: true }));
      setError("");

      // 🔧 MÉTODO CORREGIDO: Usar authService.getToken()
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
        );
      }

      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const apiPath = `/api/shipments/batch/${batchId}/view-html`;

      console.log("🔍 Obteniendo reporte desde:", `${backendURL}${apiPath}`);

      // Primero obtener el HTML usando fetch con headers apropiados
      const response = await fetch(`${backendURL}${apiPath}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // Obtener el contenido HTML
      const htmlContent = await response.text();

      // Abrir en nueva ventana con el contenido HTML
      const newWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        throw new Error(
          "El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio."
        );
      }

      // Escribir el HTML en la nueva ventana
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.document.title = `Reporte - Lote ${shipmentService.formatBatchId(
        batchId
      )}`;

      setSuccess(
        `📄 Reporte del lote ${shipmentService.formatBatchId(
          batchId
        )} abierto en nueva pestaña`
      );
    } catch (error) {
      console.error("Error viewing HTML report:", error);

      // Si es error de autenticación, sugerir relogin
      if (
        error.message.includes("401") ||
        error.message.includes("Access denied")
      ) {
        setError(
          "Sesión expirada. Por favor, cierra sesión e inicia sesión nuevamente."
        );
      } else {
        setError(error.message || "Error visualizando reporte");
      }
    } finally {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // ==========================================
  // DESCARGA DE PDF - CON AUTENTICACIÓN CORREGIDA
  // ==========================================

  const handleDownloadPDF = async (batch) => {
    const batchId = batch.shipment_batch_id;

    try {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: true }));
      setError("");

      // 🔧 MÉTODO CORREGIDO: Usar authService.getToken()
      const token = authService.getToken();
      if (!token) {
        throw new Error(
          "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
        );
      }

      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const apiPath = `/api/shipments/batch/${batchId}/download-pdf`;

      console.log("🔍 Descargando PDF desde:", `${backendURL}${apiPath}`);

      // 🔧 MÉTODO 1: Usar fetch para descargar con headers de autorización
      const response = await fetch(`${backendURL}${apiPath}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // Obtener el blob del PDF
      const blob = await response.blob();

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lote_${shipmentService
        .formatBatchId(batchId)
        .replace(/[^\w\-_\.]/g, "_")}.pdf`;

      // Agregar al DOM temporalmente y hacer click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpiar la URL del blob
      window.URL.revokeObjectURL(url);

      setSuccess(
        `📄 PDF del lote ${shipmentService.formatBatchId(
          batchId
        )} descargado exitosamente`
      );
    } catch (error) {
      console.error("Error downloading PDF:", error);

      // Si es error de autenticación, sugerir relogin
      if (
        error.message.includes("401") ||
        error.message.includes("Access denied")
      ) {
        setError(
          "Sesión expirada. Por favor, cierra sesión e inicia sesión nuevamente."
        );
      } else {
        setError(error.message || "Error descargando PDF");
      }
    } finally {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // ==========================================
  // 🆕 FUNCIÓN ALTERNATIVA: Usar iframe (si los métodos anteriores no funcionan)
  // ==========================================

  const handleViewHTMLAlternative = async (batch) => {
    const batchId = batch.shipment_batch_id;

    try {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: true }));
      setError("");

      // 🔧 MÉTODO CORREGIDO: Usar authService.getToken()
      const token = authService.getToken();
      if (!token) {
        throw new Error("No se encontró token de autenticación.");
      }

      // 🔧 MÉTODO ALTERNATIVO: Crear formulario POST para enviar token de forma segura
      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${backendURL}/api/shipments/batch/${batchId}/view-html`;
      form.target = "_blank";

      // Agregar token como campo hidden
      const tokenInput = document.createElement("input");
      tokenInput.type = "hidden";
      tokenInput.name = "token";
      tokenInput.value = token;
      form.appendChild(tokenInput);

      // Enviar formulario
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setSuccess(
        `📄 Reporte del lote ${shipmentService.formatBatchId(
          batchId
        )} abierto en nueva pestaña`
      );
    } catch (error) {
      console.error("Error viewing HTML report:", error);
      setError(error.message || "Error visualizando reporte");
    } finally {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // ==========================================
  // ACCIONES DE LOTES
  // ==========================================

  const handleViewBatchDetail = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetail(true);
  };

  const handleMenuOpen = (event, batch) => {
    setAnchorEl(event.currentTarget);
    setMenuBatch(batch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBatch(null);
  };

  const handleArchiveBatch = (batch) => {
    setArchivingBatch(batch);
    setShowArchiveDialog(true);
    handleMenuClose();
  };

  const executeArchiveBatch = async () => {
    if (!archivingBatch) return;

    try {
      setArchiving(true);
      setError("");

      await shipmentService.archiveBatch(archivingBatch.shipment_batch_id);

      setSuccess(
        `Lote ${shipmentService.formatBatchId(
          archivingBatch.shipment_batch_id
        )} archivado exitosamente`
      );

      // Recargar datos
      await loadHistoryData();

      setShowArchiveDialog(false);
      setArchivingBatch(null);
    } catch (error) {
      setError(error.message || "Error archivando lote");
    } finally {
      setArchiving(false);
    }
  };

  const handleAutoArchive = async () => {
    try {
      setAutoArchiving(true);
      setError("");

      const response = await shipmentService.autoArchiveOldBatches(30);

      setSuccess(
        `${response.data?.archived_count || 0} lotes archivados automáticamente`
      );

      // Recargar datos
      await loadHistoryData();
    } catch (error) {
      setError(error.message || "Error en archivado automático");
    } finally {
      setAutoArchiving(false);
    }
  };

  // ==========================================
  // PAGINACIÓN
  // ==========================================

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#1C1C26", fontWeight: 500 }}>
            Historial de Lotes de Envío
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Gestión y seguimiento de lotes completados y archivados
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Archive />}
            onClick={handleAutoArchive}
            disabled={autoArchiving}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              color: "#6b7280",
              borderColor: "#e5e7eb",
            }}
          >
            {autoArchiving ? "Archivando..." : "Auto-archivar"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadHistoryData}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              color: "#6b7280",
              borderColor: "#e5e7eb",
            }}
          >
            Actualizar
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

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* Estadísticas del Historial */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ color: "#1C1C26", fontWeight: 700 }}
              >
                {historyData.stats.total_batches || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Total de Lotes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ color: "#16a34a", fontWeight: 700 }}
              >
                {historyData.stats.completed_batches || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Completados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ color: "#3b82f6", fontWeight: 700 }}
              >
                {historyData.stats.total_shipments || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Total Envíos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{ color: "#f59e0b", fontWeight: 700 }}
              >
                {historyData.stats.archived_batches || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Archivados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por ID o archivo..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado}
                  label="Estado"
                  onChange={(e) => handleFilterChange("estado", e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {shipmentService.BATCH_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {shipmentService.getBatchStateInfo(state).text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fecha Desde */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Desde"
                type="date"
                value={filters.fecha_desde}
                onChange={(e) =>
                  handleFilterChange("fecha_desde", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Fecha Hasta */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Hasta"
                type="date"
                value={filters.fecha_hasta}
                onChange={(e) =>
                  handleFilterChange("fecha_hasta", e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Filtros Rápidos */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {shipmentService.HISTORY_FILTERS.map((filter) => (
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

                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontSize: "0.8rem",
                    color: "#ef4444",
                    borderColor: "#fecaca",
                  }}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Lotes del Historial */}
      <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
        <CardContent sx={{ p: 0, paddingBottom: "0px !important" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : historyData.batches.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Lote
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Estado
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Estadísticas
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Fecha Creación
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Edad
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyData.batches.map((batch) => {
                      const stateInfo = shipmentService.getBatchStateInfo(
                        batch.estado || "ACTIVO"
                      );
                      const batchAge = shipmentService.calculateBatchAge(
                        batch.fecha_envio
                      );

                      return (
                        <TableRow
                          key={batch.shipment_batch_id}
                          sx={{
                            "&:hover": { bgcolor: "#f9fafb" },
                            borderBottom: "1px solid #F0F0F0",
                          }}
                        >
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
                                  p: 1,
                                  borderRadius: "8px",
                                  backgroundColor: "#f8fafc",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <LocalShipping
                                  sx={{ color: "#1C1C26", fontSize: 18 }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, color: "#1C1C26" }}
                                >
                                  {shipmentService.formatBatchId(
                                    batch.shipment_batch_id
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6b7280" }}
                                >
                                  {batch.excel_filename || "archivo.pdf"}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={stateInfo.text}
                              size="small"
                              icon={<span>{stateInfo.icon}</span>}
                              sx={{
                                backgroundColor: stateInfo.bgColor,
                                color: stateInfo.textColor,
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#16a34a" }}
                                >
                                  ✅ {batch.entregados || 0} entregados
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#f59e0b" }}
                                >
                                  ⏳ {batch.pendientes || 0} pendientes
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6b7280" }}
                                >
                                  📦 {batch.total_envios} total
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#3b82f6" }}
                                >
                                  💳 {batch.pagados || 0} pagados
                                </Typography>
                              </Grid>
                            </Grid>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ color: "#1C1C26" }}
                            >
                              {shipmentService.formatDateTime(
                                batch.fecha_envio
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              {batchAge}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {/* Botón de descarga PDF */}
                              <Tooltip title="Descargar PDF">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadPDF(batch)}
                                  disabled={
                                    downloadingPDF[batch.shipment_batch_id]
                                  }
                                  sx={{
                                    color: "#6B7280",
                                    backgroundColor: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    "&:hover": {
                                      backgroundColor: "#DC2626",
                                      borderColor: "#DC2626",
                                      color: "#FFFFFF",
                                    },
                                  }}
                                >
                                  {downloadingPDF[batch.shipment_batch_id] ? (
                                    <CircularProgress
                                      size={16}
                                      color="inherit"
                                    />
                                  ) : (
                                    <PictureAsPdf sx={{ fontSize: 16 }} />
                                  )}
                                </IconButton>
                              </Tooltip>

                              {/* Ver Detalle */}
                              <Tooltip title="Ver detalle completo">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewBatchDetail(batch)}
                                  sx={{
                                    color: "#6B7280",
                                    backgroundColor: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    "&:hover": {
                                      backgroundColor: "#10B981",
                                      borderColor: "#10B981",
                                      color: "#FFFFFF",
                                    },
                                  }}
                                >
                                  <Visibility sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>

                              {/* Menú de Acciones */}
                              <Tooltip title="Más acciones">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, batch)}
                                  sx={{
                                    color: "#6B7280",
                                    backgroundColor: "#F8FAFC",
                                    border: "1px solid #E2E8F0",
                                    "&:hover": {
                                      backgroundColor: "#F59E0B",
                                      borderColor: "#F59E0B",
                                      color: "#FFFFFF",
                                    },
                                  }}
                                >
                                  <MoreVert sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Mostrando {historyData.batches.length} de{" "}
                    {historyData.pagination.total_items} lotes
                  </Typography>

                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      displayEmpty
                    >
                      <MenuItem value={10}>10 / página</MenuItem>
                      <MenuItem value={20}>20 / página</MenuItem>
                      <MenuItem value={50}>50 / página</MenuItem>
                      <MenuItem value={100}>100 / página</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Pagination
                  count={historyData.pagination.total_pages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 8, color: "#6A736A" }}>
              <History sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No hay lotes en el historial
              </Typography>
              <Typography variant="body2">
                {Object.values(filters).some((f) => f && f !== "all")
                  ? "No se encontraron lotes con los filtros aplicados"
                  : "No hay lotes de envío en el historial"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menú de Acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(28, 28, 38, 0.1)",
            border: "1px solid rgba(190, 191, 189, 0.1)",
            mt: 1,
          },
        }}
      >
        {menuBatch && (
          <>
            {/* Descargar PDF */}
            <MenuItem
              onClick={() => {
                handleDownloadPDF(menuBatch);
                handleMenuClose();
              }}
              disabled={downloadingPDF[menuBatch.shipment_batch_id]}
              sx={{ py: 1.5, px: 3, minWidth: 200 }}
            >
              <ListItemIcon>
                {downloadingPDF[menuBatch.shipment_batch_id] ? (
                  <CircularProgress size={20} />
                ) : (
                  <PictureAsPdf fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  downloadingPDF[menuBatch.shipment_batch_id]
                    ? "Descargando..."
                    : "📄 Descargar PDF"
                }
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "#1C1C26",
                  fontWeight: downloadingPDF[menuBatch.shipment_batch_id]
                    ? 400
                    : 500,
                }}
              />
            </MenuItem>

            {/* Ver Detalle */}
            <MenuItem
              onClick={() => {
                handleViewBatchDetail(menuBatch);
                handleMenuClose();
              }}
              sx={{ py: 1.5, px: 3 }}
            >
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Ver Detalle"
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "#1C1C26",
                }}
              />
            </MenuItem>

            {/* Archivar (solo si no está archivado) */}
            {menuBatch.estado !== "ARCHIVADO" && (
              <MenuItem
                onClick={() => handleArchiveBatch(menuBatch)}
                sx={{ py: 1.5, px: 3 }}
              >
                <ListItemIcon>
                  <Archive fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Archivar Lote"
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    color: "#1C1C26",
                  }}
                />
              </MenuItem>
            )}

            {/* Exportar */}
            <MenuItem
              onClick={() => {
                // TODO: Implementar exportación
                handleMenuClose();
              }}
              sx={{ py: 1.5, px: 3 }}
            >
              <ListItemIcon>
                <Download fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Exportar Datos"
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "#1C1C26",
                }}
              />
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Modal: Confirmar Archivado */}
      <Dialog
        open={showArchiveDialog}
        onClose={() => !archiving && setShowArchiveDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#1C1C26" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Archive sx={{ color: "#1C1C26" }} />
            Archivar Lote
          </Box>
        </DialogTitle>
        <DialogContent>
          {archivingBatch && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                ¿Deseas archivar el lote{" "}
                <strong>
                  {shipmentService.formatBatchId(
                    archivingBatch.shipment_batch_id
                  )}
                </strong>
                ?
              </Typography>

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                El lote archivado se moverá al historial y ya no aparecerá en la
                vista principal de lotes activos. Esta acción se puede revertir.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowArchiveDialog(false)}
            disabled={archiving}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={executeArchiveBatch}
            variant="contained"
            disabled={archiving}
            startIcon={
              archiving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Archive />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#1C1C26",
              "&:hover": { backgroundColor: "#0D0D0D" },
            }}
          >
            {archiving ? "Archivando..." : "Archivar Lote"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Detalle del Lote */}
      <ShipmentBatchDetail
        open={showBatchDetail}
        batch={selectedBatch}
        onClose={() => {
          setShowBatchDetail(false);
          setSelectedBatch(null);
        }}
        onUpdate={() => {
          loadHistoryData();
        }}
      />
    </Box>
  );
};

export default ShipmentHistoryView;
