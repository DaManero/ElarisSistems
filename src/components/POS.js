import React from "react";
import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import {
  PointOfSale,
  ShoppingCart,
  Person,
  Payment,
} from "@mui/icons-material";

const POS = () => {
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
        <Box>
          <Typography variant="h6" sx={{ color: "#1C1C26", fontWeight: 500 }}>
            Punto de Venta (POS)
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Procesa nuevas ventas de forma rápida y eficiente
          </Typography>
        </Box>
      </Box>

      {/* Main POS Interface Preview */}
      <Grid container spacing={3}>
        {/* Product Search & Selection */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: "600px" }}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <ShoppingCart
                sx={{ fontSize: 64, color: "#6A736A", mb: 2, opacity: 0.5 }}
              />
              <Typography variant="h6" sx={{ mb: 1, color: "#1C1C26" }}>
                Selección de Productos
              </Typography>
              <Typography variant="body2" sx={{ color: "#6A736A" }}>
                Aquí estará la búsqueda de productos, verificación de stock, y
                la interfaz para agregar items al carrito de venta.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Shopping Cart & Checkout */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Customer Selection */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Person
                    sx={{ fontSize: 48, color: "#6A736A", mb: 1, opacity: 0.5 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: "#1C1C26" }}
                  >
                    Cliente
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6A736A" }}>
                    Selección rápida de cliente
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Cart */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <PointOfSale
                    sx={{ fontSize: 48, color: "#6A736A", mb: 1, opacity: 0.5 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: "#1C1C26" }}
                  >
                    Carrito
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6A736A" }}>
                    Items, cantidades, descuentos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Payment */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Payment
                    sx={{ fontSize: 48, color: "#6A736A", mb: 1, opacity: 0.5 }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, color: "#1C1C26" }}
                  >
                    Pago
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6A736A" }}>
                    Método de pago y procesamiento
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Info Card */}
      <Card sx={{ borderRadius: 3, mt: 3, bgcolor: "#f8fafc" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: "#1C1C26" }}>
            🚀 POS en Desarrollo
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6A736A", lineHeight: 1.6 }}
          >
            El Punto de Venta completo estará disponible próximamente. Incluirá:
            búsqueda de productos con verificación de stock, selección rápida de
            clientes, carrito con descuentos, múltiples métodos de pago, y
            generación automática de facturas. Todos los servicios backend ya
            están listos y funcionando.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default POS;
