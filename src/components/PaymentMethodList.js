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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Payment,
  FilterList,
  Receipt,
  ReceiptLong,
  ToggleOff,
  ToggleOn,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import paymentMethodService from "../services/paymentMethodService";
import PaymentMethodForm from "./PaymentMethodForm";

const PaymentMethodList = () => {
  // Estados principales
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReferenceReq, setSelectedReferenceReq] = useState("all");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPaymentMethods, setTotalPaymentMethods] = useState(0);
  const itemsPerPage = 20;

  // Estados para modales
  const [showPaymentMethodForm, setShowPaymentMethodForm] = useState(false);
  const [paymentMethodToEdit, setPaymentMethodToEdit] = useState(null);

  // Estados para modal de eliminación
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState(null);

  // Función para cargar métodos de pago
  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const params = paymentMethodService.buildSearchParams({
        search: searchTerm,
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
      });

      const response = await paymentMethodService.getPaymentMethods(params);

      if (response.data.paymentMethods) {
        // Respuesta con paginación
        setPaymentMethods(response.data.paymentMethods);
        setTotalPages(response.data.pagination.totalPages);
        setTotalPaymentMethods(response.data.pagination.total);
      } else {
        // Respuesta directa
        setPaymentMethods(response.data || []);
      }

      setError("");
    } catch (error) {
      setError(error.message || "Error loading payment methods");
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, currentPage]);

  // Efecto para búsqueda y filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset página al filtrar
      loadPaymentMethods();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  // Efecto para cambios de página
  useEffect(() => {
    if (currentPage > 1) {
      loadPaymentMethods();
    }
  }, [currentPage, loadPaymentMethods]);

  console.log("💳 Estado actual:", { paymentMethods, loading, error });

  // Funciones para manejar modales
  const handleCreatePaymentMethod = () => {
    setPaymentMethodToEdit(null);
    setShowPaymentMethodForm(true);
  };

  const handleEditPaymentMethod = (paymentMethod) => {
    setPaymentMethodToEdit(paymentMethod);
    setShowPaymentMethodForm(true);
  };

  const handleCloseForm = () => {
    setShowPaymentMethodForm(false);
    setPaymentMethodToEdit(null);
  };

  const handleFormSuccess = () => {
    loadPaymentMethods();
    setShowPaymentMethodForm(false);
    setPaymentMethodToEdit(null);
  };

  // Función para cambiar estado del método de pago
  const handleToggleStatus = async (paymentMethod) => {
    try {
      await paymentMethodService.togglePaymentMethodStatus(paymentMethod.id);
      await loadPaymentMethods();
    } catch (error) {
      setError(error.message || "Error updating payment method status");
    }
  };

  // Función para eliminar método de pago
  const handleDeletePaymentMethod = async () => {
    try {
      await paymentMethodService.deletePaymentMethod(paymentMethodToDelete.id);
      await loadPaymentMethods();
      setDeleteDialog(false);
      setPaymentMethodToDelete(null);
    } catch (error) {
      setError(error.message || "Error deleting payment method");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedReferenceReq("all");
    setCurrentPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Filtrar por referencia en el frontend
  const filteredPaymentMethods = paymentMethods.filter((pm) => {
    if (selectedReferenceReq === "all") return true;
    const requires = selectedReferenceReq === "true";
    return pm.requiere_referencia === requires;
  });

  if (loading && paymentMethods.length === 0) {
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
            Métodos de Pago
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {totalPaymentMethods > 0 &&
              `${totalPaymentMethods} métodos registrados`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePaymentMethod}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nuevo Método
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#6A736A" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#FFFFFF",
                  },
                }}
              />
            </Grid>

            {/* Filtro por Estado */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Estado"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="true">Activos</MenuItem>
                  <MenuItem value="false">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Requiere Referencia */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Referencia</InputLabel>
                <Select
                  value={selectedReferenceReq}
                  label="Referencia"
                  onChange={(e) => setSelectedReferenceReq(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="true">Requiere</MenuItem>
                  <MenuItem value="false">No Requiere</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Limpiar Filtros */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={clearFilters}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  width: "100%",
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Payment Methods Table */}
      <Card
        sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
      >
        <CardContent
          sx={{
            p: 0,
            paddingBottom: "1px !important",
            "&:last-child": {
              paddingBottom: "1px",
            },
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Método de Pago
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Descripción
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Referencia
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPaymentMethods.map((paymentMethod) => {
                  const statusInfo =
                    paymentMethodService.getPaymentMethodStatusInfo(
                      paymentMethod.activo
                    );
                  const referenceInfo =
                    paymentMethodService.getReferenceRequirementInfo(
                      paymentMethod.requiere_referencia
                    );

                  return (
                    <TableRow
                      key={paymentMethod.id}
                      sx={{
                        bgcolor: "#FDFDFD",
                        "&:hover": { bgcolor: "#F8F9FA" },
                        borderBottom: "1px solid #F0F0F0",
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                            <Payment sx={{ color: "#1C1C26", fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#1C1C26" }}
                            >
                              {paymentMethod.nombre}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280" }}
                            >
                              ID #{paymentMethod.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: paymentMethod.descripcion
                              ? "#1C1C26"
                              : "#6b7280",
                            fontStyle: paymentMethod.descripcion
                              ? "normal"
                              : "italic",
                          }}
                        >
                          {paymentMethod.descripcion || "Sin descripción"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {paymentMethod.requiere_referencia ? (
                            <Receipt sx={{ fontSize: 16, color: "#f59e0b" }} />
                          ) : (
                            <ReceiptLong
                              sx={{ fontSize: 16, color: "#6b7280" }}
                            />
                          )}
                          <Chip
                            label={referenceInfo.text}
                            size="small"
                            color={referenceInfo.color}
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {paymentMethod.activo ? (
                            <CheckCircle
                              sx={{ fontSize: 16, color: "#16a34a" }}
                            />
                          ) : (
                            <Cancel sx={{ fontSize: 16, color: "#6b7280" }} />
                          )}
                          <Chip
                            label={statusInfo.text}
                            size="small"
                            color={statusInfo.color}
                            variant={
                              paymentMethod.activo ? "outlined" : "filled"
                            }
                            sx={{ fontSize: "0.7rem" }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Editar */}
                          <Tooltip title="Editar método de pago">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditPaymentMethod(paymentMethod)
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
                              <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Toggle Estado */}
                          <Tooltip
                            title={
                              paymentMethod.activo ? "Desactivar" : "Activar"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(paymentMethod)}
                              sx={{
                                color: "#6B7280",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                "&:hover": {
                                  backgroundColor: paymentMethod.activo
                                    ? "#F59E0B"
                                    : "#10B981",
                                  borderColor: paymentMethod.activo
                                    ? "#F59E0B"
                                    : "#10B981",
                                  color: "#FFFFFF",
                                },
                              }}
                            >
                              {paymentMethod.activo ? (
                                <ToggleOn sx={{ fontSize: 16 }} />
                              ) : (
                                <ToggleOff sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Tooltip>

                          {/* Eliminar */}
                          <Tooltip title="Eliminar método de pago">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPaymentMethodToDelete(paymentMethod);
                                setDeleteDialog(true);
                              }}
                              sx={{
                                color: "#6B7280",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                "&:hover": {
                                  backgroundColor: "#EF4444",
                                  borderColor: "#EF4444",
                                  color: "#FFFFFF",
                                },
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
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

          {/* Empty state */}
          {filteredPaymentMethods.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Payment sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm ||
                selectedStatus !== "all" ||
                selectedReferenceReq !== "all"
                  ? "No se encontraron métodos de pago"
                  : "No hay métodos de pago registrados"}
              </Typography>
              <Typography variant="body2">
                {searchTerm ||
                selectedStatus !== "all" ||
                selectedReferenceReq !== "all"
                  ? "Intenta con otros filtros de búsqueda"
                  : "Comienza registrando tu primer método de pago"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => {
          setDeleteDialog(false);
          setPaymentMethodToDelete(null);
        }}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          ⚠️ Eliminar Método de Pago Permanentemente
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas{" "}
            <strong>eliminar permanentemente</strong> el método de pago{" "}
            <strong>{paymentMethodToDelete?.nombre}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> El método de
              pago será eliminado completamente de la base de datos. Asegúrate
              de que no esté siendo usado en ventas existentes.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setPaymentMethodToDelete(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeletePaymentMethod}
            color="error"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#dc2626",
              "&:hover": { backgroundColor: "#b91c1c" },
            }}
          >
            🗑️ Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal del Formulario de Método de Pago */}
      <PaymentMethodForm
        open={showPaymentMethodForm}
        paymentMethodData={paymentMethodToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default PaymentMethodList;
