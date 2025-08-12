// PaymentMethodForm.js - Formulario para crear/editar métodos de pago
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
  FormControlLabel,
  Switch,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Close,
  Save,
  Payment,
  Description,
  Receipt,
  Add,
  Info,
} from "@mui/icons-material";
import paymentMethodService from "../services/paymentMethodService";

const PaymentMethodForm = ({
  open = true,
  paymentMethodData = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = paymentMethodData && paymentMethodData.id;

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    requiere_referencia: false,
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCommonMethods, setShowCommonMethods] = useState(false);

  // Cargar datos del método de pago si está en modo edición
  useEffect(() => {
    if (isEditMode && paymentMethodData) {
      setFormData({
        nombre: paymentMethodData.nombre || "",
        descripcion: paymentMethodData.descripcion || "",
        requiere_referencia: paymentMethodData.requiere_referencia || false,
        activo:
          paymentMethodData.activo !== undefined
            ? paymentMethodData.activo
            : true,
      });
    } else {
      resetForm();
    }
  }, [paymentMethodData, isEditMode, open]);

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      requiere_referencia: false,
      activo: true,
    });
    setError("");
    setSuccess("");
    setShowCommonMethods(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleCommonMethodSelect = (commonMethod) => {
    setFormData({
      nombre: commonMethod.nombre,
      descripcion: commonMethod.descripcion,
      requiere_referencia: commonMethod.requiere_referencia,
      activo: true,
    });
    setShowCommonMethods(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = paymentMethodService.validatePaymentMethodData(formData);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    // Verificar si ya existe un método con ese nombre (solo en crear)
    if (!isEditMode) {
      try {
        const existingPaymentMethod =
          await paymentMethodService.checkPaymentMethodExists(formData.nombre);
        if (existingPaymentMethod) {
          setError(
            `Ya existe un método de pago con el nombre "${formData.nombre}"`
          );
          return;
        }
      } catch (error) {
        // Si hay error verificando, continuar (el backend validará)
      }
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const preparedData =
        paymentMethodService.preparePaymentMethodData(formData);
      let response;

      if (isEditMode) {
        response = await paymentMethodService.updatePaymentMethod(
          paymentMethodData.id,
          preparedData
        );
        setSuccess("Método de pago actualizado exitosamente");
      } else {
        response = await paymentMethodService.createPaymentMethod(preparedData);
        setSuccess("Método de pago creado exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      setError(
        error.message ||
          `Error ${isEditMode ? "actualizando" : "creando"} método de pago`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      resetForm();
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

  const commonMethods = paymentMethodService.getCommonPaymentMethods();

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
            {isEditMode ? (
              <Save sx={{ color: "#1C1C26", fontSize: 20 }} />
            ) : (
              <Payment sx={{ color: "#1C1C26", fontSize: 20 }} />
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
            {isEditMode ? "Editar Método de Pago" : "Nuevo Método de Pago"}
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

        {/* Quick Selection for Common Methods */}
        {!isEditMode && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowCommonMethods(!showCommonMethods)}
              sx={{
                textTransform: "none",
                borderRadius: "12px",
                mb: 2,
                borderColor: "#e5e7eb",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#1C1C26",
                  color: "#1C1C26",
                },
              }}
              startIcon={<Info />}
            >
              {showCommonMethods ? "Ocultar" : "Ver"} Métodos Comunes
            </Button>

            {showCommonMethods && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ mb: 2, color: "#6b7280", fontWeight: 500 }}
                >
                  Selecciona un método común para autocompletar:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {commonMethods.map((method, index) => (
                    <Chip
                      key={index}
                      label={method.nombre}
                      onClick={() => handleCommonMethodSelect(method)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#1C1C26",
                          color: "#ffffff",
                        },
                      }}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
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
                Información del Método de Pago
              </Typography>
            </Grid>

            {/* Nombre */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Método de Pago"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Efectivo, Tarjeta de Crédito, Transferencia..."
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Payment sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Ingresa un nombre descriptivo para el método de pago"
              />
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Ej: Pago en efectivo al momento de la entrega, Transferencia bancaria con comprobante..."
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <Description sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Opcional - Información adicional sobre este método de pago"
              />
            </Grid>

            {/* Configuración */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                Configuración
              </Typography>
            </Grid>

            {/* Requiere Referencia */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #f1f5f9",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.requiere_referencia}
                      onChange={handleChange}
                      name="requiere_referencia"
                      disabled={loading}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#1C1C26",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#1C1C26",
                          },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Receipt sx={{ color: "#6b7280", fontSize: 18 }} />
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, color: "#111827" }}
                        >
                          Requiere Número de Referencia
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", ml: 3 }}
                      >
                        {formData.requiere_referencia
                          ? "Este método necesitará que se ingrese un número de transacción o referencia"
                          : "Este método no requiere información adicional de referencia"}
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: "flex-start", mb: 0 }}
                />
              </Box>
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
                    Estado del Método de Pago:
                  </Typography>

                  <Box
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "activo",
                          type: "checkbox",
                          checked: !formData.activo,
                        },
                      })
                    }
                    sx={{
                      width: 60,
                      height: 28,
                      borderRadius: "14px",
                      backgroundColor: formData.activo ? "#16a34a" : "#1C1C26",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: formData.activo
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
                        left: formData.activo ? 34 : 2,
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px 0 rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: formData.activo ? "#16a34a" : "#6b7280",
                      fontSize: "14px",
                      fontWeight: 500,
                      minWidth: 60,
                    }}
                  >
                    {formData.activo ? "Activo" : "Inactivo"}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#6b7280",
                  display: "block",
                  textAlign: "center",
                  mt: 1,
                }}
              >
                {formData.activo
                  ? "El método estará disponible para usar en las ventas"
                  : "El método no aparecerá en las opciones de pago"}
              </Typography>
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
            : "Crear Método de Pago"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default PaymentMethodForm;
