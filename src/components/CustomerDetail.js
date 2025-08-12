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
  Person,
  Phone,
  Email,
  LocationOn,
  Info,
  History,
} from "@mui/icons-material";
import { customerService } from "../services/customerService";

const CustomerDetail = ({ open, customer, onClose, onEdit }) => {
  if (!customer) return null;

  const fullName = customerService.getFullName(customer);
  const fullAddress = customerService.getFullAddress(customer);
  const typeInfo = customerService.getCustomerTypeInfo(customer.tipo_cliente);
  const formattedPhone = customerService.formatPhoneNumber(customer.telefono);

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
            <Person sx={{ color: "#1C1C26", fontSize: 20 }} />
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
              Detalle del Cliente
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
                fontSize: "12px",
              }}
            >
              ID #{customer.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Editar cliente">
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
          {/* Información Principal */}
          <Grid item xs={12}>
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
                  {fullName}
                </Typography>
                <Chip
                  label={customer.status ? "Activo" : "Inactivo"}
                  color={customer.status ? "success" : "default"}
                  size="small"
                />
                <Chip
                  label={typeInfo.text}
                  color={typeInfo.color}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Grid>

          {/* Información de Contacto */}
          <Grid item xs={12} md={6}>
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
                  <Phone sx={{ fontSize: 20, color: "#1C1C26" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1C1C26",
                      fontWeight: 500,
                    }}
                  >
                    Información de Contacto
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "#6b7280" }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formattedPhone}
                  </Typography>
                </Box>

                {customer.email && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {customer.email}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Información de Dirección */}
          <Grid item xs={12} md={6}>
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
                  <LocationOn sx={{ fontSize: 20, color: "#1C1C26" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1C1C26",
                      fontWeight: 500,
                    }}
                  >
                    Dirección de Entrega
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
                  {fullAddress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Aclaración adicional */}
          {customer.aclaracion && (
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: "16px",
                  border: "1px solid #f1f5f9",
                  backgroundColor: "#f8fafc",
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
                      Información Adicional
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
                    {customer.aclaracion}
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
                      Fecha de Registro
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(customer.createdAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Última Actualización
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(customer.updatedAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Tipo de Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {customer.tipo_cliente}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Estado
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {customer.status ? "Activo" : "Inactivo"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Historial de Ventas - Placeholder */}
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
                  <History sx={{ fontSize: 20, color: "#1C1C26" }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1C1C26",
                      fontWeight: 500,
                    }}
                  >
                    Historial de Compras
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#6b7280",
                  }}
                >
                  <Typography variant="body2">
                    El historial de ventas estará disponible próximamente
                  </Typography>
                </Box>
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
          Editar Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetail;
