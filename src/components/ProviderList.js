import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Email,
  Phone,
  Person,
} from "@mui/icons-material";
import { providerService } from "../services/providerService";
import ProviderForm from "./ProviderForm";

const ProviderList = () => {
  // Estados principales
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modal de formulario
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState(null);

  // Estados para modal de eliminación
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProviders();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await providerService.getProviders(params);
      setProviders(response.data.providers || response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error loading providers");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar el modal del formulario
  const handleCreateProvider = () => {
    setProviderToEdit(null);
    setShowProviderForm(true);
  };

  const handleEditProvider = (provider) => {
    setProviderToEdit(provider);
    setShowProviderForm(true);
  };

  const handleCloseForm = () => {
    setShowProviderForm(false);
    setProviderToEdit(null);
  };

  const handleFormSuccess = () => {
    loadProviders();
    setShowProviderForm(false);
    setProviderToEdit(null);
  };

  // Función para cambiar estado del proveedor (toggle)
  const handleToggleStatus = async (provider) => {
    try {
      await providerService.toggleProviderStatus(provider.id);
      await loadProviders();
    } catch (error) {
      setError(error.message || "Error updating provider status");
    }
  };

  // Función para eliminar proveedor (hard delete)
  const handleDeleteProvider = async () => {
    try {
      await providerService.deleteProvider(selectedProvider.id);
      await loadProviders();
      setDeleteDialog(false);
      setSelectedProvider(null);
    } catch (error) {
      setError(error.message || "Error deleting provider");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && providers.length === 0) {
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
        <Typography variant="h6" sx={{ color: "#1C1C26", fontWeight: 500 }}>
          Gestión de Proveedores
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateProvider}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar proveedores por nombre, email o contacto..."
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
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#FFFFFF",
              "& fieldset": {
                borderColor: "#e5e7eb",
              },
              "&:hover fieldset": {
                borderColor: "#d1d5db",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1C1C26",
              },
            },
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Providers Table */}
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
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Proveedor
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
                {providers.map((provider) => (
                  <TableRow
                    key={provider.id}
                    sx={{
                      bgcolor: "#FDFDFD",
                      "&:hover": {
                        bgcolor: "#F8F9FA",
                      },
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6A736A",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        #{provider.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#1C1C26", mb: 0.5 }}
                        >
                          {provider.nombre}
                        </Typography>
                        {provider.contacto && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Person sx={{ fontSize: 14, color: "#6A736A" }} />
                            <Typography
                              variant="caption"
                              sx={{ color: "#6A736A" }}
                            >
                              {provider.contacto}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {provider.email && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Email sx={{ fontSize: 14, color: "#6A736A" }} />
                            <Typography
                              variant="caption"
                              sx={{ color: "#1C1C26" }}
                            >
                              {provider.email}
                            </Typography>
                          </Box>
                        )}
                        {provider.telefono && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Phone sx={{ fontSize: 14, color: "#6A736A" }} />
                            <Typography
                              variant="caption"
                              sx={{ color: "#1C1C26" }}
                            >
                              {provider.telefono}
                            </Typography>
                          </Box>
                        )}
                        {!provider.email && !provider.telefono && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#6A736A", fontStyle: "italic" }}
                          >
                            Sin información de contacto
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Toggle Switch */}
                        <Box
                          onClick={() => handleToggleStatus(provider)}
                          sx={{
                            width: 48,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: provider.status
                              ? "#16a34a"
                              : "#1C1C26",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: provider.status
                                ? "#15803d"
                                : "#0D0D0D",
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                              position: "absolute",
                              top: 2,
                              left: provider.status ? 26 : 2,
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                              color: provider.status ? "#16a34a" : "#6b7280",
                            }}
                          >
                            {provider.status ? "✓" : "✕"}
                          </Box>
                        </Box>

                        {/* Status Text */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: provider.status ? "#16a34a" : "#6b7280",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            minWidth: 60,
                          }}
                        >
                          {provider.status ? "Activo" : "Inactivo"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Botón Editar */}
                        <Box
                          onClick={() => handleEditProvider(provider)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6B7280",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#3B82F6",
                              borderColor: "#3B82F6",
                              color: "#FFFFFF",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                            },
                          }}
                        >
                          <Edit sx={{ fontSize: 14 }} />
                        </Box>

                        {/* Botón Eliminar */}
                        <Box
                          onClick={() => {
                            setSelectedProvider(provider);
                            setDeleteDialog(true);
                          }}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6B7280",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#EF4444",
                              borderColor: "#EF4444",
                              color: "#FFFFFF",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                            },
                          }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Empty state */}
          {providers.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm
                  ? "No se encontraron proveedores"
                  : "No hay proveedores registrados"}
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza registrando tu primer proveedor"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => {
          setDeleteDialog(false);
          setSelectedProvider(null);
        }}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          ⚠️ Eliminar Permanentemente
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas{" "}
            <strong>eliminar permanentemente</strong> al proveedor{" "}
            <strong>{selectedProvider?.nombre}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> El proveedor
              será eliminado completamente de la base de datos.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, color: "#6A736A" }}>
            💡 <strong>Sugerencia:</strong> Si solo quieres desactivar
            temporalmente el proveedor, usa el interruptor en la columna
            "Estado".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setSelectedProvider(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProvider}
            color="error"
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
            }}
          >
            🗑️ Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal del Formulario de Proveedor */}
      <ProviderForm
        open={showProviderForm}
        providerData={providerToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default ProviderList;
