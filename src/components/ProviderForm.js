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
} from "@mui/material";
import { Close, Save, Add, Business } from "@mui/icons-material";
import { providerService } from "../services/providerService";

const ProviderForm = ({
  open = true,
  providerData = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = providerData && providerData.id;

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    contacto: "",
    status: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nombre: providerData.nombre || "",
        telefono: providerData.telefono || "",
        email: providerData.email || "",
        contacto: providerData.contacto || "",
        status: providerData.status !== undefined ? providerData.status : true,
      });
    } else {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        contacto: "",
        status: true,
      });
    }
  }, [providerData, isEditMode, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      setError("El nombre del proveedor es obligatorio");
      return false;
    }

    if (formData.nombre.trim().length < 1) {
      setError("El nombre debe tener al menos 1 caracter");
      return false;
    }

    if (formData.nombre.trim().length > 100) {
      setError("El nombre no puede tener más de 100 caracteres");
      return false;
    }

    // Validar email si se proporciona
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError("Debe ser un email válido");
        return false;
      }
    }

    // Validar longitudes
    if (formData.telefono.trim().length > 20) {
      setError("El teléfono no puede tener más de 20 caracteres");
      return false;
    }

    if (formData.email.trim().length > 100) {
      setError("El email no puede tener más de 100 caracteres");
      return false;
    }

    if (formData.contacto.trim().length > 100) {
      setError("El contacto no puede tener más de 100 caracteres");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let response;
      const submitData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        contacto: formData.contacto.trim() || undefined,
        status: formData.status,
      };

      if (isEditMode) {
        response = await providerService.updateProvider(
          providerData.id,
          submitData
        );
        setSuccess("Proveedor actualizado exitosamente");
      } else {
        response = await providerService.createProvider(submitData);
        setSuccess("Proveedor creado exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      setError(
        error.message ||
          `Error ${isEditMode ? "actualizando" : "creando"} proveedor`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && onClose) {
      setError("");
      setSuccess("");
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          backgroundColor: "#ffffff",
          border: "none",
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
              <Business sx={{ color: "#1C1C26", fontSize: 20 }} />
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
            {isEditMode ? "Editar Proveedor" : "Nuevo Proveedor"}
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
              "& .MuiAlert-icon": {
                color: "#dc2626",
              },
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
              "& .MuiAlert-icon": {
                color: "#16a34a",
              },
            }}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Provider Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Proveedor"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Distribuidora Fragancias SA"
                sx={inputStyles}
                helperText="Nombre o razón social del proveedor"
              />
            </Grid>

            {/* Contact Person */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Persona de Contacto"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="Ej: Juan Pérez"
                sx={inputStyles}
                helperText="Nombre de la persona de contacto"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="Ej: contacto@proveedor.com"
                sx={inputStyles}
                helperText="Correo electrónico del proveedor"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="Ej: +54 11 1234-5678"
                sx={inputStyles}
                helperText="Número de teléfono de contacto"
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
                    Estado:
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
            : "Crear Proveedor"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default ProviderForm;
