// components/statistics/CustomerStatistics.js
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
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import {
  People,
  PersonAdd,
  TrendingUp,
  TrendingDown,
  LocationOn,
  MonetizationOn,
  ShoppingCart,
  Analytics,
  Star,
  Schedule,
  Group,
  AccountCircle,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";

const CustomerStatistics = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerData, setCustomerData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [segmentType, setSegmentType] = useState("rfm");
  const [activeTab, setActiveTab] = useState(0);

  // Estados para datos auxiliares
  const [provinces, setProvinces] = useState([]);

  // Función para cargar provincias (mock por ahora)
  const loadProvinces = useCallback(() => {
    const mockProvinces = [
      { id: "buenos_aires", nombre: "Buenos Aires" },
      { id: "cordoba", nombre: "Córdoba" },
      { id: "santa_fe", nombre: "Santa Fe" },
      { id: "mendoza", nombre: "Mendoza" },
      { id: "tucuman", nombre: "Tucumán" },
    ];
    setProvinces(mockProvinces);
  }, []);

  // Función para cargar estadísticas de clientes
  const loadCustomerStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        provincia: selectedProvince,
        segment_type: segmentType,
      };

      const response = await statisticsService.getCustomerStatistics(params);
      setCustomerData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando estadísticas de clientes");
      console.error("Error loading customer statistics:", error);

      // Fallback a datos mock si el backend no está disponible
      const mockData = {
        summary: {
          total_clientes: 1847,
          nuevos_clientes: 124,
          clientes_activos: 892,
          clientes_inactivos: 321,
          ticket_promedio_cliente: 15750,
          frecuencia_promedio: 2.3,
          clv_promedio: 45200,
          tasa_retencion: 67.8,
        },
        comparison: {
          nuevos_clientes_growth: 15.2,
          activos_growth: 8.7,
          ticket_growth: -3.4,
          retencion_growth: 12.1,
        },
        segments: {
          rfm: [
            {
              segment: "Champions",
              count: 234,
              percentage: 12.7,
              value: 850000,
            },
            {
              segment: "Loyal Customers",
              count: 387,
              percentage: 21.0,
              value: 650000,
            },
            {
              segment: "Potential Loyalists",
              count: 298,
              percentage: 16.1,
              value: 420000,
            },
            {
              segment: "New Customers",
              count: 156,
              percentage: 8.4,
              value: 180000,
            },
            { segment: "At Risk", count: 189, percentage: 10.2, value: 245000 },
            {
              segment: "Cannot Lose Them",
              count: 78,
              percentage: 4.2,
              value: 380000,
            },
            {
              segment: "Hibernating",
              count: 267,
              percentage: 14.5,
              value: 125000,
            },
            { segment: "Lost", count: 238, percentage: 12.9, value: 95000 },
          ],
        },
        geographic: [
          {
            provincia: "Buenos Aires",
            localidad: "CABA",
            clientes: 342,
            ingresos: 890000,
            ticket_promedio: 16200,
          },
          {
            provincia: "Buenos Aires",
            localidad: "La Plata",
            clientes: 156,
            ingresos: 420000,
            ticket_promedio: 14800,
          },
          {
            provincia: "Córdoba",
            localidad: "Córdoba Capital",
            clientes: 198,
            ingresos: 520000,
            ticket_promedio: 15600,
          },
          {
            provincia: "Santa Fe",
            localidad: "Rosario",
            clientes: 134,
            ingresos: 380000,
            ticket_promedio: 17200,
          },
          {
            provincia: "Mendoza",
            localidad: "Mendoza Capital",
            clientes: 98,
            ingresos: 290000,
            ticket_promedio: 16800,
          },
        ],
        cohorts: [
          {
            month: "Ene",
            new_customers: 145,
            retained_month_1: 98,
            retained_month_2: 67,
            retained_month_3: 45,
          },
          {
            month: "Feb",
            new_customers: 132,
            retained_month_1: 89,
            retained_month_2: 58,
            retained_month_3: 41,
          },
          {
            month: "Mar",
            new_customers: 178,
            retained_month_1: 124,
            retained_month_2: 89,
            retained_month_3: null,
          },
          {
            month: "Abr",
            new_customers: 156,
            retained_month_1: 102,
            retained_month_2: null,
            retained_month_3: null,
          },
          {
            month: "May",
            new_customers: 189,
            retained_month_1: null,
            retained_month_2: null,
            retained_month_3: null,
          },
        ],
        behavior: {
          by_purchase_frequency: [
            { frequency: "1 compra", count: 698, percentage: 37.8 },
            { frequency: "2-3 compras", count: 542, percentage: 29.3 },
            { frequency: "4-6 compras", count: 387, percentage: 21.0 },
            { frequency: "7+ compras", count: 220, percentage: 11.9 },
          ],
          by_value: [
            { range: "$0 - $10k", count: 734, percentage: 39.7 },
            { range: "$10k - $25k", count: 456, percentage: 24.7 },
            { range: "$25k - $50k", count: 389, percentage: 21.1 },
            { range: "$50k+", count: 268, percentage: 14.5 },
          ],
        },
        evolution: [
          { fecha: "2024-01", nuevos: 142, activos: 756, inactivos: 298 },
          { fecha: "2024-02", nuevos: 158, activos: 789, inactivos: 287 },
          { fecha: "2024-03", nuevos: 134, activos: 812, inactivos: 276 },
          { fecha: "2024-04", nuevos: 167, activos: 834, inactivos: 265 },
          { fecha: "2024-05", nuevos: 178, activos: 856, inactivos: 254 },
          { fecha: "2024-06", nuevos: 124, activos: 892, inactivos: 243 },
        ],
      };

      setCustomerData(mockData);
      console.log("Usando datos mock como fallback");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedProvince, segmentType]);

  // Cargar datos iniciales
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  useEffect(() => {
    loadCustomerStatistics();
  }, [loadCustomerStatistics]);

  // Componente para tarjetas de métricas
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    progress,
    trend,
    formatted,
  }) => {
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
            <Box sx={{ flex: 1 }}>
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

          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#f1f5f9",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: color,
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#6A736A", mt: 0.5, display: "block" }}
              >
                {progress.toFixed(1)}% del total
              </Typography>
            </Box>
          )}

          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
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

  // Componente para segmento RFM
  const RFMSegmentCard = ({ segment, count, percentage, value, color }) => (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(190, 191, 189, 0.15)",
        "&:hover": {
          transform: "translateY(-1px)",
          transition: "all 0.2s ease",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "#1C1C26" }}
          >
            {segment}
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{ color: "#1C1C26", fontWeight: 600, mb: 1 }}
        >
          {statisticsService.formatNumber(count)}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#6A736A", display: "block", mb: 1 }}
        >
          {percentage}% del total
        </Typography>
        <Typography variant="body2" sx={{ color: "#16a34a", fontWeight: 500 }}>
          {statisticsService.formatCurrency(value)}
        </Typography>
      </CardContent>
    </Card>
  );

  // Tab Panel Component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

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
            Estadísticas de Clientes
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Análisis demográfico, comportamiento de compra y segmentación RFM
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Provincia</InputLabel>
                <Select
                  value={selectedProvince}
                  label="Provincia"
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas las provincias</MenuItem>
                  {provinces.map((province) => (
                    <MenuItem key={province.id} value={province.id}>
                      {province.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Segmentación</InputLabel>
                <Select
                  value={segmentType}
                  label="Segmentación"
                  onChange={(e) => setSegmentType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {statisticsService.getSegmentTypes().map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadCustomerStatistics}
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

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Clientes"
            value={customerData?.summary?.total_clientes}
            subtitle="registrados"
            icon={People}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Nuevos Clientes"
            value={customerData?.summary?.nuevos_clientes}
            subtitle="este período"
            icon={PersonAdd}
            color="#16a34a"
            trend={{ growth: customerData?.comparison?.nuevos_clientes_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Clientes Activos"
            value={customerData?.summary?.clientes_activos}
            subtitle="con compras recientes"
            icon={TrendingUp}
            color="#f59e0b"
            trend={{ growth: customerData?.comparison?.activos_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tasa de Retención"
            value={customerData?.summary?.tasa_retencion}
            formatted={`${customerData?.summary?.tasa_retencion}%`}
            subtitle="mensual"
            icon={Star}
            color="#8b5cf6"
            trend={{ growth: customerData?.comparison?.retencion_growth }}
          />
        </Grid>
      </Grid>

      {/* Métricas Adicionales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Ticket Promedio"
            value={customerData?.summary?.ticket_promedio_cliente}
            formatted={statisticsService.formatCurrency(
              customerData?.summary?.ticket_promedio_cliente
            )}
            subtitle="por cliente"
            icon={MonetizationOn}
            color="#ef4444"
            trend={{ growth: customerData?.comparison?.ticket_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Frecuencia Promedio"
            value={customerData?.summary?.frecuencia_promedio}
            formatted={`${customerData?.summary?.frecuencia_promedio} compras`}
            subtitle="por cliente"
            icon={ShoppingCart}
            color="#06b6d4"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="CLV Promedio"
            value={customerData?.summary?.clv_promedio}
            formatted={statisticsService.formatCurrency(
              customerData?.summary?.clv_promedio
            )}
            subtitle="Customer Lifetime Value"
            icon={TrendingUp}
            color="#84cc16"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Clientes Inactivos"
            value={customerData?.summary?.clientes_inactivos}
            subtitle=">90 días sin compras"
            icon={Schedule}
            color="#6b7280"
          />
        </Grid>
      </Grid>

      {/* Tabs para diferentes análisis */}
      <Card
        sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Segmentación RFM" />
            <Tab label="Análisis Geográfico" />
            <Tab label="Comportamiento" />
            <Tab label="Retención" />
          </Tabs>
        </Box>

        {/* Tab 1: Segmentación RFM */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🎯 Segmentación RFM (Recency, Frequency, Monetary)
            </Typography>
            <Grid container spacing={2}>
              {customerData?.segments?.rfm?.map((segment, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <RFMSegmentCard
                    segment={segment.segment}
                    count={segment.count}
                    percentage={segment.percentage}
                    value={segment.value}
                    color={colors[index % colors.length]}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Gráfico de distribución RFM */}
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Distribución de Segmentos RFM
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerData?.segments?.rfm}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="count"
                          label={({ segment, percentage }) =>
                            `${segment}: ${percentage}%`
                          }
                          labelLine={false}
                        >
                          {customerData?.segments?.rfm?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={[
                            (value) => [
                              statisticsService.formatNumber(value),
                              "Clientes",
                            ],
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: Análisis Geográfico */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🗺️ Distribución Geográfica
            </Typography>

            <Grid container spacing={3}>
              {/* Mapa de calor simulado */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Clientes por Ubicación
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={customerData?.geographic}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="localidad"
                            stroke="#6b7280"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatNumber(value),
                                "Clientes",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="clientes"
                            fill={colors[0]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Ranking geográfico */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Top Ubicaciones
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                      {customerData?.geographic?.map((location, index) => (
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
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: colors[index % colors.length],
                                width: 32,
                                height: 32,
                              }}
                            >
                              <LocationOn sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {location.localidad}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                {location.provincia}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#1C1C26" }}
                            >
                              {location.clientes} clientes
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#16a34a" }}
                            >
                              {statisticsService.formatCurrency(
                                location.ingresos
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 3: Comportamiento */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              📊 Análisis de Comportamiento
            </Typography>

            <Grid container spacing={3}>
              {/* Por frecuencia de compra */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Por Frecuencia de Compra
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={customerData?.behavior?.by_purchase_frequency}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="count"
                            label={({ frequency, percentage }) =>
                              `${frequency}: ${percentage}%`
                            }
                          >
                            {customerData?.behavior?.by_purchase_frequency?.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Por valor gastado */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Por Valor Gastado
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={customerData?.behavior?.by_value}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="range"
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            fill={colors[1]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 4: Retención */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              📈 Análisis de Retención y Cohortes
            </Typography>

            <Grid container spacing={3}>
              {/* Evolución de clientes */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Evolución de Clientes
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={customerData?.evolution}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="fecha"
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) =>
                              new Date(value).toLocaleDateString("es-ES", {
                                month: "short",
                              })
                            }
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            labelFormatter={(value) =>
                              new Date(value).toLocaleDateString("es-ES", {
                                month: "long",
                                year: "numeric",
                              })
                            }
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="activos"
                            stackId="1"
                            stroke={colors[0]}
                            fill={colors[0]}
                            name="Activos"
                          />
                          <Area
                            type="monotone"
                            dataKey="nuevos"
                            stackId="1"
                            stroke={colors[1]}
                            fill={colors[1]}
                            name="Nuevos"
                          />
                          <Area
                            type="monotone"
                            dataKey="inactivos"
                            stackId="1"
                            stroke={colors[2]}
                            fill={colors[2]}
                            name="Inactivos"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Métricas de retención */}
              <Grid item xs={12} lg={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Card sx={{ borderRadius: 3, bgcolor: "#f0fdf4" }}>
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ color: "#16a34a", fontWeight: 600 }}
                      >
                        {customerData?.summary?.tasa_retencion}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#15803d" }}>
                        Tasa de Retención
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#16a34a", mt: 1, display: "block" }}
                      >
                        +{customerData?.comparison?.retencion_growth}% vs
                        anterior
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 3, bgcolor: "#eff6ff" }}>
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ color: "#3b82f6", fontWeight: 600 }}
                      >
                        {customerData?.summary?.frecuencia_promedio}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1d4ed8" }}>
                        Frecuencia Promedio
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#3b82f6" }}>
                        compras por cliente
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 3, bgcolor: "#fefbeb" }}>
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{ color: "#f59e0b", fontWeight: 600 }}
                      >
                        {statisticsService.formatCurrency(
                          customerData?.summary?.clv_promedio
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#d97706" }}>
                        CLV Promedio
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#f59e0b" }}>
                        Customer Lifetime Value
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>

            {/* Análisis de cohortes */}
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Análisis de Cohortes - Retención por Mes
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                            Mes
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Nuevos Clientes
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Mes 1
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Mes 2
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Mes 3
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customerData?.cohorts?.map((cohort, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {cohort.month}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={cohort.new_customers}
                                size="small"
                                sx={{ bgcolor: "#f1f5f9" }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {cohort.retained_month_1 ? (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {cohort.retained_month_1}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6A736A" }}
                                  >
                                    {(
                                      (cohort.retained_month_1 /
                                        cohort.new_customers) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#6A736A" }}
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {cohort.retained_month_2 ? (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {cohort.retained_month_2}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6A736A" }}
                                  >
                                    {(
                                      (cohort.retained_month_2 /
                                        cohort.new_customers) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#6A736A" }}
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {cohort.retained_month_3 ? (
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {cohort.retained_month_3}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6A736A" }}
                                  >
                                    {(
                                      (cohort.retained_month_3 /
                                        cohort.new_customers) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#6A736A" }}
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}
                  >
                    <Typography variant="caption" sx={{ color: "#6A736A" }}>
                      💡 <strong>Interpretación:</strong> La tabla muestra el
                      porcentaje de clientes que continúan realizando compras en
                      los meses siguientes a su primera compra. Los porcentajes
                      más altos indican mejor retención.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Card>

      {/* Resumen final */}
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
                📋 Resumen Ejecutivo de Clientes
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#3b82f6",
                        mx: "auto",
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <People />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatNumber(
                        customerData?.summary?.total_clientes
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Clientes Totales
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#16a34a",
                        mx: "auto",
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatNumber(
                        customerData?.summary?.clientes_activos
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Clientes Activos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#f59e0b",
                        mx: "auto",
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <MonetizationOn />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatCurrency(
                        customerData?.summary?.ticket_promedio_cliente
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Ticket Promedio
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#8b5cf6",
                        mx: "auto",
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <Star />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {customerData?.summary?.tasa_retencion}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Tasa de Retención
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Insights adicionales */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#ffffff",
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Typography variant="body2" sx={{ color: "#374151", mb: 1 }}>
                  <strong>🎯 Insights Clave:</strong>
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2, color: "#6B7280" }}>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    El{" "}
                    {customerData?.comparison?.nuevos_clientes_growth > 0
                      ? "crecimiento"
                      : "descenso"}{" "}
                    de nuevos clientes es del{" "}
                    {Math.abs(customerData?.comparison?.nuevos_clientes_growth)}
                    %
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    La segmentación RFM muestra{" "}
                    {customerData?.segments?.rfm?.find(
                      (s) => s.segment === "Champions"
                    )?.count || 0}{" "}
                    clientes "Champions" de alto valor
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    La tasa de retención mensual es del{" "}
                    {customerData?.summary?.tasa_retencion}%, con tendencia{" "}
                    {customerData?.comparison?.retencion_growth > 0
                      ? "positiva"
                      : "negativa"}
                  </Typography>
                  <Typography component="li" variant="body2">
                    El CLV promedio de{" "}
                    {statisticsService.formatCurrency(
                      customerData?.summary?.clv_promedio
                    )}{" "}
                    indica el valor a largo plazo de cada cliente
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerStatistics;
