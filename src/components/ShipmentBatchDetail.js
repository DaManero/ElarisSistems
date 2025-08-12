import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  Edit,
  Save,
  Cancel,
  LocalShipping,
  Person,
  Phone,
  LocationOn,
  Receipt,
  AttachMoney,
  Schedule,
  CheckCircle,
  Error,
  EventRepeat,
  ExpandMore,
  Search,
  FilterList,
  Update,
  Assignment,
  Refresh,
} from "@mui/icons-material";
import { shipmentService } from "../services/shipmentService";
import { saleService } from "../services/salesService";

const ShipmentBatchDetail = ({ open, batch, onClose, onUpdate }) => {
  // Estados principales
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para edición
  const [editingShipment, setEditingShipment] = useState(null);
  const [editForm, setEditForm] = useState({
    estado_entrega: "",
    estado_pago_real: "",
    observaciones_distribuidor: "",
  });
  const [saving, setSaving] = useState(false);

  // Estados para filtros y vista
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Estados para estadísticas del lote
  const [batchStats, setBatchStats] = useState({});

  // Cargar envíos del lote
  const loadShipments = useCallback(async () => {
    if (!batch?.shipment_batch_id) return;

    try {
      setLoading(true);
      setError("");

      const response = await shipmentService.getShipmentsByBatch(
        batch.shipment_batch_id
      );

      const shipmentsData = response.data || [];
      setShipments(shipmentsData);

      // Calcular estadísticas
      const stats = shipmentService.calculateBatchStats(shipmentsData);
      setBatchStats(stats);
    } catch (error) {
      console.error("Error loading shipments:", error);
      setError(error.message || "Error cargando envíos del lote");
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [batch]);

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && batch) {
      loadShipments();
    }
  }, [open, batch, loadShipments]);

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!open) {
      setShipments([]);
      setEditingShipment(null);
      setSearchTerm("");
      setStatusFilter("all");
      setActiveTab(0);
      setError("");
      setSuccess("");
    }
  }, [open]);

  // Iniciar edición de envío
  const handleEditShipment = (shipment) => {
    setEditingShipment(shipment.id);
    setEditForm({
      estado_entrega: shipment.estado_entrega || "",
      estado_pago_real: shipment.estado_pago_real || "",
      observaciones_distribuidor: shipment.observaciones_distribuidor || "",
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingShipment(null);
    setEditForm({
      estado_entrega: "",
      estado_pago_real: "",
      observaciones_distribuidor: "",
    });
  };

  // Guardar cambios en envío
  const handleSaveShipment = async (shipmentId) => {
    try {
      setSaving(true);
      setError("");

      const updateData = shipmentService.prepareStatusUpdateData(editForm);

      await shipmentService.updateShipmentStatus(shipmentId, updateData);

      setSuccess("Envío actualizado exitosamente");

      // Recargar datos
      await loadShipments();
      if (onUpdate) onUpdate();

      // Limpiar edición
      handleCancelEdit();
    } catch (error) {
      setError(error.message || "Error actualizando envío");
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filtrar envíos
  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      !searchTerm ||
      shipment.venta?.numero_venta
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.venta?.cliente?.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.venta?.cliente?.apellido
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || shipment.estado_entrega === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Obtener envíos por pestaña
  const getShipmentsByTab = () => {
    switch (activeTab) {
      case 0: // Todos
        return filteredShipments;
      case 1: // Pendientes
        return filteredShipments.filter(
          (s) => s.estado_entrega === "Pendiente"
        );
      case 2: // Entregados
        return filteredShipments.filter(
          (s) => s.estado_entrega === "Entregado"
        );
      case 3: // Problemas
        return filteredShipments.filter((s) =>
          ["No encontrado", "Reprogramado", "Cancelado"].includes(
            s.estado_entrega
          )
        );
      default:
        return filteredShipments;
    }
  };

  const displayShipments = getShipmentsByTab();

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          backgroundColor: "#ffffff",
          border: "none",
          maxHeight: "95vh",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 4,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalShipping sx={{ color: "#1C1C26", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: "#111827",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Detalle del Lote de Envío
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              {shipmentService.formatBatchId(batch.shipment_batch_id)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={loadShipments}
              disabled={loading}
              sx={{
                color: "#6b7280",
                backgroundColor: "#f3f4f6",
                "&:hover": {
                  backgroundColor: "#3B82F6",
                  color: "#ffffff",
                },
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={onClose}
            sx={{
              color: "#9ca3af",
              "&:hover": {
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#f3f4f6" }} />

      {/* Content */}
      <DialogContent sx={{ p: 4, pt: 3 }}>
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

        {/* Información del Lote */}
        <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid #f1f5f9" }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Información básica */}
              <Grid item xs={12} md={8}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1C1C26", fontWeight: 600 }}
                >
                  Información del Lote
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Archivo Excel
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {batch.excel_filename}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {shipmentService.formatDateTime(batch.fecha_envio)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Total de Envíos
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {batch.total_envios} envíos
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Progreso General
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {batchStats.progreso || 0}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={batchStats.progreso || 0}
                        sx={{
                          flexGrow: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "#f3f4f6",
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Estadísticas */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1C1C26", fontWeight: 600 }}
                >
                  Estadísticas
                </Typography>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#16a34a", fontWeight: 700 }}
                      >
                        {batchStats.entregados || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Entregados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#f59e0b", fontWeight: 700 }}
                      >
                        {batchStats.pendientes || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Pendientes
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#3b82f6", fontWeight: 700 }}
                      >
                        {batchStats.pagados || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Pagados
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center", p: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ color: "#ef4444", fontWeight: 700 }}
                      >
                        {batchStats.no_encontrados || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        No encontrados
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filtros y Búsqueda */}
        <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid #f1f5f9" }}>
          <CardContent sx={{ py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar por venta o cliente..."
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Filtrar por Estado"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">Todos los estados</MenuItem>
                    {shipmentService.DELIVERY_STATES.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", textAlign: "right" }}
                >
                  Mostrando {displayShipments.length} de {shipments.length}{" "}
                  envíos
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs de navegación */}
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                minWidth: "auto",
                mr: 2,
                color: "#6b7280",
                "&.Mui-selected": {
                  color: "#1C1C26",
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#1C1C26",
              },
            }}
          >
            <Tab
              label={`Todos (${shipments.length})`}
              icon={<Assignment fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label={`Pendientes (${batchStats.pendientes || 0})`}
              icon={<Schedule fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label={`Entregados (${batchStats.entregados || 0})`}
              icon={<CheckCircle fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label={`Problemas (${
                (batchStats.no_encontrados || 0) +
                (batchStats.reprogramados || 0) +
                (batchStats.cancelados || 0)
              })`}
              icon={<Error fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Lista de Envíos */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : displayShipments.length > 0 ? (
          <Card sx={{ borderRadius: 3, border: "1px solid #f1f5f9" }}>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Venta
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Cliente
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Estado Entrega
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Estado Pago
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Observaciones
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayShipments.map((shipment) => {
                    const isEditing = editingShipment === shipment.id;
                    const deliveryInfo = shipmentService.getDeliveryStatusInfo(
                      shipment.estado_entrega
                    );
                    const paymentInfo = shipmentService.getPaymentStatusInfo(
                      shipment.estado_pago_real
                    );

                    return (
                      <TableRow
                        key={shipment.id}
                        sx={{
                          "&:hover": { bgcolor: "#f9fafb" },
                          bgcolor: isEditing ? "#fffbeb" : "inherit",
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
                                {shipment.venta?.numero_venta || "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                {saleService.formatPrice(shipment.venta?.total)}
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
                              {saleService.getCustomerFullName(
                                shipment.venta?.cliente
                              )}
                            </Typography>
                            {shipment.venta?.cliente?.telefono && (
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
                                {shipment.venta.cliente.telefono}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={editForm.estado_entrega}
                                onChange={(e) =>
                                  handleEditFormChange(
                                    "estado_entrega",
                                    e.target.value
                                  )
                                }
                                displayEmpty
                              >
                                {shipmentService.DELIVERY_STATES.map(
                                  (state) => (
                                    <MenuItem key={state} value={state}>
                                      {state}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip
                              label={deliveryInfo.text}
                              size="small"
                              icon={<span>{deliveryInfo.icon}</span>}
                              sx={{
                                backgroundColor: deliveryInfo.bgColor,
                                color: deliveryInfo.textColor,
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <Select
                                value={editForm.estado_pago_real}
                                onChange={(e) =>
                                  handleEditFormChange(
                                    "estado_pago_real",
                                    e.target.value
                                  )
                                }
                                displayEmpty
                              >
                                {shipmentService.PAYMENT_STATES.map((state) => (
                                  <MenuItem key={state} value={state}>
                                    {state}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip
                              label={paymentInfo.text}
                              size="small"
                              icon={<span>{paymentInfo.icon}</span>}
                              sx={{
                                backgroundColor: paymentInfo.bgColor,
                                color: paymentInfo.textColor,
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <TextField
                              size="small"
                              multiline
                              rows={2}
                              value={editForm.observaciones_distribuidor}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "observaciones_distribuidor",
                                  e.target.value
                                )
                              }
                              placeholder="Observaciones del distribuidor..."
                              sx={{ minWidth: 200 }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                color: shipment.observaciones_distribuidor
                                  ? "#1C1C26"
                                  : "#6b7280",
                                fontStyle: shipment.observaciones_distribuidor
                                  ? "normal"
                                  : "italic",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {shipment.observaciones_distribuidor ||
                                "Sin observaciones"}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Guardar cambios">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleSaveShipment(shipment.id)
                                  }
                                  disabled={saving}
                                  sx={{
                                    color: "#16a34a",
                                    "&:hover": { backgroundColor: "#f0fdf4" },
                                  }}
                                >
                                  {saving ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <Save fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancelar">
                                <IconButton
                                  size="small"
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  sx={{
                                    color: "#ef4444",
                                    "&:hover": { backgroundColor: "#fef2f2" },
                                  }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Tooltip title="Editar envío">
                              <IconButton
                                size="small"
                                onClick={() => handleEditShipment(shipment)}
                                sx={{
                                  color: "#6b7280",
                                  "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                    color: "#1C1C26",
                                  },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#6A736A",
            }}
          >
            <LocalShipping sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No hay envíos
            </Typography>
            <Typography variant="body2">
              {searchTerm || statusFilter !== "all"
                ? "No se encontraron envíos con los filtros aplicados"
                : "No hay envíos en este lote"}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 3,
            py: 1.5,
            color: "#6b7280",
            fontSize: "14px",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#f3f4f6",
              color: "#374151",
            },
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShipmentBatchDetail;
