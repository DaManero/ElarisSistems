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
import { Close, Save, Add } from "@mui/icons-material";
import { measureService } from "../services/measureService";

const MeasureForm = ({
  open = true,
  measureData = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = measureData && measureData.id;

  const [formData, setFormData] = useState({
    nombre: "",
    status: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        nombre: measureData.nombre || "",
        status: measureData.status !== undefined ? measureData.status : true,
      });
    } else {
      setFormData({
        nombre: "",
        status: true,
      });
    }
  }, [measureData, isEditMode, open]);

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
      setError("El nombre de la medida es obligatorio");
      return false;
    }

    if (formData.nombre.trim().length < 1) {
      setError("El nombre debe tener al menos 1 caracter");
      return false;
    }

    if (formData.nombre.trim().length > 50) {
      setError("El nombre no puede tener más de 50 caracteres");
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
        status: formData.status,
      };

      if (isEditMode) {
        response = await measureService.updateMeasure(
          measureData.id,
          submitData
        );
        setSuccess("Medida actualizada exitosamente");
      } else {
        response = await measureService.createMeasure(submitData);
        setSuccess("Medida creada exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      setError(
        error.message ||
          `Error ${isEditMode ? "actualizando" : "creando"} medida`
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
      maxWidth="sm"
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
              <Add sx={{ color: "#1C1C26", fontSize: 20 }} />
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
            {isEditMode ? "Editar Medida" : "Nueva Medida"}
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
            {/* Measure Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre de la Medida"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: 30ml, 50ml, 100ml"
                sx={inputStyles}
                helperText="Ejemplo: 30ml, 50ml, 100ml, 1 litro"
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
                    {formData.status ? "Activa" : "Inactiva"}
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
            : "Crear Medida"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default MeasureForm;
