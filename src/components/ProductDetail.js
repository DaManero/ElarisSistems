import React from "react";
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
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close,
  Edit,
  Inventory,
  Category,
  Business,
  Straighten,
  AttachMoney,
  Warning,
  CheckCircle,
  Info,
  ImageNotSupported,
} from "@mui/icons-material";
import { productService } from "../services/productService";
import RobustImage from "./RobustImage";

const ProductDetail = ({ open, product, onClose, onEdit }) => {
  if (!product) return null;

  const stockStatus = productService.getStockStatus(product);
  const formattedPrice = productService.formatPrice(product.precio_venta);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
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
            <Inventory sx={{ color: "#1C1C26", fontSize: 20 }} />
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
              Detalle del Producto
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              ID #{product.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Editar producto">
            <IconButton
              onClick={handleEdit}
              sx={{
                color: "#6b7280",
                backgroundColor: "#f3f4f6",
                "&:hover": {
                  backgroundColor: "#10B981",
                  color: "#ffffff",
                },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={handleClose}
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
        <Grid container spacing={3}>
          {/* Imagen del Producto */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8fafc",
                }}
              >
                {product.imagen ? (
                  <RobustImage
                    src={product.imagen}
                    alt={product.fragancia}
                    style={{
                      width: "100%",
                      height: "280px",
                      objectFit: "cover",
                    }}
                    fallbackSrc="https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  />
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    <Inventory sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="body2">Sin imagen</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Información Principal */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#111827",
                    fontWeight: 600,
                  }}
                >
                  {product.fragancia}
                </Typography>
                <Chip
                  label={product.status ? "Activo" : "Inactivo"}
                  color={product.status ? "success" : "default"}
                  size="small"
                />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: "#16a34a",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                {formattedPrice}
              </Typography>

              {/* Estado del Stock */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Chip
                  icon={
                    stockStatus.status === "sin_stock" ? (
                      <Warning />
                    ) : stockStatus.status === "stock_bajo" ? (
                      <Warning />
                    ) : (
                      <CheckCircle />
                    )
                  }
                  label={`${product.stock} unidades - ${stockStatus.text}`}
                  color={stockStatus.color}
                  variant={
                    stockStatus.status === "sin_stock" ? "filled" : "outlined"
                  }
                />
                {product.stock_minimo && (
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    (Mínimo: {product.stock_minimo})
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Información Detallada */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Category sx={{ fontSize: 16, color: "#6b7280" }} />
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Categoría
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.categoria?.nombre || "Sin categoría"}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Straighten sx={{ fontSize: 16, color: "#6b7280" }} />
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Medida
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.medida?.nombre || "Sin medida"}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Business sx={{ fontSize: 16, color: "#6b7280" }} />
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Proveedor
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.proveedor?.nombre || "Sin proveedor"}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Características */}
          {product.caracteristicas && (
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #f1f5f9",
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Info sx={{ fontSize: 20, color: "#1C1C26" }} />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#1C1C26",
                        fontWeight: 500,
                      }}
                    >
                      Características del Producto
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#374151",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {product.caracteristicas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información Adicional */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1C1C26",
                    fontWeight: 500,
                    mb: 2,
                  }}
                >
                  Información del Sistema
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(product.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Última Actualización
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(product.updatedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Stock Actual
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.stock} unidades
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Stock Mínimo
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.stock_minimo} unidades
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 4, pt: 2 }}>
        <Button
          onClick={handleClose}
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

        <Button
          onClick={handleEdit}
          variant="contained"
          startIcon={<Edit fontSize="small" />}
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
          }}
        >
          Editar Producto
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetail;
