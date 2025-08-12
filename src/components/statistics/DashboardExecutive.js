// components/statistics/DashboardExecutive.js
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
  Chip,
  Avatar,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  People,
  Inventory,
  LocalShipping,
  AttachMoney,
  ShoppingCart,
  Analytics,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";

const DashboardExecutive = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  // Función para cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        compare_previous: compareWithPrevious,
      };

      const response = await statisticsService.getDashboardKPIs(params);
      setDashboardData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando datos del dashboard");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, compareWithPrevious]);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Componente para tarjetas de KPI
  const KPICard = ({
    title,
    value,
    previousValue,
    growth,
    icon,
    color,
    formatted,
    subtitle,
  }) => {
    const Icon = icon;
    const growthColor = statisticsService.getGrowthColor(growth);
    const growthIcon = statisticsService.getGrowthIcon(growth);

    return (
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(190, 191, 189, 0.15)",
          position: "relative",
          overflow: "visible",
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
                {formatted || statisticsService.formatNumber(value)}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "#6A736A" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}.50`,
                color: color,
                width: 56,
                height: 56,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Avatar>
          </Box>

          {compareWithPrevious && growth !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${growth > 0 ? "+" : ""}${growth}%`}
                size="small"
                color={growthColor}
                variant="outlined"
                sx={{
                  fontSize: "0.75rem",
                  height: 24,
                  "& .MuiChip-label": {
                    fontWeight: 500,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                {growthIcon} vs período anterior
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Componente para gráficos
  const ChartCard = ({ title, children, height = 300 }) => (
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
          {title}
        </Typography>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "rgba(28, 28, 38, 0.95)",
            color: "#ffffff",
            p: 2,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "none",
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {statisticsService.formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
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

  const colors = statisticsService.getChartColors();

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
            Dashboard Ejecutivo
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Resumen de KPIs principales y métricas clave del negocio
          </Typography>
        </Box>

        {/* Filtros */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
        </Box>
      </Box>

      {/* KPIs Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Ventas del Mes"
            value={dashboardData?.kpis?.sales?.ventas_mes?.current || 0}
            previousValue={
              dashboardData?.kpis?.sales?.ventas_mes?.previous || 0
            }
            growth={dashboardData?.kpis?.sales?.ventas_mes?.growth || 0}
            formatted={dashboardData?.kpis?.sales?.ventas_mes?.formatted}
            icon={AttachMoney}
            color="#16a34a"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Cantidad de Ventas"
            value={dashboardData?.kpis?.sales?.cantidad_ventas?.current || 0}
            previousValue={
              dashboardData?.kpis?.sales?.cantidad_ventas?.previous || 0
            }
            growth={dashboardData?.kpis?.sales?.cantidad_ventas?.growth || 0}
            subtitle="transacciones"
            icon={ShoppingCart}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Nuevos Clientes"
            value={
              dashboardData?.kpis?.customers?.nuevos_clientes?.current || 0
            }
            previousValue={
              dashboardData?.kpis?.customers?.nuevos_clientes?.previous || 0
            }
            growth={
              dashboardData?.kpis?.customers?.nuevos_clientes?.growth || 0
            }
            subtitle="registros"
            icon={People}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KPICard
            title="Tasa de Entrega"
            value={dashboardData?.kpis?.delivery?.tasa_entrega?.current || 0}
            formatted={`${
              dashboardData?.kpis?.delivery?.tasa_entrega?.current || 0
            }%`}
            subtitle={`${
              dashboardData?.kpis?.delivery?.tasa_entrega?.entregados || 0
            }/${
              dashboardData?.kpis?.delivery?.tasa_entrega?.total || 0
            } envíos`}
            icon={LocalShipping}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Evolución de Ventas */}
        <Grid item xs={12} lg={8}>
          <ChartCard title="Evolución de Ventas" height={350}>
            {dashboardData?.charts?.salesEvolution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.charts.salesEvolution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      statisticsService.formatCurrency(value)
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke={colors[0]}
                    strokeWidth={3}
                    dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
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
                  No hay datos disponibles
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Top 5 Productos */}
        <Grid item xs={12} lg={4}>
          <ChartCard title="Top 5 Productos" height={350}>
            {dashboardData?.charts?.topProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dashboardData.charts.topProducts.slice(0, 5)}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) =>
                      statisticsService.formatCurrency(value)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="fragancia"
                    stroke="#6b7280"
                    fontSize={10}
                    width={80}
                    tickFormatter={(value) =>
                      value.length > 12 ? `${value.substring(0, 12)}...` : value
                    }
                  />
                  <Tooltip
                    formatter={[
                      (value) => statisticsService.formatCurrency(value),
                      "Ingresos",
                    ]}
                    labelFormatter={(label) => `Producto: ${label}`}
                  />
                  <Bar
                    dataKey="ingresos"
                    fill={colors[1]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
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
                  No hay datos disponibles
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Ventas por Categoría */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Ventas por Categoría" height={300}>
            {dashboardData?.charts?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="ingresos"
                    label={({ categoria, percent }) =>
                      `${categoria}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {dashboardData.charts.categoryDistribution.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={[
                      (value) => statisticsService.formatCurrency(value),
                      "Ingresos",
                    ]}
                  />
                  <Legend />
                </PieChart>
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
                  No hay datos disponibles
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Distribución Geográfica */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Distribución Geográfica" height={300}>
            {dashboardData?.charts?.geographicDistribution?.length > 0 ? (
              <Box sx={{ height: "100%", overflow: "auto" }}>
                {dashboardData.charts.geographicDistribution
                  .slice(0, 8)
                  .map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#1C1C26" }}
                        >
                          {item.provincia}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6A736A" }}>
                          {item.localidad}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#1C1C26" }}
                        >
                          {item.ingresos_formatted}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6A736A" }}>
                          {item.cantidad_ventas} ventas
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
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
                  No hay datos disponibles
                </Typography>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Resumen adicional */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid rgba(190, 191, 189, 0.15)",
              bgcolor: "#f8fafc",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
              >
                📊 Resumen del Período
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ color: "#16a34a", fontWeight: 600 }}
                    >
                      {dashboardData?.kpis?.sales?.ticket_promedio?.formatted ||
                        "$0"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Ticket Promedio
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ color: "#3b82f6", fontWeight: 600 }}
                    >
                      {dashboardData?.kpis?.products?.productos_vendidos
                        ?.current || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Productos Vendidos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ color: "#f59e0b", fontWeight: 600 }}
                    >
                      {dashboardData?.kpis?.products?.productos_vendidos
                        ?.unidades || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Unidades Totales
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ color: "#ef4444", fontWeight: 600 }}
                    >
                      {selectedPeriod === "today"
                        ? "Hoy"
                        : selectedPeriod === "week"
                        ? "Semana"
                        : selectedPeriod === "month"
                        ? "Mes"
                        : selectedPeriod === "quarter"
                        ? "Trimestre"
                        : "Año"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Período Actual
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardExecutive;
