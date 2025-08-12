import React, { useState, useEffect } from "react";
import {
  Dialog,
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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Autocomplete,
  Container,
  Stack,
} from "@mui/material";
import {
  Close,
  Save,
  Add,
  Receipt,
  Person,
  AttachMoney,
  Delete,
  ShoppingCart,
  Payment,
  LocalShipping,
  ArrowBack,
  Search,
  Inventory,
  Assignment,
  AccountBalance,
} from "@mui/icons-material";
import { saleService } from "../services/salesService";
import { customerService } from "../services/customerService";
import paymentMethodService from "../services/paymentMethodService";
import { productService } from "../services/productService";
import { authService } from "../services/authService";

const SalesForm = ({
  open = true,
  saleData = null,
  onClose,
  onSuccess,
  pageMode = false,
}) => {
  const isEditMode = saleData && saleData.id;

  const [formData, setFormData] = useState({
    cliente_id: "",
    usuario_id: "",
    metodo_pago_id: "",
    referencia_pago: "",
    costo_envio: 0,
    observaciones: "",
    estado_venta: "En proceso",
    estado_pago: "Pendiente",
    items: [],
  });

  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para buscadores
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDiscount, setProductDiscount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && saleData) {
      setFormData({
        cliente_id: saleData.cliente_id || "",
        usuario_id: saleData.usuario_id || "",
        metodo_pago_id: saleData.metodo_pago_id || "",
        referencia_pago: saleData.referencia_pago || "",
        costo_envio: saleData.costo_envio || 0,
        observaciones: saleData.observaciones || "",
        estado_venta: saleData.estado_venta || "En proceso",
        estado_pago: saleData.estado_pago || "Pendiente",
        items: saleData.items || [],
      });

      // Establecer cliente seleccionado para el autocomplete
      if (saleData.cliente_id && customers.length > 0) {
        const customer = customers.find((c) => c.id === saleData.cliente_id);
        setSelectedCustomer(customer || null);
      }
    } else {
      resetForm();
    }
  }, [saleData, isEditMode, open, customers]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [customersResponse, paymentMethodsResponse] = await Promise.all([
        customerService.getActiveCustomers(),
        paymentMethodService.getActivePaymentMethods(),
      ]);

      setCustomers(customersResponse.data || []);
      setPaymentMethods(paymentMethodsResponse.data || []);

      // Cargar productos con manejo de errores específico
      try {
        const productsResponse = await productService.getProducts({
          status: "true",
          activo: true,
        });

        const products =
          productsResponse.data?.products || productsResponse.data || [];

        // Filtrar productos válidos para evitar errores
        const validProducts = products.filter(
          (product) =>
            product &&
            product.id &&
            (product.precio_venta > 0 || product.precio > 0) &&
            (product.fragancia || product.nombre) &&
            product.activo !== false
        );

        setProducts(validProducts);
      } catch (productError) {
        console.error("Error loading products:", productError);
        setError(
          "Error cargando productos. Algunos productos podrían no estar disponibles."
        );
        setProducts([]);
      }

      setCurrentUser(authService.getCurrentUser());
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Error cargando datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    const user = authService.getCurrentUser();
    setFormData({
      cliente_id: "",
      usuario_id: user?.id || "",
      metodo_pago_id: "",
      referencia_pago: "",
      costo_envio: 0,
      observaciones: "",
      estado_venta: "En proceso",
      estado_pago: "Pendiente",
      items: [],
    });
    setSelectedCustomer(null);
    setSelectedProduct(null);
    setProductQuantity(1);
    setProductDiscount(0);
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

    if (error) setError("");
    if (success) setSuccess("");
  };

  // Manejar cambio de cliente desde autocomplete
  const handleCustomerChange = (event, newValue) => {
    setSelectedCustomer(newValue);
    setFormData((prev) => ({
      ...prev,
      cliente_id: newValue ? newValue.id : "",
    }));
  };

  // Manejar cambio de producto desde autocomplete
  const handleProductChange = (event, newValue) => {
    setSelectedProduct(newValue);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      setError("Selecciona un producto");
      return;
    }

    if (!selectedProduct.id) {
      setError("Producto seleccionado inválido");
      return;
    }

    if (productQuantity <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    // Verificar que el producto tenga precio válido
    const precio_unitario =
      selectedProduct.precio_venta || selectedProduct.precio || 0;
    if (precio_unitario <= 0) {
      setError("El producto seleccionado no tiene un precio válido");
      return;
    }

    try {
      // Verificar si el producto ya está en la lista
      const existingItemIndex = formData.items.findIndex(
        (item) => item.producto_id === selectedProduct.id
      );

      if (existingItemIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedItems = [...formData.items];
        updatedItems[existingItemIndex].cantidad += productQuantity;
        updatedItems[existingItemIndex].subtotal =
          updatedItems[existingItemIndex].precio_con_descuento *
          updatedItems[existingItemIndex].cantidad;

        setFormData((prev) => ({
          ...prev,
          items: updatedItems,
        }));
      } else {
        // Agregar nuevo producto
        const descuento_monto = (precio_unitario * productDiscount) / 100;
        const precio_con_descuento = precio_unitario - descuento_monto;
        const subtotal = precio_con_descuento * productQuantity;

        const newItem = {
          producto_id: selectedProduct.id,
          producto: {
            id: selectedProduct.id,
            nombre:
              selectedProduct.fragancia ||
              selectedProduct.nombre ||
              `Producto #${selectedProduct.id}`,
            marca: selectedProduct.marca || "",
            presentacion: selectedProduct.presentacion || "",
          },
          cantidad: productQuantity,
          precio_unitario: precio_unitario,
          descuento_porcentaje: productDiscount,
          descuento_monto: descuento_monto,
          precio_con_descuento: precio_con_descuento,
          subtotal: subtotal,
        };

        setFormData((prev) => ({
          ...prev,
          items: [...prev.items, newItem],
        }));
      }

      // Reset form de productos
      setSelectedProduct(null);
      setProductQuantity(1);
      setProductDiscount(0);
      setError("");
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Error agregando el producto a la venta");
    }
  };

  const handleRemoveProduct = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.precio_unitario * item.cantidad,
      0
    );
    const descuento_total = formData.items.reduce(
      (sum, item) => sum + item.descuento_monto * item.cantidad,
      0
    );
    const costo_envio = parseFloat(formData.costo_envio) || 0;
    const total = subtotal - descuento_total + costo_envio;

    return {
      subtotal,
      descuento_total,
      costo_envio,
      total,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const validation = saleService.validateSaleData(formData, isEditMode);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let preparedData;
      let response;

      if (isEditMode) {
        // MODO EDICIÓN - Preparar datos con flags especiales
        preparedData = {
          cliente_id: formData.cliente_id,
          usuario_id: formData.usuario_id,
          metodo_pago_id: formData.metodo_pago_id,
          referencia_pago: formData.referencia_pago?.trim() || null,
          costo_envio: parseFloat(formData.costo_envio) || 0,
          observaciones: formData.observaciones?.trim() || null,
          estado_venta: formData.estado_venta,
          estado_pago: formData.estado_pago,
          items: formData.items || [],
          // FLAGS CRÍTICOS PARA EL BACKEND
          _isUpdate: true,
          _skipStockValidation: true,
          _editMode: true,
          _originalSaleId: saleData.id,
        };

        response = await saleService.updateSale(saleData.id, preparedData);
        setSuccess("Venta actualizada exitosamente");
      } else {
        // MODO CREACIÓN
        preparedData = {
          cliente_id: formData.cliente_id,
          usuario_id: formData.usuario_id,
          metodo_pago_id: formData.metodo_pago_id,
          referencia_pago: formData.referencia_pago?.trim() || null,
          costo_envio: parseFloat(formData.costo_envio) || 0,
          observaciones: formData.observaciones?.trim() || null,
          estado_venta: formData.estado_venta,
          estado_pago: formData.estado_pago,
          items: formData.items || [],
        };

        response = await saleService.createSale(preparedData);
        setSuccess("Venta creada exitosamente");
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);

      // En modo edición, mostrar mensaje específico si sigue validando stock
      if (isEditMode && error.stock_errors) {
        setError(
          "Error: El sistema sigue validando stock en modo edición. Revisa la configuración del backend."
        );
        return;
      }

      // Manejo específico para errores de productos
      if (error.invalid_products) {
        setError(
          `Productos no disponibles: ${error.invalid_products.join(", ")}`
        );
      } else if (error.stock_errors) {
        const stockMsg = error.stock_errors
          .map(
            (err) =>
              `${err.producto}: solicitado ${err.solicitado}, disponible ${err.disponible}`
          )
          .join("; ");
        setError(`Stock insuficiente: ${stockMsg}`);
      } else {
        setError(
          error.message ||
            `Error ${isEditMode ? "actualizando" : "creando"} venta`
        );
      }
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
      borderRadius: "8px",
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

  const totals = calculateTotals();
  const selectedPaymentMethod = paymentMethods.find(
    (pm) => pm.id === formData.metodo_pago_id
  );

  // CONTENIDO DEL FORMULARIO
  const formContent = (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
          pb: 3,
          borderBottom: "2px solid #f1f5f9",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "16px",
              backgroundColor: "#1C1C26",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditMode ? (
              <Save sx={{ color: "#ffffff", fontSize: 28 }} />
            ) : (
              <Receipt sx={{ color: "#ffffff", fontSize: 28 }} />
            )}
          </Box>
          <Box>
            <Typography
              variant="h3"
              sx={{
                color: "#111827",
                fontWeight: 700,
                fontSize: "32px",
                mb: 0.5,
              }}
            >
              {isEditMode ? "Editar Venta" : "Nueva Venta"}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              {isEditMode
                ? `Modificando venta ${saleData?.numero_venta} - Sin validación de stock`
                : "Completa los datos para registrar una nueva venta"}
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<ArrowBack />}
          variant="outlined"
          size="large"
          sx={{
            color: "#6b7280",
            borderColor: "#e5e7eb",
            textTransform: "none",
            px: 3,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#f9fafb",
              borderColor: "#d1d5db",
            },
          }}
        >
          Volver al Historial
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: "12px",
            fontSize: "16px",
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 4,
            borderRadius: "12px",
            fontSize: "16px",
          }}
        >
          {success}
        </Alert>
      )}

      {/* Layout principal */}
      <Grid container spacing={4}>
        {/* Columna izquierda - Información principal */}
        <Grid item xs={12} lg={9}>
          <Stack spacing={2}>
            {/* Información básica y estados */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 4, bgcolor: "#f2f2f2" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}
                >
                  <Person sx={{ color: "#1C1C26", fontSize: 24 }} />
                  <Typography
                    variant="h5"
                    sx={{ color: "#1C1C26", fontWeight: 600 }}
                  >
                    Información del Cliente y Estado
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {/* Buscar Cliente */}
                  <Box sx={{ flex: "0 0 30%", minWidth: "300px" }}>
                    <Autocomplete
                      value={selectedCustomer}
                      onChange={handleCustomerChange}
                      options={customers}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        return `${customerService.getFullName(option)} ${
                          option.telefono ? `- ${option.telefono}` : ""
                        }`;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar Cliente *"
                          placeholder="Escribe para buscar..."
                          sx={inputStyles}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search sx={{ color: "#6b7280" }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {customerService.getFullName(option)}
                            </Typography>
                            {option.telefono && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6b7280" }}
                              >
                                {option.telefono}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      disabled={loading}
                      noOptionsText="No se encontraron clientes"
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                    />
                  </Box>

                  {/* Método de Pago */}
                  <Box sx={{ flex: "0 0 20%", minWidth: "150px" }}>
                    <FormControl fullWidth sx={inputStyles}>
                      <InputLabel>Método de Pago *</InputLabel>
                      <Select
                        name="metodo_pago_id"
                        value={formData.metodo_pago_id}
                        label="Método de Pago *"
                        onChange={handleChange}
                        disabled={loading}
                        startAdornment={
                          <InputAdornment position="start">
                            <Payment
                              sx={{ color: "#6b7280", fontSize: 20, mr: 1 }}
                            />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Seleccionar método</MenuItem>
                        {paymentMethods.map((method) => (
                          <MenuItem key={method.id} value={method.id}>
                            {method.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Costo de Envío */}
                  <Box sx={{ flex: "0 0 10%", minWidth: "100px" }}>
                    <TextField
                      fullWidth
                      label="Envío"
                      name="costo_envio"
                      type="number"
                      value={formData.costo_envio}
                      onChange={handleChange}
                      disabled={loading}
                      variant="outlined"
                      placeholder="0"
                      sx={inputStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalShipping
                              sx={{ color: "#6b7280", fontSize: 16 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Costo envío"
                    />
                  </Box>

                  {/* Estado de Venta */}
                  <Box sx={{ flex: "0 0 15%", minWidth: "120px" }}>
                    <FormControl fullWidth sx={inputStyles}>
                      <InputLabel>Estado Venta</InputLabel>
                      <Select
                        name="estado_venta"
                        value={formData.estado_venta}
                        label="Estado Venta"
                        onChange={handleChange}
                        disabled={loading}
                      >
                        {saleService.SALE_STATES.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Estado de Pago */}
                  <Box sx={{ flex: "0 0 15%", minWidth: "120px" }}>
                    <FormControl fullWidth sx={inputStyles}>
                      <InputLabel>Estado Pago</InputLabel>
                      <Select
                        name="estado_pago"
                        value={formData.estado_pago}
                        label="Estado Pago"
                        onChange={handleChange}
                        disabled={loading}
                        startAdornment={
                          <InputAdornment position="start">
                            <AccountBalance
                              sx={{ color: "#6b7280", fontSize: 16, mr: 1 }}
                            />
                          </InputAdornment>
                        }
                      >
                        {saleService.PAYMENT_STATES.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Referencia de Pago */}
                {selectedPaymentMethod?.requiere_referencia && (
                  <Box sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      label="Referencia de Pago *"
                      name="referencia_pago"
                      value={formData.referencia_pago}
                      onChange={handleChange}
                      disabled={loading}
                      variant="outlined"
                      required
                      placeholder="Número de transacción, referencia..."
                      sx={inputStyles}
                      helperText={`El método ${selectedPaymentMethod?.nombre} requiere una referencia`}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Productos */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 4, bgcolor: "#fdfdfd" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Inventory sx={{ color: "#1C1C26", fontSize: 24 }} />
                  <Typography
                    variant="h5"
                    sx={{ color: "#1C1C26", fontWeight: 600 }}
                  >
                    Productos de la Venta
                  </Typography>
                  {isEditMode && (
                    <Chip
                      label="Modo Edición - Sin Validación de Stock"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Agregar Producto */}
                <Card
                  sx={{
                    borderRadius: "12px",
                    border: "2px dashed #e5e7eb",
                    backgroundColor: "#fafbfc",
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 3, bgcolor: "#fafbfc" }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Agregar Producto
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        alignItems: "end",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Buscador de productos */}
                      <Box sx={{ flex: "0 0 70%", minWidth: "400px" }}>
                        <Autocomplete
                          value={selectedProduct}
                          onChange={handleProductChange}
                          options={products}
                          getOptionLabel={(option) => {
                            if (!option) return "";

                            const name =
                              option.fragancia ||
                              option.nombre ||
                              `Producto #${option.id}`;
                            const price =
                              option.precio_venta || option.precio || 0;

                            try {
                              const formattedPrice = productService.formatPrice
                                ? productService.formatPrice(price)
                                : `${price.toLocaleString()}`;

                              return `${name} - ${formattedPrice}`;
                            } catch (error) {
                              return name;
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Buscar Producto"
                              placeholder="Escribe para buscar..."
                              sx={inputStyles}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Search sx={{ color: "#6b7280" }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => {
                            if (!option) return null;

                            const name =
                              option.fragancia ||
                              option.nombre ||
                              `Producto #${option.id}`;
                            const marca = option.marca || "";
                            const price =
                              option.precio_venta || option.precio || 0;

                            return (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6b7280" }}
                                  >
                                    {marca && `${marca} - `}
                                    {productService.formatPrice
                                      ? productService.formatPrice(price)
                                      : `${price.toLocaleString()}`}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          }}
                          disabled={loading}
                          noOptionsText="No se encontraron productos activos"
                          isOptionEqualToValue={(option, value) =>
                            option?.id === value?.id
                          }
                        />
                      </Box>

                      {/* Cantidad */}
                      <Box sx={{ flex: "0 0 8%", minWidth: "70px" }}>
                        <TextField
                          fullWidth
                          label="Cant."
                          type="number"
                          value={productQuantity}
                          onChange={(e) =>
                            setProductQuantity(parseInt(e.target.value) || 1)
                          }
                          disabled={loading}
                          sx={inputStyles}
                          inputProps={{ min: 1, max: 999 }}
                        />
                      </Box>

                      {/* Descuento */}
                      <Box sx={{ flex: "0 0 8%", minWidth: "70px" }}>
                        <TextField
                          fullWidth
                          label="Desc."
                          type="number"
                          value={productDiscount}
                          onChange={(e) =>
                            setProductDiscount(parseFloat(e.target.value) || 0)
                          }
                          disabled={loading}
                          sx={inputStyles}
                          inputProps={{ min: 0, max: 100 }}
                        />
                      </Box>

                      {/* Botón Agregar */}
                      <Box sx={{ flex: "0 0 14%", minWidth: "100px" }}>
                        <Button
                          variant="contained"
                          onClick={handleAddProduct}
                          disabled={loading || !selectedProduct}
                          startIcon={<Add />}
                          size="large"
                          sx={{
                            borderRadius: "10px",
                            backgroundColor: "#1C1C26",
                            "&:hover": { backgroundColor: "#0D0D0D" },
                            width: "100%",
                            py: 1.5,
                            fontSize: "13px",
                          }}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Lista de Productos */}
                {formData.items.length > 0 && (
                  <Card
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#fafbfc" }}>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Producto
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Cantidad
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Precio Unit.
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Descuento
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Subtotal
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: 600, fontSize: "14px" }}
                            >
                              Acciones
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow
                              key={index}
                              sx={{ "&:hover": { bgcolor: "#fafbfc" } }}
                            >
                              <TableCell>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500, fontSize: "14px" }}
                                  >
                                    {item.producto?.nombre ||
                                      `Producto ID: ${item.producto_id}`}
                                  </Typography>
                                  {item.producto?.marca && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#6b7280" }}
                                    >
                                      {item.producto.marca}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "14px" }}
                                >
                                  {item.cantidad}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: "14px" }}
                                >
                                  {saleService.formatPrice(
                                    item.precio_unitario
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {item.descuento_porcentaje > 0 ? (
                                  <Chip
                                    label={`${item.descuento_porcentaje}%`}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#6b7280", fontSize: "14px" }}
                                  >
                                    Sin descuento
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#16a34a",
                                    fontSize: "14px",
                                  }}
                                >
                                  {saleService.formatPrice(item.subtotal)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveProduct(index)}
                                  sx={{
                                    color: "#ef4444",
                                    "&:hover": {
                                      backgroundColor: "#fef2f2",
                                      color: "#dc2626",
                                    },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Observaciones */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 4, bgcolor: "#fdfdfd" }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                >
                  Observaciones Adicionales
                </Typography>

                <TextField
                  fullWidth
                  label="Observaciones de la Venta"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  disabled={loading}
                  variant="outlined"
                  multiline
                  rows={4}
                  placeholder="Notas adicionales sobre la venta, instrucciones de entrega, comentarios especiales..."
                  sx={inputStyles}
                  helperText="Información adicional sobre la venta (opcional)"
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Columna derecha - Resumen y acciones */}
        <Grid item xs={12} lg={3}>
          <Stack spacing={2} sx={{ position: "sticky", top: 20 }}>
            {/* Resumen de Totales */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 4,
                  }}
                >
                  <AttachMoney sx={{ color: "#1C1C26", fontSize: 20 }} />
                  <Typography
                    variant="h6"
                    sx={{ color: "#1C1C26", fontWeight: 600 }}
                  >
                    Resumen
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Subtotal:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {saleService.formatPrice(totals.subtotal)}
                      </Typography>
                    </Box>

                    {totals.descuento_total > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#ef4444" }}>
                          Descuento:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#ef4444", fontWeight: 600 }}
                        >
                          -{saleService.formatPrice(totals.descuento_total)}
                        </Typography>
                      </Box>
                    )}

                    {totals.costo_envio > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          Envío:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {saleService.formatPrice(totals.costo_envio)}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1.5, borderColor: "#e5e7eb" }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        border: "2px solid #16a34a",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ color: "#1C1C26", fontWeight: 700 }}
                      >
                        Total:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ color: "#16a34a", fontWeight: 700 }}
                      >
                        {saleService.formatPrice(totals.total)}
                      </Typography>
                    </Box>
                  </Box>

                  {formData.items.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 2,
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 18, color: "#6b7280" }} />
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        {formData.items.length} producto
                        {formData.items.length !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
                >
                  Acciones
                </Typography>

                <Stack spacing={2}>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || formData.items.length === 0}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : isEditMode ? (
                        <Save fontSize="small" />
                      ) : (
                        <Add fontSize="small" />
                      )
                    }
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.5,
                      fontSize: "14px",
                      fontWeight: 600,
                      backgroundColor: "#1C1C26",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        backgroundColor: "#0D0D0D",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
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
                      ? "Guardar"
                      : "Crear Venta"}
                  </Button>

                  <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.5,
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#6b7280",
                      borderColor: "#e5e7eb",
                      "&:hover": {
                        backgroundColor: "#f9fafb",
                        borderColor: "#d1d5db",
                      },
                    }}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );

  // RETORNAR SEGÚN EL MODO
  if (pageMode) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          py: 4,
        }}
      >
        {formContent}
      </Box>
    );
  }

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
      {formContent}
    </Dialog>
  );
};

export default SalesForm;
