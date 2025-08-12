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
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Receipt,
  FilterList,
  Person,
  AttachMoney,
  ShoppingCart,
  CalendarToday,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; // 🆕 AGREGADO
import { saleService } from "../services/salesService";
import { customerService } from "../services/customerService";
import paymentMethodService from "../services/paymentMethodService";
import { authService } from "../services/authService";
import SaleDetail from "./SaleDetail";

const SalesList = () => {
  const navigate = useNavigate(); // 🆕 AGREGADO

  // Estados principales
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros
  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedSaleStatus, setSelectedSaleStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const itemsPerPage = 20;

  // Estados para modales
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  // Estados para modal de eliminación
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);

  // Usuario actual
  const [currentUser, setCurrentUser] = useState(null);

  // Función para cargar ventas
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const params = saleService.buildSearchParams({
        search: searchTerm,
        cliente_id: selectedCustomer,
        usuario_id: selectedVendor,
        estado_venta: selectedSaleStatus,
        estado_pago: selectedPaymentStatus,
        metodo_pago_id: selectedPaymentMethod,
        fecha_desde: dateFrom,
        fecha_hasta: dateTo,
        page: currentPage,
        limit: itemsPerPage,
      });

      const response = await saleService.getSales(params);

      if (response.data.sales) {
        // Respuesta con paginación
        setSales(response.data.sales);
        setTotalPages(response.data.pagination.totalPages);
        setTotalSales(response.data.pagination.total);
      } else {
        // Respuesta directa
        setSales(response.data || []);
      }

      setError("");
    } catch (error) {
      setError(error.message || "Error loading sales");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    selectedCustomer,
    selectedVendor,
    selectedSaleStatus,
    selectedPaymentStatus,
    selectedPaymentMethod,
    dateFrom,
    dateTo,
    currentPage,
  ]);

  // Función para cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      // Cargar datos para filtros y usuario actual
      const [customersResponse, paymentMethodsResponse] = await Promise.all([
        customerService.getActiveCustomers(),
        paymentMethodService.getActivePaymentMethods(),
      ]);

      setCustomers(customersResponse.data || []);
      setPaymentMethods(paymentMethodsResponse.data || []);
      setCurrentUser(authService.getCurrentUser());

      // Cargar ventas
      await loadSales();
    } catch (error) {
      setError("Error cargando datos iniciales");
    }
  }, [loadSales]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Efecto para búsqueda y filtros en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset página al filtrar
      loadSales();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    selectedCustomer,
    selectedVendor,
    selectedSaleStatus,
    selectedPaymentStatus,
    selectedPaymentMethod,
    dateFrom,
    dateTo,
  ]);

  // Efecto para cambios de página
  useEffect(() => {
    if (currentPage > 1) {
      loadSales();
    }
  }, [currentPage, loadSales]);

  console.log("💰 Estado actual ventas:", { sales, loading, error });

  // Funciones para manejar modales
  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowSaleDetail(true);
  };

  const handleCloseDetail = () => {
    setShowSaleDetail(false);
    setSelectedSale(null);
  };

  // 🆕 FUNCIÓN ACTUALIZADA
  const handleEditSale = (sale) => {
    navigate(`/dashboard/sales/edit/${sale.id}`);
  };

  // Función para eliminar venta
  const handleDeleteSale = async () => {
    try {
      await saleService.deleteSale(saleToDelete.id);
      await loadSales();
      setDeleteDialog(false);
      setSaleToDelete(null);
    } catch (error) {
      setError(error.message || "Error deleting sale");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCustomer("all");
    setSelectedVendor("all");
    setSelectedSaleStatus("all");
    setSelectedPaymentStatus("all");
    setSelectedPaymentMethod("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && sales.length === 0) {
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
            Historial de Ventas
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {totalSales > 0 && `${totalSales} ventas registradas`}
          </Typography>
        </Box>
        {/* 🆕 BOTÓN ACTUALIZADO */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            navigate("/dashboard/sales/new"); // 🎯 Navegar a nueva venta
          }}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nueva Venta
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar por número de venta..."
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

            {/* Filtro por Cliente */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={selectedCustomer}
                  label="Cliente"
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customerService.getFullName(customer)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Estado de Venta */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado Venta</InputLabel>
                <Select
                  value={selectedSaleStatus}
                  label="Estado Venta"
                  onChange={(e) => setSelectedSaleStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {saleService.SALE_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Estado de Pago */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado Pago</InputLabel>
                <Select
                  value={selectedPaymentStatus}
                  label="Estado Pago"
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {saleService.PAYMENT_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Método de Pago */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Método Pago</InputLabel>
                <Select
                  value={selectedPaymentMethod}
                  label="Método Pago"
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>
                      {method.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Limpiar Filtros */}
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={clearFilters}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  width: "100%",
                  minWidth: "auto",
                  px: 2,
                }}
              >
                Limpiar
              </Button>
            </Grid>

            {/* Filtros de Fecha */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <CalendarToday sx={{ color: "#6A736A" }} />
                <TextField
                  label="Desde"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
                <TextField
                  label="Hasta"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sales Table */}
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
                    Venta
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cliente
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Fecha
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Estado Venta
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Estado Pago
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Método Pago
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
                {sales.map((sale) => {
                  const saleStatusInfo = saleService.getSaleStatusInfo(
                    sale.estado_venta
                  );
                  const paymentStatusInfo = saleService.getPaymentStatusInfo(
                    sale.estado_pago
                  );
                  const customerName = saleService.getCustomerFullName(
                    sale.cliente
                  );
                  const totalItems = saleService.calculateTotalItems(
                    sale.items
                  );
                  const canEdit = saleService.canSaleBeEdited(sale);
                  const progress = saleService.getSaleProgress(sale);

                  return (
                    <TableRow
                      key={sale.id}
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
                            <Receipt sx={{ color: "#1C1C26", fontSize: 18 }} />
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
                              {totalItems} {totalItems === 1 ? "item" : "items"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Person sx={{ fontSize: 16, color: "#6b7280" }} />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "#1C1C26", fontWeight: 500 }}
                            >
                              {customerName}
                            </Typography>
                            {sale.cliente?.telefono && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                {sale.cliente.telefono}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#1C1C26" }}>
                          {saleService.formatDate(sale.fecha)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {new Date(sale.fecha).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <AttachMoney
                            sx={{ fontSize: 16, color: "#16a34a" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#16a34a" }}
                          >
                            {saleService.formatPrice(sale.total)}
                          </Typography>
                        </Box>
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
                            <Chip
                              label={saleStatusInfo.text}
                              size="small"
                              color={saleStatusInfo.color}
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "#f3f4f6",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  progress === 100
                                    ? "#16a34a"
                                    : progress === 0
                                    ? "#ef4444"
                                    : "#f59e0b",
                              },
                            }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={paymentStatusInfo.text}
                          size="small"
                          color={paymentStatusInfo.color}
                          variant={
                            sale.estado_pago === "Pagado"
                              ? "outlined"
                              : "filled"
                          }
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#1C1C26" }}>
                          {sale.metodoPago?.nombre || "Sin método"}
                        </Typography>
                        {sale.referencia_pago && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#6b7280" }}
                          >
                            Ref: {sale.referencia_pago}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Ver Detalle */}
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewSale(sale)}
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
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          {/* Editar */}
                          {canEdit && (
                            <Tooltip title="Editar venta">
                              <IconButton
                                size="small"
                                onClick={() => handleEditSale(sale)}
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
                          )}

                          {/* Eliminar */}
                          {canEdit && (
                            <Tooltip title="Eliminar venta">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSaleToDelete(sale);
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
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Empty state */}
          {sales.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <ShoppingCart sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm ||
                selectedCustomer !== "all" ||
                selectedSaleStatus !== "all" ||
                selectedPaymentStatus !== "all" ||
                selectedPaymentMethod !== "all" ||
                dateFrom ||
                dateTo
                  ? "No se encontraron ventas"
                  : "No hay ventas registradas"}
              </Typography>
              <Typography variant="body2">
                {searchTerm ||
                selectedCustomer !== "all" ||
                selectedSaleStatus !== "all" ||
                selectedPaymentStatus !== "all" ||
                selectedPaymentMethod !== "all" ||
                dateFrom ||
                dateTo
                  ? "Intenta con otros filtros de búsqueda"
                  : "Comienza registrando tu primera venta"}
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
          setSaleToDelete(null);
        }}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          ⚠️ Eliminar Venta Permanentemente
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas{" "}
            <strong>eliminar permanentemente</strong> la venta{" "}
            <strong>{saleToDelete?.numero_venta}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> La venta será
              eliminada completamente y el stock de los productos será
              restaurado.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setSaleToDelete(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteSale}
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

      {/* Modal de Detalle de Venta */}
      <SaleDetail
        open={showSaleDetail}
        sale={selectedSale}
        onClose={handleCloseDetail}
        onEdit={() => {
          handleCloseDetail();
          handleEditSale(selectedSale);
        }}
      />
    </Box>
  );
};

export default SalesList;
