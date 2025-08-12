// CustomerForm.js - Versión completa con cascada Provincia → Localidad
import React, { useState, useEffect, useCallback } from "react";
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
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Save,
  Person,
  Phone,
  Email,
  Home,
  LocationOn,
  Info,
  Add,
} from "@mui/icons-material";
import { customerService } from "../services/customerService";
import georefService from "../services/georefService";

const CustomerForm = ({
  open = true,
  customerData = null,
  onClose,
  onSuccess,
}) => {
  const isEditMode = customerData && customerData.id;

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    calle: "",
    altura: "",
    piso: "",
    dpto: "",
    codigo_postal: "",
    aclaracion: "",
    provincia: "",
    localidad: "",
    status: true,
  });

  const [provinces, setProvinces] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Función para cargar provincias
  const loadProvinces = useCallback(async () => {
    try {
      setLoadingProvinces(true);
      console.log("🌎 Cargando provincias...");

      const result = await georefService.getProvinces();
      if (result.success && result.data.length > 0) {
        console.log(`✅ ${result.data.length} provincias cargadas`);
        setProvinces(result.data.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        console.log("⚠️ Error cargando provincias, usando fallback");
        const fallbackProvinces = customerService
          .getArgentineProvinces()
          .map((name) => ({
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name: name,
            value: name,
          }));
        setProvinces(fallbackProvinces);
      }
    } catch (error) {
      console.error("❌ Error crítico cargando provincias:", error);
      const fallbackProvinces = customerService
        .getArgentineProvinces()
        .map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name: name,
          value: name,
        }));
      setProvinces(fallbackProvinces);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  // Función para cargar localidades por provincia
  const loadLocalitiesByProvince = useCallback(async (provinceName) => {
    if (!provinceName) {
      setLocalities([]);
      return;
    }

    try {
      setLoadingLocalities(true);
      console.log(`🏘️ Cargando localidades para: ${provinceName}`);

      const result = await georefService.getLocalitiesByProvince(provinceName);
      if (result.success && result.data.length > 0) {
        console.log(
          `✅ ${result.data.length} localidades cargadas para ${provinceName}`
        );
        setLocalities(result.data);
      } else {
        console.log(`⚠️ No se encontraron localidades para ${provinceName}`);
        setLocalities([]);
      }
    } catch (error) {
      console.error(
        `❌ Error cargando localidades para ${provinceName}:`,
        error
      );
      setLocalities([]);
    } finally {
      setLoadingLocalities(false);
    }
  }, []);

  // Cargar provincias al montar
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  // Cargar datos del cliente si está en modo edición
  useEffect(() => {
    if (isEditMode && customerData) {
      setFormData({
        nombre: customerData.nombre || "",
        apellido: customerData.apellido || "",
        telefono: customerData.telefono || "",
        email: customerData.email || "",
        calle: customerData.calle || "",
        altura: customerData.altura || "",
        piso: customerData.piso || "",
        dpto: customerData.dpto || "",
        codigo_postal: customerData.codigo_postal || "",
        aclaracion: customerData.aclaracion || "",
        provincia: customerData.provincia || "",
        localidad: customerData.localidad || "",
        status: customerData.status !== undefined ? customerData.status : true,
      });

      // Cargar localidades si hay provincia
      if (customerData.provincia) {
        loadLocalitiesByProvince(customerData.provincia);
      }
    } else {
      resetForm();
    }
  }, [customerData, isEditMode, open, loadLocalitiesByProvince]);

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
      calle: "",
      altura: "",
      piso: "",
      dpto: "",
      codigo_postal: "",
      aclaracion: "",
      provincia: "",
      localidad: "",
      status: true,
    });
    setLocalities([]);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Si cambia la provincia, cargar localidades y resetear localidad
    if (name === "provincia") {
      setFormData((prev) => ({
        ...prev,
        localidad: "",
        // No resetear codigo_postal para que mantenga lo que el usuario escribió
      }));
      loadLocalitiesByProvince(value);
    }

    // Si cambia la localidad, NO autocompletar código postal
    if (name === "localidad") {
      console.log(`🏘️ Localidad seleccionada: ${value} (código postal manual)`);
    }

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = customerService.validateCustomerData(formData);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    // Validar teléfono
    if (!customerService.validatePhoneNumber(formData.telefono)) {
      setError("El formato del teléfono no es válido");
      return;
    }

    // Verificar si ya existe un cliente con ese teléfono (solo en crear)
    if (!isEditMode) {
      try {
        const existingCustomer = await customerService.checkCustomerExists(
          formData.telefono
        );
        if (existingCustomer) {
          setError(
            `Ya existe un cliente con el teléfono ${
              formData.telefono
            }: ${customerService.getFullName(existingCustomer)}`
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
      const preparedData = customerService.prepareCustomerData(formData);
      let response;

      if (isEditMode) {
        response = await customerService.updateCustomer(
          customerData.id,
          preparedData
        );
        setSuccess("Cliente actualizado exitosamente");
      } else {
        response = await customerService.createCustomer(preparedData);
        setSuccess("Cliente creado exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      setError(
        error.message ||
          `Error ${isEditMode ? "actualizando" : "creando"} cliente`
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
              <Person sx={{ color: "#1C1C26", fontSize: 20 }} />
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
            {isEditMode ? "Editar Cliente" : "Nuevo Cliente"}
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
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                Información Personal
              </Typography>
            </Grid>

            {/* Nombre */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Juan"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Apellido */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Pérez"
                sx={inputStyles}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: 11 1234-5678"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Formato: Código de área + número (sin 0 ni 15)"
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
                placeholder="Ej: juan.perez@email.com"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Opcional - Se usará para envío de información"
              />
            </Grid>

            {/* Dirección */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                Dirección de Entrega
              </Typography>
            </Grid>

            {/* Provincia */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel>Provincia *</InputLabel>
                <Select
                  name="provincia"
                  value={formData.provincia}
                  label="Provincia *"
                  onChange={handleChange}
                  disabled={loading || loadingProvinces}
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOn
                        sx={{ color: "#6b7280", fontSize: 20, mr: 1 }}
                      />
                    </InputAdornment>
                  }
                >
                  {loadingProvinces && (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Cargando provincias...
                    </MenuItem>
                  )}
                  {!loadingProvinces && provinces.length === 0 && (
                    <MenuItem disabled>No hay provincias disponibles</MenuItem>
                  )}
                  {!loadingProvinces &&
                    provinces.map((province) => (
                      <MenuItem key={province.id} value={province.value}>
                        {province.name}
                      </MenuItem>
                    ))}
                </Select>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", mt: 0.5 }}
                >
                  Seleccione primero la provincia
                </Typography>
              </FormControl>
            </Grid>

            {/* Localidad/Barrio */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={inputStyles}>
                <InputLabel>
                  {formData.provincia?.includes("Ciudad Autónoma")
                    ? "Barrio *"
                    : "Localidad *"}
                </InputLabel>
                <Select
                  name="localidad"
                  value={formData.localidad}
                  label={
                    formData.provincia?.includes("Ciudad Autónoma")
                      ? "Barrio *"
                      : "Localidad *"
                  }
                  onChange={handleChange}
                  disabled={loading || loadingLocalities || !formData.provincia}
                  startAdornment={
                    <InputAdornment position="start">
                      <Home sx={{ color: "#6b7280", fontSize: 20, mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  {!formData.provincia && (
                    <MenuItem disabled>
                      Primero seleccione una provincia
                    </MenuItem>
                  )}
                  {loadingLocalities && (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Cargando{" "}
                      {formData.provincia?.includes("Ciudad Autónoma")
                        ? "barrios"
                        : "localidades"}
                      ...
                    </MenuItem>
                  )}
                  {formData.provincia &&
                    !loadingLocalities &&
                    localities.length === 0 && (
                      <MenuItem disabled>
                        No hay{" "}
                        {formData.provincia?.includes("Ciudad Autónoma")
                          ? "barrios"
                          : "localidades"}{" "}
                        disponibles
                      </MenuItem>
                    )}
                  {!loadingLocalities &&
                    localities.map((locality) => (
                      <MenuItem key={locality.id} value={locality.value}>
                        {locality.name}
                      </MenuItem>
                    ))}
                </Select>
                <Typography
                  variant="caption"
                  sx={{ color: "#6b7280", mt: 0.5 }}
                >
                  {formData.provincia?.includes("Ciudad Autónoma")
                    ? "Seleccione el barrio de CABA"
                    : "Seleccione la ciudad o localidad"}
                </Typography>
              </FormControl>
            </Grid>

            {/* Código Postal */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código Postal"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: 1428"
                sx={inputStyles}
                helperText="Complete manualmente el código postal"
              />
            </Grid>

            {/* Calle */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Calle"
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: Av. Corrientes"
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Altura */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Altura"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                required
                placeholder="Ej: 1234"
                sx={inputStyles}
              />
            </Grid>

            {/* Piso */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Piso"
                name="piso"
                value={formData.piso}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="Ej: 3° o PB"
                sx={inputStyles}
                helperText="Opcional - Solo si es edificio"
              />
            </Grid>

            {/* Departamento */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Departamento"
                name="dpto"
                value={formData.dpto}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                placeholder="Ej: A, B, 12"
                sx={inputStyles}
                helperText="Opcional - Solo si es edificio"
              />
            </Grid>

            {/* Aclaración */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Aclaración para la Entrega"
                name="aclaracion"
                value={formData.aclaracion}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                multiline
                rows={3}
                placeholder="Ej: Entre calles X e Y, portero eléctrico, timbre Pérez..."
                sx={inputStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <Info sx={{ color: "#6b7280", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Opcional - Información adicional para facilitar la entrega"
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
                    Estado del Cliente:
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
            : "Crear Cliente"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default CustomerForm;
