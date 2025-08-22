import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Save,
  Add,
  Inventory,
  PhotoCamera,
  AttachMoney,
  Category,
  Business,
  Straighten,
} from "@mui/icons-material";
import { productService } from "../services/productService";
import { measureService } from "../services/measureService";

const ProductForm = ({
  open = true,
  productData = null,
  onClose,
  onSuccess,
  categories = [],
  providers = [],
}) => {
  const isEditMode = productData && productData.id;

  const [formData, setFormData] = useState({
    fragancia: "",
    caracteristicas: "",
    imagen_url: "",
    categoria_id: "",
    medida_id: "",
    proveedor_id: "",
    stock: 0,
    stock_minimo: 5,
    precio_venta: "",
    status: true,
  });

  const [measures, setMeasures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    loadMeasures();
  }, []);

  useEffect(() => {
    if (isEditMode && productData) {
      setFormData({
        fragancia: productData.fragancia || "",
        caracteristicas: productData.caracteristicas || "",
        imagen_url: productData.imagen_url || "",
        categoria_id: productData.categoria_id || "",
        medida_id: productData.medida_id || "",
        proveedor_id: productData.proveedor_id || "",
        stock: productData.stock || 0,
        stock_minimo: productData.stock_minimo || 5,
        precio_venta: productData.precio_venta || "",
        status: productData.status !== undefined ? productData.status : true,
      });
      setImagePreview(productData.imagen_url || "");
    } else {
      setFormData({
        fragancia: "",
        caracteristicas: "",
        imagen_url: "",
        categoria_id: "",
        medida_id: "",
        proveedor_id: "",
        stock: 0,
        stock_minimo: 5,
        precio_venta: "",
        status: true,
      });
      setImagePreview("");
    }
  }, [productData, isEditMode, open]);

  const loadMeasures = async () => {
    try {
      const response = await measureService.getActiveMeasures();
      setMeasures(response.data || []);
    } catch (error) {
      console.error("Error loading measures:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Preview de imagen_url
    if (name === "imagen_url" && value) {
      if (productService.isValidImageUrl(value)) {
        setImagePreview(value);
      } else {
        setImagePreview("");
      }
    }

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 LOGS DEL FRONTEND
    console.log("🎯 FRONTEND - Datos que se van a enviar:");
    console.log("formData completo:", formData);
    console.log("Campo imagen específicamente:", formData.imagen);
    console.log("Campo imagen_url específicamente:", formData.imagen_url);

    // Validar formulario
    const validation = productService.validateProductData(formData);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      if (isEditMode) {
        console.log("🔄 ENVIANDO AL BACKEND:", formData);
        response = await productService.updateProduct(productData.id, formData);
        setSuccess("Producto actualizado exitosamente");
      } else {
        response = await productService.createProduct(formData);
        setSuccess("Producto creado exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      setError(
        error.message ||
          `Error ${isEditMode ? "actualizando" : "creando"} producto`
      );
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (!loading && onClose) {
      setError("");
      setSuccess("");
      setImagePreview("");
      onClose();
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      fontSize: "14px",
      "& fieldset": {
        borderColor: "#e5e7eb",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "#d1d5db",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1C1C26",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "14px",
      color: "#6b7280",
      "&.Mui-focused": {
        color: "#1C1C26",
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          backgroundColor: "#ffffff",
          border: "none",
          maxHeight: "90vh",
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
            {isEditMode ? (
              <Save sx={{ color: "#1C1C26", fontSize: 20 }} />
            ) : (
              <Inventory sx={{ color: "#1C1C26", fontSize: 20 }} />
            )}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: "#111827",
              fontWeight: 600,
              fontSize: "18px",
            }}
          >
            {isEditMode ? "Editar Producto" : "Nuevo Producto"}
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={loading}
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

      <Divider sx={{ borderColor: "#f3f4f6" }} />

      {/* Content */}
      <DialogContent sx={{ p: 4, pt: 3 }}>
        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "12px",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: "12px",
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #bbf7d0",
            }}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                Información Básica
              </Typography>
            </Grid>

            {/* Fragancia */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de la Fragancia"
                name="fragancia"
                value={formData.fragancia}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Black Opium, Sauvage Dior..."
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Precio */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Venta"
                name="precio_venta"
                type="number"
                value={formData.precio_venta}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="85000"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Precio en pesos argentinos"
              />
            </Grid>

            {/* Categoría */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoria_id"
                  value={formData.categoria_id}
                  label="Categoría"
                  onChange={handleChange}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <Category
                        sx={{ color: "#6b7280", fontSize: 20, mr: 1 }}
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Sin categoría</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Medida */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel>Medida</InputLabel>
                <Select
                  name="medida_id"
                  value={formData.medida_id}
                  label="Medida"
                  onChange={handleChange}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <Straighten
                        sx={{ color: "#6b7280", fontSize: 20, mr: 1 }}
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Sin medida</MenuItem>
                  {measures.map((measure) => (
                    <MenuItem key={measure.id} value={measure.id}>
                      {measure.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Proveedor */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel>Proveedor</InputLabel>
                <Select
                  name="proveedor_id"
                  value={formData.proveedor_id}
                  label="Proveedor"
                  onChange={handleChange}
                  disabled={loading}
                  startAdornment={
                    <InputAdornment position="start">
                      <Business
                        sx={{ color: "#6b7280", fontSize: 20, mr: 1 }}
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Sin proveedor</MenuItem>
                  {providers.map((provider) => (
                    <MenuItem key={provider.id} value={provider.id}>
                      {provider.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Stock */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock Actual"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="25"
                sx={inputStyles}
                helperText="Cantidad disponible en inventario"
              />
            </Grid>

            {/* Stock Mínimo */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stock_minimo"
                type="number"
                value={formData.stock_minimo}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="5"
                sx={inputStyles}
                helperText="Nivel de alerta para reposición"
              />
            </Grid>

            {/* imagen_url */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                imagen del Producto
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="URL de la imagen_url"
                name="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="https://images.unsplash.com/photo-..."
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhotoCamera sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="URL de la imagen del producto (opcional)"
              />
            </Grid>

            {/* Preview de imagen_url */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 120,
                  border: "2px dashed #e5e7eb",
                  borderRadius: "12px",
                  backgroundColor: "#f9fafb",
                }}
              >
                {imagePreview ? (
                  <Avatar
                    src={imagePreview}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "12px",
                    }}
                    variant="rounded"
                  >
                    <Inventory />
                  </Avatar>
                ) : (
                  <Box sx={{ textAlign: "center", color: "#6b7280" }}>
                    <PhotoCamera sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="caption">Vista previa</Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Características */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                Descripción y Características
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Características del Producto"
                name="caracteristicas"
                value={formData.caracteristicas}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Descripción detallada del producto, notas olfativas, duración, ocasiones de uso..."
                sx={inputStyles}
                helperText="Descripción completa del producto (opcional, máximo 5000 caracteres)"
              />
            </Grid>

            {/* Status Toggle */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#111827",
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                  >
                    Estado del Producto:
                  </Typography>

                  <Box
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "status",
                          type: "checkbox",
                          checked: !formData.status,
                        },
                      })
                    }
                    sx={{
                      width: 60,
                      height: 28,
                      borderRadius: "14px",
                      backgroundColor: formData.status ? "#16a34a" : "#1C1C26",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: formData.status
                          ? "#15803d"
                          : "#0D0D0D",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "12px",
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: 2,
                        left: formData.status ? 34 : 2,
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px 0 rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: formData.status ? "#16a34a" : "#6b7280",
                      fontSize: "14px",
                      fontWeight: 500,
                      minWidth: 60,
                    }}
                  >
                    {formData.status ? "Activo" : "Inactivo"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Actions */}
      <Box
        sx={{
          p: 4,
          pt: 2,
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
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
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isEditMode ? (
              <Save fontSize="small" />
            ) : (
              <Add fontSize="small" />
            )
          }
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            px: 4,
            py: 1.5,
            fontSize: "14px",
            fontWeight: 500,
            backgroundColor: "#1C1C26",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            "&:hover": {
              backgroundColor: "#0D0D0D",
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            },
            "&:disabled": {
              backgroundColor: "#BEBFBD",
            },
          }}
        >
          {loading
            ? isEditMode
              ? "Guardando..."
              : "Creando..."
            : isEditMode
            ? "Guardar Cambios"
            : "Crear Producto"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ProductForm;
