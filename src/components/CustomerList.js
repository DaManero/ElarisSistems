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
  Visibility,
  Person,
  FilterList,
  Phone,
  LocationOn,
  Email,
  ToggleOff,
  ToggleOn,
} from "@mui/icons-material";
import { customerService } from "../services/customerService";
import CustomerForm from "./CustomerForm";
import CustomerDetail from "./CustomerDetail";

const CustomerList = () => {
  // Estados principales
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const itemsPerPage = 20;

  // Estados para modales
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Estados para modal de eliminación
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Función para cargar clientes
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = customerService.buildSearchParams({
        search: searchTerm,
        status: selectedStatus,
        tipo_cliente: selectedType,
        provincia: selectedProvince,
        page: currentPage,
        limit: itemsPerPage,
      });

      const response = await customerService.getCustomers(params);

      if (response.data.customers) {
        // Respuesta con paginación
        setCustomers(response.data.customers);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCustomers(response.data.pagination.total);
      } else {
        // Respuesta directa
        setCustomers(response.data || []);
      }

      setError("");
    } catch (error) {
      setError(error.message || "Error loading customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedType, selectedProvince, currentPage]);

  // Función para cargar provincias
  const loadProvinces = useCallback(async () => {
    try {
      const response = await customerService.getProvinces();
      setProvinces(response.data || []);
    } catch (error) {
      console.error("Error loading provinces:", error);
    }
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  // Efecto para búsqueda y filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset página al filtrar
      loadCustomers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus, selectedType, selectedProvince]);

  // Efecto para cambios de página
  useEffect(() => {
    if (currentPage > 1) {
      loadCustomers();
    }
  }, [currentPage, loadCustomers]);

  console.log("📊 Estado actual:", { customers, loading, error });

  // Funciones para manejar modales
  const handleCreateCustomer = () => {
    setCustomerToEdit(null);
    setShowCustomerForm(true);
  };

  const handleEditCustomer = (customer) => {
    setCustomerToEdit(customer);
    setShowCustomerForm(true);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const handleCloseForm = () => {
    setShowCustomerForm(false);
    setCustomerToEdit(null);
  };

  const handleCloseDetail = () => {
    setShowCustomerDetail(false);
    setSelectedCustomer(null);
  };

  const handleFormSuccess = () => {
    loadCustomers();
    setShowCustomerForm(false);
    setCustomerToEdit(null);
  };

  // Función para cambiar estado del cliente
  const handleToggleStatus = async (customer) => {
    try {
      await customerService.toggleCustomerStatus(customer.id);
      await loadCustomers();
    } catch (error) {
      setError(error.message || "Error updating customer status");
    }
  };

  // Función para eliminar cliente
  const handleDeleteCustomer = async () => {
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      await loadCustomers();
      setDeleteDialog(false);
      setCustomerToDelete(null);
    } catch (error) {
      setError(error.message || "Error deleting customer");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedType("all");
    setSelectedProvince("all");
    setCurrentPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && customers.length === 0) {
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
            Gestión de Clientes
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {totalCustomers > 0 && `${totalCustomers} clientes registrados`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCustomer}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nuevo Cliente
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
                placeholder="Buscar por nombre, teléfono, email..."
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
            <Grid size={{ xs: 12, md: 2 }}>
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

            {/* Filtro por Tipo */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={selectedType}
                  label="Tipo"
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Nuevo">Nuevo</MenuItem>
                  <MenuItem value="Recurrente">Recurrente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Provincia */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Provincia</InputLabel>
                <Select
                  value={selectedProvince}
                  label="Provincia"
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
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

      {/* Customers Table */}
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
                    Cliente
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Contacto
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Ubicación
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Tipo
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
                {customers.map((customer) => {
                  const typeInfo = customerService.getCustomerTypeInfo(
                    customer.tipo_cliente
                  );
                  const fullName = customerService.getFullName(customer);

                  return (
                    <TableRow
                      key={customer.id}
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
                            <Person sx={{ color: "#1C1C26", fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#1C1C26" }}
                            >
                              {fullName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280" }}
                            >
                              ID #{customer.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            <Phone sx={{ fontSize: 14, color: "#6b7280" }} />
                            <Typography
                              variant="body2"
                              sx={{ color: "#1C1C26" }}
                            >
                              {customerService.formatPhoneNumber(
                                customer.telefono
                              )}
                            </Typography>
                          </Box>
                          {customer.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Email sx={{ fontSize: 14, color: "#6b7280" }} />
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                {customer.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationOn sx={{ fontSize: 14, color: "#6b7280" }} />
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "#1C1C26" }}
                            >
                              {customer.localidad}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280" }}
                            >
                              {customer.provincia}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={typeInfo.text}
                          size="small"
                          color={typeInfo.color}
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={customer.status ? "Activo" : "Inactivo"}
                          size="small"
                          color={customer.status ? "success" : "default"}
                          variant={customer.status ? "outlined" : "filled"}
                          sx={{ fontSize: "0.7rem" }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Ver Detalle */}
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewCustomer(customer)}
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
                          <Tooltip title="Editar cliente">
                            <IconButton
                              size="small"
                              onClick={() => handleEditCustomer(customer)}
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
                            title={customer.status ? "Desactivar" : "Activar"}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(customer)}
                              sx={{
                                color: "#6B7280",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                "&:hover": {
                                  backgroundColor: customer.status
                                    ? "#F59E0B"
                                    : "#10B981",
                                  borderColor: customer.status
                                    ? "#F59E0B"
                                    : "#10B981",
                                  color: "#FFFFFF",
                                },
                              }}
                            >
                              {customer.status ? (
                                <ToggleOn sx={{ fontSize: 16 }} />
                              ) : (
                                <ToggleOff sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Tooltip>

                          {/* Eliminar */}
                          <Tooltip title="Eliminar cliente">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCustomerToDelete(customer);
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
          {customers.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Person sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm ||
                selectedStatus !== "all" ||
                selectedType !== "all" ||
                selectedProvince !== "all"
                  ? "No se encontraron clientes"
                  : "No hay clientes registrados"}
              </Typography>
              <Typography variant="body2">
                {searchTerm ||
                selectedStatus !== "all" ||
                selectedType !== "all" ||
                selectedProvince !== "all"
                  ? "Intenta con otros filtros de búsqueda"
                  : "Comienza registrando tu primer cliente"}
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
          setCustomerToDelete(null);
        }}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          ⚠️ Eliminar Cliente Permanentemente
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas{" "}
            <strong>eliminar permanentemente</strong> al cliente{" "}
            <strong>{customerService.getFullName(customerToDelete)}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> El cliente será
              eliminado completamente de la base de datos junto con su
              historial.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setCustomerToDelete(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteCustomer}
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

      {/* Modal del Formulario de Cliente */}
      <CustomerForm
        open={showCustomerForm}
        customerData={customerToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de Detalle del Cliente */}
      <CustomerDetail
        open={showCustomerDetail}
        customer={selectedCustomer}
        onClose={handleCloseDetail}
        onEdit={() => {
          handleCloseDetail();
          handleEditCustomer(selectedCustomer);
        }}
      />
    </Box>
  );
};

export default CustomerList;
