// components/statistics/GeographicAnalysis.js
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
} from "@mui/material";
import {
  LocationOn,
  Map,
  TrendingUp,
  Analytics,
  Business,
  Public,
  Place,
  Explore,
  Assessment,
  StarRate,
  Speed,
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
  Treemap,
  ScatterChart,
  Scatter,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";

const GeographicAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [geographicData, setGeographicData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [selectedLevel, setSelectedLevel] = useState("provincia");
  const [activeTab, setActiveTab] = useState(0);

  const loadGeographicAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        metric: selectedMetric,
        level: selectedLevel,
      };
      const response = await statisticsService.getGeographicAnalysis(params);
      setGeographicData(response.data);
      setError("");
    } catch (error) {
      setError(
        "Error cargando datos geográficos. Verifique la conexión del backend."
      );
      console.error("Error loading geographic analysis:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedMetric, selectedLevel]);

  useEffect(() => {
    loadGeographicAnalysis();
  }, [loadGeographicAnalysis]);

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    progress,
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
                {progress.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  if (loading)
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
  if (error)
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  if (!geographicData)
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        No hay datos disponibles
      </Alert>
    );

  const colors = statisticsService.getChartColors();
  const {
    summary,
    by_province,
    by_city,
    concentration,
    performance,
    growth_opportunities,
    logistics,
  } = geographicData;

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
            Análisis Geográfico
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Distribución territorial, concentración de mercado y oportunidades
            de expansión
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2.5}>
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
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Métrica</InputLabel>
                <Select
                  value={selectedMetric}
                  label="Métrica"
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {statisticsService.getMetricTypes().map((metric) => (
                    <MenuItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Nivel</InputLabel>
                <Select
                  value={selectedLevel}
                  label="Nivel"
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="provincia">Por Provincia</MenuItem>
                  <MenuItem value="ciudad">Por Ciudad</MenuItem>
                  <MenuItem value="region">Por Región</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadGeographicAnalysis}
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
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Total Ubicaciones"
            value={summary?.total_ubicaciones}
            subtitle="con actividad"
            icon={Map}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Ubicaciones Activas"
            value={summary?.ubicaciones_activas}
            subtitle="con ventas recientes"
            icon={Place}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Concentración Top 5"
            value={summary?.concentracion_top_5}
            formatted={`${summary?.concentracion_top_5}%`}
            subtitle="del total"
            icon={Business}
            color="#f59e0b"
            progress={summary?.concentracion_top_5}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Dispersión"
            value={summary?.dispersion_geografica}
            formatted={`${summary?.dispersion_geografica}%`}
            subtitle="distribución"
            icon={Explore}
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Crecimiento"
            value={summary?.crecimiento_expansion}
            formatted={`${summary?.crecimiento_expansion}%`}
            subtitle="expansión"
            icon={TrendingUp}
            color="#06b6d4"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={2}>
          <MetricCard
            title="Cobertura Nacional"
            value={summary?.cobertura_nacional}
            formatted={`${summary?.cobertura_nacional}%`}
            subtitle="del territorio"
            icon={Public}
            color="#84cc16"
            progress={summary?.cobertura_nacional}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card
        sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab label="Distribución Territorial" />
            <Tab label="Concentración de Mercado" />
            <Tab label="Performance por Región" />
            <Tab label="Oportunidades" />
          </Tabs>
        </Box>

        {/* Tab 1: Distribución Territorial */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🗺️ Distribución Territorial por{" "}
              {selectedLevel === "provincia" ? "Provincia" : "Ciudad"}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      {selectedMetric === "revenue"
                        ? "Ingresos"
                        : selectedMetric === "quantity"
                        ? "Ventas"
                        : "Frecuencia"}{" "}
                      por Ubicación
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={
                            selectedLevel === "provincia"
                              ? by_province?.slice(0, 10)
                              : by_city?.slice(0, 10)
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey={
                              selectedLevel === "provincia"
                                ? "provincia"
                                : "ciudad"
                            }
                            stroke="#6b7280"
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) =>
                              selectedMetric === "revenue"
                                ? statisticsService.formatCurrency(value)
                                : statisticsService.formatNumber(value)
                            }
                          />
                          <Tooltip
                            formatter={[
                              (value) => [
                                selectedMetric === "revenue"
                                  ? statisticsService.formatCurrency(value)
                                  : statisticsService.formatNumber(value),
                                selectedMetric === "revenue"
                                  ? "Ingresos"
                                  : selectedMetric === "quantity"
                                  ? "Ventas"
                                  : "Clientes",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey={
                              selectedMetric === "revenue"
                                ? "ingresos"
                                : selectedMetric === "quantity"
                                ? "ventas"
                                : "clientes"
                            }
                            fill={colors[0]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Top 10 Ubicaciones
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                      {(selectedLevel === "provincia"
                        ? by_province?.slice(0, 10)
                        : by_city?.slice(0, 10)
                      )?.map((location, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: index < 3 ? "#f0fdf4" : "#f8fafc",
                            border: `1px solid ${
                              index < 3 ? "#bbf7d0" : "#f1f5f9"
                            }`,
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
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600, color: "#ffffff" }}
                              >
                                {index + 1}
                              </Typography>
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {selectedLevel === "provincia"
                                  ? location.provincia
                                  : location.ciudad}
                              </Typography>
                              {selectedLevel === "ciudad" && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6A736A" }}
                                >
                                  {location.provincia}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: "#10b981" }}
                            >
                              {selectedMetric === "revenue"
                                ? statisticsService.formatCurrency(
                                    location.ingresos
                                  )
                                : selectedMetric === "quantity"
                                ? `${location.ventas} ventas`
                                : `${location.clientes} clientes`}
                            </Typography>
                            {location.tasa_crecimiento && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                +{location.tasa_crecimiento}% crecimiento
                              </Typography>
                            )}
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

        {/* Tab 2: Concentración de Mercado */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🎯 Concentración y Distribución de Mercado
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Concentración Top 5 Provincias
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Top 5 Provincias",
                                value:
                                  concentration?.top_5_provinces?.percentage,
                                fill: colors[0],
                              },
                              {
                                name: "Resto del País",
                                value:
                                  100 -
                                  concentration?.top_5_provinces?.percentage,
                                fill: colors[1],
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) =>
                              `${name}: ${value?.toFixed(1)}%`
                            }
                          />
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Distribución por Regiones
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={concentration?.geographic_distribution}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="region"
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            formatter={[
                              (value) => `${value}%`,
                              "Participación",
                            ]}
                          />
                          <Bar
                            dataKey="percentage"
                            fill={colors[2]}
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

        {/* Tab 3: Performance por Región */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              📈 Performance y Métricas por Región
            </Typography>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                >
                  Métricas de Performance por Provincia
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                          Provincia
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Ticket Prom.
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Frecuencia
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          CLV
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 500, color: "#6A736A" }}
                        >
                          Eficiencia
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performance?.by_province
                        ?.slice(0, 8)
                        .map((prov, index) => (
                          <TableRow key={index}>
                            <TableCell>
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
                                    width: 28,
                                    height: 28,
                                  }}
                                >
                                  <LocationOn sx={{ fontSize: 14 }} />
                                </Avatar>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {prov.provincia}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: "#10b981", fontWeight: 500 }}
                              >
                                {statisticsService.formatCurrency(
                                  prov.ticket_promedio
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {prov.frecuencia_compra}x
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: "#3b82f6", fontWeight: 500 }}
                              >
                                {statisticsService.formatCurrency(prov.clv)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={prov.eficiencia}
                                size="small"
                                color={
                                  prov.eficiencia === "Alta"
                                    ? "success"
                                    : prov.eficiencia === "Media"
                                    ? "warning"
                                    : "error"
                                }
                                sx={{ fontSize: "0.75rem" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab 4: Oportunidades */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🚀 Oportunidades de Crecimiento y Optimización
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3, bgcolor: "#f0fdf4" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      🎯 Objetivos de Expansión
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {growth_opportunities?.expansion_targets?.map(
                        (target, index) => (
                          <Card
                            key={index}
                            sx={{ borderRadius: 2, bgcolor: "#ffffff" }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, color: "#1C1C26" }}
                                >
                                  {target.provincia}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {[...Array(5)].map((_, i) => (
                                    <StarRate
                                      key={i}
                                      sx={{
                                        fontSize: 16,
                                        color:
                                          i <
                                          Math.floor(target.potencial_score / 2)
                                            ? "#f59e0b"
                                            : "#e5e7eb",
                                      }}
                                    />
                                  ))}
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6A736A", ml: 1 }}
                                  >
                                    {target.potencial_score}/10
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#15803d" }}
                              >
                                {target.razon}
                              </Typography>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3, bgcolor: "#fef2f2" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      ⚠️ Áreas de Mejora
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {growth_opportunities?.underperforming?.map(
                        (area, index) => (
                          <Card
                            key={index}
                            sx={{ borderRadius: 2, bgcolor: "#ffffff" }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "#1C1C26",
                                  mb: 1,
                                }}
                              >
                                {area.provincia}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#dc2626",
                                  mb: 1,
                                  display: "block",
                                }}
                              >
                                <strong>Problema:</strong> {area.problema}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#059669" }}
                              >
                                <strong>Solución:</strong> {area.solucion}
                              </Typography>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
                🗺️ Resumen Ejecutivo Geográfico
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    icon: Map,
                    value: summary?.total_ubicaciones,
                    label: "Ubicaciones Totales",
                    color: "#3b82f6",
                  },
                  {
                    icon: Business,
                    value: `${summary?.concentracion_top_5}%`,
                    label: "Concentración Top 5",
                    color: "#f59e0b",
                  },
                  {
                    icon: Public,
                    value: `${summary?.cobertura_nacional}%`,
                    label: "Cobertura Nacional",
                    color: "#10b981",
                  },
                  {
                    icon: TrendingUp,
                    value: `${summary?.crecimiento_expansion}%`,
                    label: "Crecimiento Expansión",
                    color: "#06b6d4",
                  },
                ].map((item, index) => (
                  <Grid item xs={12} md={3} key={index}>
                    <Box sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: item.color,
                          mx: "auto",
                          mb: 1,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <item.icon />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{ color: "#1C1C26", fontWeight: 600 }}
                      >
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#6A736A" }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeographicAnalysis;
