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
import { categoryService } from "../services/categoryService";
import CategoryForm from "./CategoryForm";

const CategoryList = () => {
  // Estados principales
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modal de formulario
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Estados para modal de eliminación
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await categoryService.getCategories(params);
      setCategories(response.data.categories || response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error loading categories");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar el modal del formulario
  const handleCreateCategory = () => {
    setCategoryToEdit(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category) => {
    setCategoryToEdit(category);
    setShowCategoryForm(true);
  };

  const handleCloseForm = () => {
    setShowCategoryForm(false);
    setCategoryToEdit(null);
  };

  const handleFormSuccess = () => {
    loadCategories();
    setShowCategoryForm(false);
    setCategoryToEdit(null);
  };

  // Función para cambiar estado de la categoría (toggle)
  const handleToggleStatus = async (category) => {
    try {
      await categoryService.toggleCategoryStatus(category.id);
      await loadCategories();
    } catch (error) {
      setError(error.message || "Error updating category status");
    }
  };

  // Función para eliminar categoría (hard delete)
  const handleDeleteCategory = async () => {
    try {
      await categoryService.deleteCategory(selectedCategory.id);
      await loadCategories();
      setDeleteDialog(false);
      setSelectedCategory(null);
    } catch (error) {
      setError(error.message || "Error deleting category");
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

  if (loading && categories.length === 0) {
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
          Gestión de Categorías
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCategory}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nueva Categoría
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar categorías..."
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

      {/* Categories Table */}
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
                {categories.map((category) => (
                  <TableRow
                    key={category.id}
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
                        #{category.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#1C1C26" }}
                      >
                        {category.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Toggle Switch */}
                        <Box
                          onClick={() => handleToggleStatus(category)}
                          sx={{
                            width: 48,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: category.status
                              ? "#16a34a"
                              : "#1C1C26",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: category.status
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
                              left: category.status ? 26 : 2,
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                              color: category.status ? "#16a34a" : "#6b7280",
                            }}
                          >
                            {category.status ? "✓" : "✕"}
                          </Box>
                        </Box>

                        {/* Status Text */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: category.status ? "#16a34a" : "#6b7280",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            minWidth: 60,
                          }}
                        >
                          {category.status ? "Activa" : "Inactiva"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Botón Editar */}
                        <Box
                          onClick={() => handleEditCategory(category)}
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
                            setSelectedCategory(category);
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
          {categories.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm
                  ? "No se encontraron categorías"
                  : "No hay categorías"}
              </Typography>
              <Typography variant="body2">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza creando tu primera categoría"}
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
          setSelectedCategory(null);
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
            <strong>eliminar permanentemente</strong> la categoría{" "}
            <strong>{selectedCategory?.nombre}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> La categoría
              será eliminada completamente de la base de datos.
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, color: "#6A736A" }}>
            💡 <strong>Sugerencia:</strong> Si solo quieres desactivar
            temporalmente la categoría, usa el interruptor en la columna
            "Estado".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setSelectedCategory(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteCategory}
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

      {/* Modal del Formulario de Categoría */}
      <CategoryForm
        open={showCategoryForm}
        categoryData={categoryToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default CategoryList;
