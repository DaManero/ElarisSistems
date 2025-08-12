// components/ManageBatches.js - CON FUNCIONALIDAD DE ETIQUETAS
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Collapse,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Stack,
} from "@mui/material";
import {
  Visibility,
  ExpandMore,
  ExpandLess,
  MoreVert,
  CheckCircle,
  Schedule,
  Error,
  LocalShipping,
  Assignment,
  Refresh,
  Download,
  Update,
  Archive,
  Label, // 🆕 NUEVO ICONO PARA ETIQUETAS
} from "@mui/icons-material";
import { shipmentService } from "../services/shipmentService";
import ShipmentBatchDetail from "./ShipmentBatchDetail";

const ManageBatches = ({ onBatchUpdated, refreshKey, showNotification }) => {
  // ==========================================
  // ESTADOS PRINCIPALES
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para lotes y paginación
  const [allBatches, setAllBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const batchesPerPage = 10;

  // Estados para expandir lotes
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [batchDetails, setBatchDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Estados para modales y menús
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetail, setShowBatchDetail] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuBatch, setMenuBatch] = useState(null);

  // Estados para descarga de HTML
  const [downloadingPDF, setDownloadingPDF] = useState({});

  // 🆕 NUEVO: Estados para generación de etiquetas
  const [generatingLabels, setGeneratingLabels] = useState({});

  // Estados para actualización rápida
  const [showQuickUpdateDialog, setShowQuickUpdateDialog] = useState(false);
  const [quickUpdateData, setQuickUpdateData] = useState({
    batchId: "",
    action: "",
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ==========================================
  // CARGAR DATOS
  // ==========================================

  const loadBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      setError("");

      // Obtener TODOS los lotes sin filtros de fecha
      const response = await shipmentService.getShipmentBatches({});
      const batchesData = response.data || [];

      // Ordenar por fecha_envio descendente (más nuevos primero)
      const sortedBatches = batchesData.sort((a, b) => {
        return new Date(b.fecha_envio) - new Date(a.fecha_envio);
      });

      setAllBatches(sortedBatches);

      // Calcular total de páginas
      const totalPagesCalculated = Math.ceil(
        sortedBatches.length / batchesPerPage
      );
      setTotalPages(totalPagesCalculated);

      // Si la página actual excede el total, resetear a página 1
      if (currentPage > totalPagesCalculated && totalPagesCalculated > 0) {
        setCurrentPage(1);
      }

      console.log(
        `📦 Lotes cargados: ${sortedBatches.length} (Página ${currentPage}/${totalPagesCalculated})`
      );
    } catch (error) {
      console.error("Error loading batches:", error);
      setError(error.message || "Error cargando lotes de envío");
      setAllBatches([]);
    } finally {
      setLoadingBatches(false);
      setLoading(false);
    }
  }, [currentPage]);

  // Cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadBatches();
  }, [loadBatches, refreshKey]);

  // ==========================================
  // PAGINACIÓN
  // ==========================================

  // Obtener lotes para la página actual
  const getCurrentPageBatches = () => {
    const startIndex = (currentPage - 1) * batchesPerPage;
    const endIndex = startIndex + batchesPerPage;
    return allBatches.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    // Cerrar cualquier lote expandido al cambiar de página
    setExpandedBatch(null);
  };

  const currentPageBatches = getCurrentPageBatches();

  // ==========================================
  // GESTIÓN DE DETALLES DE LOTES
  // ==========================================

  // Cargar detalles de un lote específico
  const loadBatchDetails = async (batchId) => {
    if (batchDetails[batchId]) return; // Ya están cargados

    try {
      setLoadingDetails((prev) => ({ ...prev, [batchId]: true }));

      const response = await shipmentService.getShipmentsByBatch(batchId);
      setBatchDetails((prev) => ({
        ...prev,
        [batchId]: response.data || [],
      }));
    } catch (error) {
      console.error("Error loading batch details:", error);
      if (showNotification) {
        showNotification(
          "error",
          error.message || "Error cargando detalles del lote"
        );
      }
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // Expandir/contraer lote
  const handleToggleExpand = (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchId);
      loadBatchDetails(batchId);
    }
  };

  // ==========================================
  // GESTIÓN DE MODALES Y ACCIONES
  // ==========================================

  // Ver detalle completo del lote
  const handleViewBatchDetail = (batch) => {
    setSelectedBatch(batch);
    setShowBatchDetail(true);
  };

  // Manejar menú de acciones
  const handleMenuOpen = (event, batch) => {
    setAnchorEl(event.currentTarget);
    setMenuBatch(batch);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBatch(null);
  };

  // ==========================================
  // VISUALIZACIÓN DE HTML
  // ==========================================

  const handleViewHTML = async (batch) => {
    const batchId = batch.shipment_batch_id;

    try {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: true }));
      setError("");

      // Usar el método de visualización HTML del servicio
      const result = await shipmentService.viewBatchHTML(batchId);

      if (showNotification) {
        showNotification(
          "success",
          `📄 Reporte del lote ${shipmentService.formatBatchId(
            batchId
          )} abierto en nueva pestaña`
        );
      }
    } catch (error) {
      console.error("Error viewing HTML report:", error);
      if (showNotification) {
        showNotification(
          "error",
          error.message || "Error visualizando reporte"
        );
      }
    } finally {
      setDownloadingPDF((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // ==========================================
  // 🆕 GENERACIÓN DE ETIQUETAS
  // ==========================================

  const handleGenerateLabels = async (batch) => {
    const batchId = batch.shipment_batch_id;

    try {
      setGeneratingLabels((prev) => ({ ...prev, [batchId]: true }));
      setError("");

      const result = await shipmentService.generateBatchLabels(batchId);

      if (showNotification) {
        showNotification(
          "success",
          `🏷️ Etiquetas del lote ${shipmentService.formatBatchId(
            batchId
          )} generadas exitosamente`
        );
      }
    } catch (error) {
      console.error("Error generating labels:", error);
      if (showNotification) {
        showNotification("error", error.message || "Error generando etiquetas");
      }
    } finally {
      setGeneratingLabels((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  // ==========================================
  // ACTUALIZACIÓN RÁPIDA DE LOTES
  // ==========================================

  const handleQuickUpdate = (batch, action) => {
    setQuickUpdateData({
      batchId: batch.shipment_batch_id,
      action: action,
      batchData: batch,
    });
    setShowQuickUpdateDialog(true);
    handleMenuClose();
  };

  const executeQuickUpdate = async () => {
    if (!quickUpdateData.batchId || !quickUpdateData.action) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const action = shipmentService.QUICK_ACTIONS.find(
        (a) => a.id === quickUpdateData.action
      );

      if (!action) {
        if (showNotification) {
          showNotification("error", "Acción no válida");
        }
        return;
      }

      // Obtener envíos del lote
      const batchShipments = batchDetails[quickUpdateData.batchId] || [];

      if (batchShipments.length === 0) {
        // Cargar envíos si no están cargados
        await loadBatchDetails(quickUpdateData.batchId);
        return;
      }

      // Preparar actualizaciones
      const updates = batchShipments.map((shipment) => ({
        shipment_id: shipment.id,
        ...(action.estado_entrega && { estado_entrega: action.estado_entrega }),
        ...(action.estado_pago_real && {
          estado_pago_real: action.estado_pago_real,
        }),
        observaciones_distribuidor: `Actualización masiva: ${action.label}`,
      }));

      await shipmentService.updateBatchStatus(quickUpdateData.batchId, updates);

      if (showNotification) {
        showNotification(
          "success",
          `✅ Lote actualizado: ${action.label} aplicado a ${updates.length} envíos`
        );
      }

      // Refrescar datos
      await loadBatches();
      if (onBatchUpdated) onBatchUpdated();

      // Limpiar detalles cargados para forzar recarga
      setBatchDetails((prev) => ({
        ...prev,
        [quickUpdateData.batchId]: null,
      }));

      setShowQuickUpdateDialog(false);
    } catch (error) {
      if (showNotification) {
        showNotification("error", error.message || "Error actualizando lote");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  // Formatear progreso del lote
  const getBatchProgress = (batch) => {
    const total = parseInt(batch.total_envios) || 0;
    const entregados = parseInt(batch.entregados) || 0;

    if (total === 0) return 0;
    return Math.round((entregados / total) * 100);
  };

  // Obtener color del progreso
  const getProgressColor = (progress) => {
    if (progress >= 100) return "#16a34a";
    if (progress >= 75) return "#3b82f6";
    if (progress >= 50) return "#f59e0b";
    return "#ef4444";
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
            📋 Gestión de Lotes
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Todos los lotes de envío ordenados del más nuevo al más antiguo
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadBatches}
            disabled={loadingBatches}
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

      {/* Alerts locales */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Info de paginación */}
      <Card sx={{ mb: 3, borderRadius: 3, backgroundColor: "#f8fafc" }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                📊 <strong>Total:</strong> {allBatches.length} lotes encontrados
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  📄 Página {currentPage} de {totalPages} • Mostrando{" "}
                  {currentPageBatches.length} lotes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Lotes */}
      <Card
        sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
      >
        <CardContent sx={{ p: 0, paddingBottom: "1px !important" }}>
          {loadingBatches ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : currentPageBatches.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Lote
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Estadísticas
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Progreso
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Fecha Creación
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPageBatches.map((batch) => {
                      const progress = getBatchProgress(batch);
                      const isExpanded =
                        expandedBatch === batch.shipment_batch_id;
                      const details =
                        batchDetails[batch.shipment_batch_id] || [];
                      const isLoadingDetails =
                        loadingDetails[batch.shipment_batch_id];

                      return (
                        <React.Fragment key={batch.shipment_batch_id}>
                          {/* Fila principal del lote */}
                          <TableRow
                            sx={{
                              bgcolor: "#FDFDFD",
                              "&:hover": { bgcolor: "#F8F9FA" },
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
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <CheckCircle
                                      sx={{ fontSize: 14, color: "#16a34a" }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#16a34a" }}
                                    >
                                      {batch.entregados} entregados
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Schedule
                                      sx={{ fontSize: 14, color: "#f59e0b" }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#f59e0b" }}
                                    >
                                      {batch.pendientes} pendientes
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6b7280" }}
                                  >
                                    Total: {batch.total_envios}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#3b82f6" }}
                                  >
                                    Pagados: {batch.pagados}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </TableCell>

                            <TableCell>
                              <Box sx={{ minWidth: 120 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6b7280" }}
                                  >
                                    {progress}%
                                  </Typography>
                                  <Chip
                                    label={
                                      progress >= 100
                                        ? "Completado"
                                        : progress >= 75
                                        ? "Casi listo"
                                        : progress >= 50
                                        ? "En progreso"
                                        : "Iniciando"
                                    }
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        getProgressColor(progress),
                                      color: "#ffffff",
                                      fontSize: "0.65rem",
                                    }}
                                  />
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "#f3f4f6",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor:
                                        getProgressColor(progress),
                                      borderRadius: 3,
                                    },
                                  }}
                                />
                              </Box>
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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                {/* Ver Reporte */}
                                <Tooltip title="Ver Reporte">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewHTML(batch)}
                                    disabled={
                                      downloadingPDF[batch.shipment_batch_id]
                                    }
                                    sx={{
                                      color: "#6B7280",
                                      backgroundColor: "#F8FAFC",
                                      border: "1px solid #E2E8F0",
                                      "&:hover": {
                                        backgroundColor: "#3B82F6",
                                        borderColor: "#3B82F6",
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
                                      <Assignment sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                {/* 🆕 NUEVO: Generar Etiquetas */}
                                <Tooltip title="Generar Etiquetas">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleGenerateLabels(batch)}
                                    disabled={
                                      generatingLabels[batch.shipment_batch_id]
                                    }
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
                                    {generatingLabels[
                                      batch.shipment_batch_id
                                    ] ? (
                                      <CircularProgress
                                        size={16}
                                        color="inherit"
                                      />
                                    ) : (
                                      <Label sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                {/* Expandir/Contraer */}
                                <Tooltip
                                  title={
                                    isExpanded
                                      ? "Contraer"
                                      : "Expandir detalles"
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleToggleExpand(
                                        batch.shipment_batch_id
                                      )
                                    }
                                    sx={{
                                      color: "#6B7280",
                                      backgroundColor: "#F8FAFC",
                                      border: "1px solid #E2E8F0",
                                      "&:hover": {
                                        backgroundColor: "#3B82F6",
                                        borderColor: "#3B82F6",
                                        color: "#FFFFFF",
                                      },
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ExpandLess sx={{ fontSize: 16 }} />
                                    ) : (
                                      <ExpandMore sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                {/* Ver Detalle Completo */}
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

                          {/* Fila expandida con detalles */}
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              sx={{
                                p: 0,
                                borderBottom: isExpanded
                                  ? "none"
                                  : "1px solid #F0F0F0",
                              }}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ p: 3, bgcolor: "#fafbfc" }}>
                                  {isLoadingDetails ? (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        py: 2,
                                      }}
                                    >
                                      <CircularProgress size={24} />
                                    </Box>
                                  ) : details.length > 0 ? (
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#6b7280" }}
                                    >
                                      {details.length} envíos en este lote.
                                      <Button
                                        size="small"
                                        onClick={() =>
                                          handleViewBatchDetail(batch)
                                        }
                                        sx={{ ml: 1, textTransform: "none" }}
                                      >
                                        Ver detalles completos
                                      </Button>
                                    </Typography>
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#6b7280" }}
                                    >
                                      No se pudieron cargar los detalles del
                                      lote
                                    </Typography>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                    borderTop: "1px solid #F0F0F0",
                  }}
                >
                  <Stack spacing={2}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      Mostrando {(currentPage - 1) * batchesPerPage + 1} -{" "}
                      {Math.min(
                        currentPage * batchesPerPage,
                        allBatches.length
                      )}{" "}
                      de {allBatches.length} lotes
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            // Estado vacío
            <Box sx={{ textAlign: "center", py: 8, color: "#6A736A" }}>
              <Assignment sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No hay lotes de envío
              </Typography>
              <Typography variant="body2">
                Los lotes aparecerán aquí cuando se generen desde 'Preparar
                Envíos'
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Menú de Acciones Rápidas */}
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
            {/* Ver HTML */}
            <MenuItem
              onClick={() => {
                handleViewHTML(menuBatch);
                handleMenuClose();
              }}
              disabled={downloadingPDF[menuBatch.shipment_batch_id]}
              sx={{ py: 1.5, px: 3, minWidth: 200 }}
            >
              <ListItemIcon>
                {downloadingPDF[menuBatch.shipment_batch_id] ? (
                  <CircularProgress size={20} />
                ) : (
                  <Assignment fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  downloadingPDF[menuBatch.shipment_batch_id]
                    ? "Cargando..."
                    : "📄 Ver Reporte"
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

            {/* 🆕 NUEVO: Generar Etiquetas */}
            <MenuItem
              onClick={() => {
                handleGenerateLabels(menuBatch);
                handleMenuClose();
              }}
              disabled={generatingLabels[menuBatch.shipment_batch_id]}
              sx={{ py: 1.5, px: 3 }}
            >
              <ListItemIcon>
                {generatingLabels[menuBatch.shipment_batch_id] ? (
                  <CircularProgress size={20} />
                ) : (
                  <Label fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  generatingLabels[menuBatch.shipment_batch_id]
                    ? "Generando..."
                    : "🏷️ Generar Etiquetas"
                }
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "#1C1C26",
                  fontWeight: generatingLabels[menuBatch.shipment_batch_id]
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
                primary="Ver Detalle Completo"
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  color: "#1C1C26",
                }}
              />
            </MenuItem>

            {/* Acciones rápidas */}
            {shipmentService.QUICK_ACTIONS.map((action) => (
              <MenuItem
                key={action.id}
                onClick={() => handleQuickUpdate(menuBatch, action.id)}
                sx={{ py: 1.5, px: 3 }}
              >
                <ListItemIcon>
                  <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    color: "#1C1C26",
                  }}
                />
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Modal: Confirmación de Actualización Rápida */}
      <Dialog
        open={showQuickUpdateDialog}
        onClose={() => !updatingStatus && setShowQuickUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#1C1C26" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Update sx={{ color: "#1C1C26" }} />
            Actualización Masiva de Lote
          </Box>
        </DialogTitle>
        <DialogContent>
          {quickUpdateData.action && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                ¿Deseas aplicar la acción "
                <strong>
                  {
                    shipmentService.QUICK_ACTIONS.find(
                      (a) => a.id === quickUpdateData.action
                    )?.label
                  }
                </strong>
                " a todos los envíos del lote{" "}
                <strong>
                  {shipmentService.formatBatchId(quickUpdateData.batchId)}
                </strong>
                ?
              </Typography>

              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Esta acción actualizará todos los envíos del lote y sus ventas
                relacionadas. La acción no se puede deshacer.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowQuickUpdateDialog(false)}
            disabled={updatingStatus}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={executeQuickUpdate}
            variant="contained"
            disabled={updatingStatus}
            startIcon={
              updatingStatus ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Update />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#1C1C26",
              "&:hover": { backgroundColor: "#0D0D0D" },
            }}
          >
            {updatingStatus ? "Actualizando..." : "Confirmar Actualización"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Detalle Completo del Lote */}
      <ShipmentBatchDetail
        open={showBatchDetail}
        batch={selectedBatch}
        onClose={() => {
          setShowBatchDetail(false);
          setSelectedBatch(null);
        }}
        onUpdate={() => {
          loadBatches();
          if (onBatchUpdated) onBatchUpdated();
        }}
      />
    </Box>
  );
};

export default ManageBatches;
