// components/statistics/SalesStatistics.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  Analytics,
  FilterList,
  DateRange,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";
import { categoryService } from "../../services/categoryService";

const SalesStatistics = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesData, setSalesData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [groupBy, setGroupBy] = useState("day");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Estados para datos auxiliares
  const [categories, setCategories] = useState([]);

  // Función para cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryService.getActiveCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  // Función para cargar estadísticas de ventas
  const loadSalesStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        categoria_id: selectedCategory,
        group_by: groupBy,
        compare_previous: compareWithPrevious,
      };

      // Agregar fechas personalizadas si están disponibles
      if (selectedPeriod === "custom" && dateFrom && dateTo) {
        params.date_from = dateFrom;
        params.date_to = dateTo;
      }

      const response = await statisticsService.getSalesStatistics(params);
      setSalesData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando estadísticas de ventas");
      console.error("Error loading sales statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [
    selectedPeriod,
    selectedCategory,
    groupBy,
    compareWithPrevious,
    dateFrom,
    dateTo,
  ]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadSalesStatistics();
  }, [loadSalesStatistics]);

  // Componente para métricas resumidas
  const SummaryCard = ({ title, value, subtitle, icon, color, trend }) => {
    const Icon = icon;

    return (
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(190, 191, 189, 0.15)",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(28, 28, 38, 0.1)",
            transform: "translateY(-2px)",
            transition: "all 0.3s ease",
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "#6A736A", fontSize: "0.875rem", mb: 0.5 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#1C1C26", fontWeight: 600 }}
              >
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "#6A736A" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Box>
          </Box>

          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${trend.growth > 0 ? "+" : ""}${trend.growth}%`}
                size="small"
                color={statisticsService.getGrowthColor(trend.growth)}
                variant="outlined"
                sx={{ fontSize: "0.75rem", height: 24 }}
              />
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                vs período anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

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
            Estadísticas de Ventas
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Análisis detallado del rendimiento de ventas y tendencias
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Período */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Período"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {statisticsService.getPeriodPresets().map((preset) => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fechas personalizadas */}
            {selectedPeriod === "custom" && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Desde"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hasta"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              </>
            )}

            {/* Categoría */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas las categorías</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Agrupación */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Agrupar por</InputLabel>
                <Select
                  value={groupBy}
                  label="Agrupar por"
                  onChange={(e) => setGroupBy(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="day">Día</MenuItem>
                  <MenuItem value="week">Semana</MenuItem>
                  <MenuItem value="month">Mes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Actualizar */}
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadSalesStatistics}
                disabled={loading}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  width: "100%",
                  bgcolor: "#1C1C26",
                  "&:hover": { bgcolor: "#0D0D0D" },
                }}
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Métricas Resumidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Ingresos Totales"
            value={salesData?.summary?.ingresos_formatted || "$0"}
            subtitle={`${salesData?.summary?.cantidad_ventas || 0} ventas`}
            icon={AttachMoney}
            color="#16a34a"
            trend={
              salesData?.comparison && {
                growth: salesData.comparison.ingresos_growth,
              }
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Cantidad de Ventas"
            value={salesData?.summary?.cantidad_ventas || 0}
            subtitle="transacciones"
            icon={ShoppingCart}
            color="#3b82f6"
            trend={
              salesData?.comparison && {
                growth: salesData.comparison.cantidad_growth,
              }
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Ticket Promedio"
            value={statisticsService.formatCurrency(
              salesData?.summary?.ticket_promedio || 0
            )}
            subtitle="por transacción"
            icon={TrendingUp}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            title="Período"
            value={
              selectedPeriod === "today"
                ? "Hoy"
                : selectedPeriod === "week"
                ? "Semana"
                : selectedPeriod === "month"
                ? "Mes"
                : selectedPeriod === "custom"
                ? "Personalizado"
                : "Año"
            }
            subtitle={
              selectedCategory !== "all"
                ? categories.find((c) => c.id == selectedCategory)?.nombre ||
                  "Categoría"
                : "Todas las categorías"
            }
            icon={DateRange}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Evolución Temporal */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(190, 191, 189, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
              >
                Evolución de Ventas
              </Typography>
              <Box sx={{ height: 400 }}>
                {salesData?.evolution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData.evolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) =>
                          statisticsService.formatCurrency(value)
                        }
                      />
                      <Tooltip
                        formatter={[
                          (value) => statisticsService.formatCurrency(value),
                          "Ingresos",
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ingresos"
                        stroke="#1C1C26"
                        strokeWidth={3}
                        dot={{ fill: "#1C1C26", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#1C1C26", strokeWidth: 2 }}
                        name="Ingresos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#6A736A",
                    }}
                  >
                    <Typography variant="body2">
                      No hay datos de evolución disponibles
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Categoría */}
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(190, 191, 189, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
              >
                Resumen por Período
              </Typography>
              <Box sx={{ height: 400 }}>
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="h3"
                    sx={{ color: "#16a34a", fontWeight: 600, mb: 1 }}
                  >
                    {salesData?.summary?.ingresos_formatted || "$0"}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#6A736A", mb: 3 }}>
                    Ingresos Totales
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 2,
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "#1C1C26", fontWeight: 600 }}
                        >
                          {salesData?.summary?.cantidad_ventas || 0}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6A736A" }}>
                          Ventas
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 2,
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "#1C1C26", fontWeight: 600 }}
                        >
                          {statisticsService.formatCurrency(
                            salesData?.summary?.ticket_promedio || 0
                          )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6A736A" }}>
                          Promedio
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rankings */}
      <Grid container spacing={3}>
        {/* Top Productos */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(190, 191, 189, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
              >
                Top Productos
              </Typography>
              {salesData?.rankings?.topProducts?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Producto
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Cantidad
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Ingresos
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.rankings.topProducts
                        .slice(0, 5)
                        .map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {product.fragancia}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                {product.categoria}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {product.cantidad_vendida}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {product.ingresos_formatted}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "#6A736A" }}>
                  <Typography variant="body2">
                    No hay datos de productos disponibles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clientes */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(190, 191, 189, 0.15)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
              >
                Top Clientes
              </Typography>
              {salesData?.rankings?.topCustomers?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Cliente
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Compras
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.rankings.topCustomers
                        .slice(0, 5)
                        .map((customer, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {customer.nombre}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                {customer.provincia}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">
                                {customer.cantidad_compras}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {customer.total_formatted}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "#6A736A" }}>
                  <Typography variant="body2">
                    No hay datos de clientes disponibles
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesStatistics;
