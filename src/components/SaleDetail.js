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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  Edit,
  Receipt,
  Person,
  AttachMoney,
  Payment,
  LocalShipping,
  CalendarToday,
  ShoppingCart,
  Inventory,
  Info,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { saleService } from "../services/salesService";

const SaleDetail = ({ open, sale, onClose, onEdit }) => {
  const navigate = useNavigate();

  if (!sale) return null;

  // 🔍 DEBUG LOGS - Agregar logs para debuggear
  console.log("🔍 DEBUG - Sale completa:", sale);
  console.log("🔍 DEBUG - Items de la venta:", sale.items);
  if (sale.items && sale.items.length > 0) {
    console.log("🔍 DEBUG - Primer item:", sale.items[0]);
    console.log("🔍 DEBUG - Producto del primer item:", sale.items[0].producto);
  }

  const saleStatusInfo = saleService.getSaleStatusInfo(sale.estado_venta);
  const paymentStatusInfo = saleService.getPaymentStatusInfo(sale.estado_pago);
  const customerName = saleService.getCustomerFullName(sale.cliente);
  const vendorName = saleService.getUserFullName(sale.usuario);
  const totalItems = saleService.calculateTotalItems(sale.items);
  const canEdit = saleService.canSaleBeEdited(sale);
  const progress = saleService.getSaleProgress(sale);

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleEdit = () => {
    if (onClose) onClose();
    navigate(`/dashboard/sales/edit/${sale.id}`);
  };

  // 🔧 FUNCIÓN MEJORADA para obtener el nombre del producto
  const getProductName = (item) => {
    console.log("🔍 DEBUG getProductName - item completo:", item);

    if (!item) {
      console.warn("⚠️ Item es null o undefined");
      return "Producto desconocido";
    }

    // Intentar diferentes estructuras de datos
    let nombre = null;

    // Opción 1: item.producto.fragancia o item.producto.nombre
    if (item.producto && typeof item.producto === "object") {
      console.log("🔍 DEBUG - Producto object:", item.producto);
      nombre = item.producto.fragancia || item.producto.nombre;

      if (nombre) {
        console.log("✅ Nombre encontrado en producto:", nombre);
        return nombre;
      }
    }

    // Opción 2: Directamente en el item
    nombre = item.fragancia || item.nombre;
    if (nombre) {
      console.log("✅ Nombre encontrado directamente en item:", nombre);
      return nombre;
    }

    // Opción 3: producto_nombre (campo calculado del backend)
    if (item.producto_nombre) {
      console.log(
        "✅ Nombre encontrado en producto_nombre:",
        item.producto_nombre
      );
      return item.producto_nombre;
    }

    // Opción 4: Si tenemos producto_id
    if (item.producto_id) {
      console.warn("⚠️ Solo tenemos producto_id:", item.producto_id);
      return `Producto ID: ${item.producto_id}`;
    }

    // Caso extremo
    console.warn("❌ No se encontró nombre del producto, item:", item);
    return "Producto desconocido";
  };

  // Función mejorada para obtener la marca del producto
  const getProductBrand = (item) => {
    if (!item) return "";

    // Intentar diferentes estructuras
    if (item.producto && item.producto.marca) {
      return item.producto.marca;
    }

    if (item.marca) {
      return item.marca;
    }

    return "";
  };

  // Función mejorada para obtener la presentación del producto
  const getProductPresentation = (item) => {
    if (!item) return "";

    // Intentar diferentes estructuras
    if (item.producto && item.producto.presentacion) {
      return item.producto.presentacion;
    }

    if (item.presentacion) {
      return item.presentacion;
    }

    return "";
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
            <Receipt sx={{ color: "#1C1C26", fontSize: 20 }} />
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
              Detalle de Venta
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              {sale.numero_venta}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <Tooltip title="Editar venta">
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
          )}

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
          {/* Información Principal de la Venta */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1C1C26",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Información de la Venta
                </Typography>

                <Grid container spacing={2}>
                  {/* Cliente */}
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Person sx={{ fontSize: 16, color: "#6b7280" }} />
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Cliente
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {customerName}
                    </Typography>
                    {sale.cliente?.telefono && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Phone sx={{ fontSize: 12, color: "#6b7280" }} />
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {sale.cliente.telefono}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  {/* Vendedor */}
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Person sx={{ fontSize: 16, color: "#6b7280" }} />
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Vendedor
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {vendorName}
                    </Typography>
                  </Grid>

                  {/* Fecha */}
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CalendarToday sx={{ fontSize: 16, color: "#6b7280" }} />
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Fecha de Venta
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {saleService.formatDateTime(sale.fecha)}
                    </Typography>
                  </Grid>

                  {/* Método de Pago */}
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Payment sx={{ fontSize: 16, color: "#6b7280" }} />
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Método de Pago
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {sale.metodoPago?.nombre || "Sin método"}
                    </Typography>
                    {sale.referencia_pago && (
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        Ref: {sale.referencia_pago}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Estados de la Venta */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1C1C26",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Estado de la Venta
                </Typography>

                <Grid container spacing={3}>
                  {/* Estado de Venta */}
                  <Grid item xs={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "#6b7280", mb: 1, display: "block" }}
                      >
                        Estado de Venta
                      </Typography>
                      <Chip
                        label={saleStatusInfo.text}
                        color={saleStatusInfo.color}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#f3f4f6",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            progress === 100
                              ? "#16a34a"
                              : progress === 0
                              ? "#ef4444"
                              : "#f59e0b",
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
                    >
                      Progreso: {progress}%
                    </Typography>
                  </Grid>

                  {/* Estado de Pago */}
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#6b7280", mb: 1, display: "block" }}
                    >
                      Estado de Pago
                    </Typography>
                    <Chip
                      label={paymentStatusInfo.text}
                      color={paymentStatusInfo.color}
                      variant={
                        sale.estado_pago === "Pagado" ? "outlined" : "filled"
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Resumen Financiero */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1C1C26",
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Resumen Financiero
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Subtotal:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {saleService.formatPrice(sale.subtotal)}
                    </Typography>
                  </Box>

                  {sale.descuento_total > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#ef4444" }}>
                        Descuento:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#ef4444" }}>
                        -{saleService.formatPrice(sale.descuento_total)}
                      </Typography>
                    </Box>
                  )}

                  {sale.costo_envio > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Envío:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {saleService.formatPrice(sale.costo_envio)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1, borderColor: "#e5e7eb" }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      Total:
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#16a34a", fontWeight: 700 }}
                    >
                      {saleService.formatPrice(sale.total)}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    borderRadius: "8px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 16, color: "#6b7280" }} />
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    {totalItems} {totalItems === 1 ? "producto" : "productos"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de Productos - CORREGIDA CON DEBUG */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1C1C26",
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Productos de la Venta
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Producto
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Cantidad
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Precio Unit.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Descuento
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Subtotal
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sale.items &&
                        sale.items.map((item, index) => (
                          <TableRow
                            key={item.id || index}
                            sx={{
                              "&:hover": { bgcolor: "#f9fafb" },
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: "#f3f4f6",
                                  }}
                                  variant="rounded"
                                >
                                  <Inventory
                                    sx={{ fontSize: 16, color: "#6b7280" }}
                                  />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500, color: "#1C1C26" }}
                                  >
                                    {getProductName(item)}
                                  </Typography>
                                  {getProductBrand(item) && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#6b7280" }}
                                    >
                                      {getProductBrand(item)}
                                      {getProductPresentation(item) &&
                                        ` - ${getProductPresentation(item)}`}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {item.cantidad}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {saleService.formatPrice(item.precio_unitario)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {item.descuento_porcentaje > 0 ? (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#ef4444", fontWeight: 500 }}
                                  >
                                    {item.descuento_porcentaje}%
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#ef4444" }}
                                  >
                                    -
                                    {saleService.formatPrice(
                                      item.descuento_monto
                                    )}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#6b7280" }}
                                >
                                  Sin descuento
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "#16a34a" }}
                              >
                                {saleService.formatPrice(item.subtotal)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Observaciones */}
          {sale.observaciones && (
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
                      Observaciones
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
                    {sale.observaciones}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Información del Sistema */}
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
                      {saleService.formatDateTime(sale.createdAt || sale.fecha)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Última Actualización
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {saleService.formatDateTime(sale.updatedAt || sale.fecha)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      ID de Venta
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{sale.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Estado Editable
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {canEdit ? "Sí" : "No"}
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

        {canEdit && (
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
            Editar Venta
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SaleDetail;
