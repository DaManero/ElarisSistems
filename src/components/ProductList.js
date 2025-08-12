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
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Warning,
  Inventory,
  FilterList,
  TrendingDown,
} from "@mui/icons-material";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { providerService } from "../services/providerService";
import ProductForm from "./ProductForm";
import ProductDetail from "./ProductDetail";

const ProductList = () => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [showLowStock, setShowLowStock] = useState(false);

  // Estados para modales
  const [showProductForm, setShowProductForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados para modal de eliminación
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Función para cargar productos - useCallback para evitar re-creación
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = productService.buildSearchParams({
        search: searchTerm,
        categoria_id: selectedCategory,
        proveedor_id: selectedProvider,
        low_stock: showLowStock,
        order_by: "id",
        order_direction: "ASC",
      });

      const response = await productService.getProducts(params);
      setProducts(response.data.products || response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error loading products");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedProvider, showLowStock]);

  // Función para cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      // Cargar categorías y proveedores para filtros
      const [categoriesResponse, providersResponse] = await Promise.all([
        categoryService.getActiveCategories(),
        providerService.getActiveProviders(),
      ]);

      setCategories(categoriesResponse.data || []);
      setProviders(providersResponse.data || []);

      // Cargar productos
      await loadProducts();
    } catch (error) {
      setError("Error cargando datos iniciales");
    }
  }, [loadProducts]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Efecto para búsqueda y filtros en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Funciones para manejar modales
  const handleCreateProduct = () => {
    setProductToEdit(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setProductToEdit(null);
  };

  const handleCloseDetail = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleFormSuccess = () => {
    loadProducts();
    setShowProductForm(false);
    setProductToEdit(null);
  };

  // Función para eliminar producto (hard delete)
  const handleDeleteProduct = async () => {
    try {
      await productService.deleteProduct(productToDelete.id);
      await loadProducts();
      setDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      setError(error.message || "Error deleting product");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedProvider("all");
    setShowLowStock(false);
  };

  if (loading && products.length === 0) {
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
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateProduct}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar productos..."
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

            {/* Filtro por Categoría */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filtro por Proveedor */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  value={selectedProvider}
                  label="Proveedor"
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Stock Bajo */}
            <Grid item xs={12} md={2}>
              <Button
                variant={showLowStock ? "contained" : "outlined"}
                startIcon={<TrendingDown />}
                onClick={() => setShowLowStock(!showLowStock)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  width: "100%",
                  color: showLowStock ? "#fff" : "#ff9800",
                  borderColor: "#ff9800",
                  backgroundColor: showLowStock ? "#ff9800" : "transparent",
                  "&:hover": {
                    backgroundColor: "#ff9800",
                    color: "#fff",
                  },
                }}
              >
                Stock Bajo
              </Button>
            </Grid>

            {/* Limpiar Filtros */}
            <Grid item xs={12} md={2}>
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

      {/* Products Table */}
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
                    Fragancia
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Categoría
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Medida
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Stock
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Precio
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
                {products.map((product) => {
                  const stockStatus = productService.getStockStatus(product);
                  return (
                    <TableRow
                      key={product.id}
                      sx={{
                        bgcolor: "#FDFDFD",
                        "&:hover": { bgcolor: "#F8F9FA" },
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
                          #{product.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={product.imagen}
                            sx={{ width: 32, height: 32 }}
                            variant="rounded"
                          >
                            <Inventory />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#1C1C26" }}
                            >
                              {product.fragancia}
                            </Typography>
                            {!product.status && (
                              <Chip
                                label="Inactivo"
                                size="small"
                                color="default"
                                sx={{ fontSize: "0.7rem", height: 16 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#1C1C26" }}>
                          {product.categoria?.nombre || "Sin categoría"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#1C1C26" }}>
                          {product.medida?.nombre || "Sin medida"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={`${product.stock} unidades`}
                            size="small"
                            color={stockStatus.color}
                            variant={
                              stockStatus.status === "sin_stock"
                                ? "filled"
                                : "outlined"
                            }
                            icon={
                              stockStatus.status === "stock_bajo" ? (
                                <Warning />
                              ) : undefined
                            }
                          />
                          {stockStatus.status !== "stock_normal" && (
                            <Tooltip title={stockStatus.text}>
                              <Warning
                                sx={{
                                  fontSize: 16,
                                  color:
                                    stockStatus.color === "error"
                                      ? "#f44336"
                                      : "#ff9800",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#1C1C26" }}
                        >
                          {productService.formatPrice(product.precio_venta)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Ver Detalle */}
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => handleViewProduct(product)}
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
                          <Tooltip title="Editar producto">
                            <IconButton
                              size="small"
                              onClick={() => handleEditProduct(product)}
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

                          {/* Eliminar */}
                          <Tooltip title="Eliminar producto">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setProductToDelete(product);
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
          {products.length === 0 && !loading && (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#6A736A",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedProvider !== "all" ||
                showLowStock
                  ? "No se encontraron productos"
                  : "No hay productos registrados"}
              </Typography>
              <Typography variant="body2">
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedProvider !== "all" ||
                showLowStock
                  ? "Intenta con otros filtros de búsqueda"
                  : "Comienza registrando tu primer producto"}
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
          setProductToDelete(null);
        }}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "#dc2626" }}>
          ⚠️ Eliminar Producto Permanentemente
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas{" "}
            <strong>eliminar permanentemente</strong> el producto{" "}
            <strong>{productToDelete?.fragancia}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Esta acción NO se puede deshacer.</strong> El producto
              será eliminado completamente de la base de datos.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setProductToDelete(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProduct}
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

      {/* Modal del Formulario de Producto */}
      <ProductForm
        open={showProductForm}
        productData={productToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        categories={categories}
        providers={providers}
      />

      {/* Modal de Detalle del Producto */}
      <ProductDetail
        open={showProductDetail}
        product={selectedProduct}
        onClose={handleCloseDetail}
        onEdit={() => {
          handleCloseDetail();
          handleEditProduct(selectedProduct);
        }}
      />
    </Box>
  );
};

export default ProductList;
