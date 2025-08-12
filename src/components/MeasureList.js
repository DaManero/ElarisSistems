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
import { Add, Search, Edit, Delete } from "@mui/icons-material";
import { measureService } from "../services/measureService";
import MeasureForm from "./MeasureForm";

const MeasureList = () => {
  // Estados principales
  const [measures, setMeasures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modal de formulario
  const [showMeasureForm, setShowMeasureForm] = useState(false);
  const [measureToEdit, setMeasureToEdit] = useState(null);

  // Estados para modal de eliminación
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadMeasures();
  }, []);

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMeasures();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMeasures = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await measureService.getMeasures(params);
      setMeasures(response.data.measures || response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error loading measures");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar el modal del formulario
  const handleCreateMeasure = () => {
    setMeasureToEdit(null);
    setShowMeasureForm(true);
  };

  const handleEditMeasure = (measure) => {
    setMeasureToEdit(measure);
    setShowMeasureForm(true);
  };

  const handleCloseForm = () => {
    setShowMeasureForm(false);
    setMeasureToEdit(null);
  };

  const handleFormSuccess = () => {
    loadMeasures();
    setShowMeasureForm(false);
    setMeasureToEdit(null);
  };

  // Función para cambiar estado de la medida (toggle)
  const handleToggleStatus = async (measure) => {
    try {
      await measureService.toggleMeasureStatus(measure.id);
      await loadMeasures();
    } catch (error) {
      setError(error.message || "Error updating measure status");
    }
  };

  // Función para eliminar medida (hard delete)
  const handleDeleteMeasure = async () => {
    try {
      await measureService.deleteMeasure(selectedMeasure.id);
      await loadMeasures();
      setDeleteDialog(false);
      setSelectedMeasure(null);
    } catch (error) {
      setError(error.message || "Error deleting measure");
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

  if (loading && measures.length === 0) {
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
          Gestión de Unidades de Medida
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateMeasure}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nueva Medida
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar unidades de medida..."
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

      {/* Measures Table */}
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
                    Nombre
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
                {measures.map((measure) => (
                  <TableRow
                    key={measure.id}
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
                        #{measure.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#1C1C26" }}
                      >
                        {measure.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Toggle Switch */}
                        <Box
                          onClick={() => handleToggleStatus(measure)}
                          sx={{
                            width: 48,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: measure.status
                              ? "#16a34a"
                              : "#1C1C26",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: measure.status
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
                              left: measure.status ? 26 : 2,
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                              color: measure.status ? "#16a34a" : "#6b7280",
                            }}
                          >
                            {measure.status ? "✓" : "✕"}
                          </Box>
                        </Box>

                        {/* Status Text */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: measure.status ? "#16a34a" : "#6b7280",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            minWidth: 60,
                          }}
                        >
                          {measure.status ? "Activa" : "Inactiva"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Botón Editar */}
                        <Box
                          onClick={() => handleEditMeasure(measure)}
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
                            setSelectedMeasure(measure);
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
          {measures.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm
                  ? "No se encontraron medidas"
                  : "No hay unidades de medida"}
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza creando tu primera unidad de medida"}
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
          setSelectedMeasure(null);
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
            <strong>eliminar permanentemente</strong> la unidad de medida{" "}
            <strong>{selectedMeasure?.nombre}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> La unidad de
              medida será eliminada completamente de la base de datos.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, color: "#6A736A" }}>
            💡 <strong>Sugerencia:</strong> Si solo quieres desactivar
            temporalmente la unidad de medida, usa el interruptor en la columna
            "Estado".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setSelectedMeasure(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteMeasure}
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

      {/* Modal del Formulario de Medida */}
      <MeasureForm
        open={showMeasureForm}
        measureData={measureToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default MeasureList;
