// components/statistics/ShipmentStatistics.js
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
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  LocationOn,
  TrendingUp,
  TrendingDown,
  Analytics,
  MapOutlined,
  Timer,
  Route,
  Inventory,
  Error,
  HourglassEmpty,
  Done,
  Refresh,
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
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";

const ShipmentStatistics = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shipmentData, setShipmentData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedZone, setSelectedZone] = useState("all");
  const [activeTab, setActiveTab] = useState(0);

  // Estados para datos auxiliares
  const [zones, setZones] = useState([]);

  // Función para cargar zonas (mock por ahora)
  const loadZones = useCallback(() => {
    const mockZones = [
      { id: "caba", nombre: "CABA" },
      { id: "gba", nombre: "Gran Buenos Aires" },
      { id: "interior_ba", nombre: "Interior Buenos Aires" },
      { id: "cordoba", nombre: "Córdoba" },
      { id: "santa_fe", nombre: "Santa Fe" },
      { id: "resto_pais", nombre: "Resto del País" },
    ];
    setZones(mockZones);
  }, []);

  // Función para cargar estadísticas de envíos
  const loadShipmentStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        zona: selectedZone,
      };

      const response = await statisticsService.getShipmentStatistics(params);
      setShipmentData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando estadísticas de envíos");
      console.error("Error loading shipment statistics:", error);

      // Fallback a datos mock si el backend no está disponible
      const mockData = {
        summary: {
          total_envios: 2156,
          envios_entregados: 2034,
          envios_pendientes: 87,
          envios_reprogramados: 23,
          envios_no_encontrados: 12,
          tasa_entrega_exitosa: 94.3,
          tiempo_promedio_entrega: 3.2,
          costo_promedio_envio: 2850,
        },
        comparison: {
          envios_growth: 18.5,
          tasa_entrega_growth: 2.8,
          tiempo_entrega_growth: -8.2,
          costo_growth: 5.4,
        },
        geographic: {
          by_zone: [
            {
              zona: "CABA",
              envios: 687,
              entregados: 672,
              tasa_exito: 97.8,
              tiempo_promedio: 1.8,
              costo_promedio: 1850,
            },
            {
              zona: "Gran Buenos Aires",
              envios: 543,
              entregados: 516,
              tasa_exito: 95.0,
              tiempo_promedio: 2.5,
              costo_promedio: 2100,
            },
            {
              zona: "Interior Buenos Aires",
              envios: 389,
              entregados: 361,
              tasa_exito: 92.8,
              tiempo_promedio: 3.8,
              costo_promedio: 2650,
            },
            {
              zona: "Córdoba",
              envios: 298,
              entregados: 278,
              tasa_exito: 93.3,
              tiempo_promedio: 4.2,
              costo_promedio: 3200,
            },
            {
              zona: "Santa Fe",
              envios: 156,
              entregados: 145,
              tasa_exito: 92.9,
              tiempo_promedio: 4.5,
              costo_promedio: 3400,
            },
            {
              zona: "Resto del País",
              envios: 83,
              entregados: 62,
              tasa_exito: 74.7,
              tiempo_promedio: 6.8,
              costo_promedio: 4500,
            },
          ],
          heat_map: [
            {
              provincia: "Buenos Aires",
              localidad: "CABA",
              envios: 687,
              eficiencia: 97.8,
            },
            {
              provincia: "Buenos Aires",
              localidad: "La Plata",
              envios: 234,
              eficiencia: 94.2,
            },
            {
              provincia: "Buenos Aires",
              localidad: "Mar del Plata",
              envios: 156,
              eficiencia: 91.7,
            },
            {
              provincia: "Córdoba",
              localidad: "Córdoba Capital",
              envios: 198,
              eficiencia: 93.9,
            },
            {
              provincia: "Santa Fe",
              localidad: "Rosario",
              envios: 123,
              eficiencia: 92.7,
            },
            {
              provincia: "Mendoza",
              localidad: "Mendoza Capital",
              envios: 89,
              eficiencia: 88.8,
            },
          ],
        },
        states: {
          flow: [
            {
              estado: "Despachado",
              count: 2156,
              percentage: 100,
              color: "#3b82f6",
            },
            {
              estado: "En Tránsito",
              count: 2089,
              percentage: 96.9,
              color: "#f59e0b",
            },
            {
              estado: "En Reparto",
              count: 2057,
              percentage: 95.4,
              color: "#8b5cf6",
            },
            {
              estado: "Entregado",
              count: 2034,
              percentage: 94.3,
              color: "#10b981",
            },
            {
              estado: "Reprogramado",
              count: 23,
              percentage: 1.1,
              color: "#f97316",
            },
            {
              estado: "No Encontrado",
              count: 12,
              percentage: 0.6,
              color: "#ef4444",
            },
          ],
          evolution: [
            {
              fecha: "2024-01",
              entregados: 289,
              reprogramados: 18,
              no_encontrados: 8,
              pendientes: 12,
            },
            {
              fecha: "2024-02",
              entregados: 312,
              reprogramados: 15,
              no_encontrados: 6,
              pendientes: 14,
            },
            {
              fecha: "2024-03",
              entregados: 334,
              reprogramados: 12,
              no_encontrados: 5,
              pendientes: 16,
            },
            {
              fecha: "2024-04",
              entregados: 356,
              reprogramados: 14,
              no_encontrados: 7,
              pendientes: 13,
            },
            {
              fecha: "2024-05",
              entregados: 378,
              reprogramados: 11,
              no_encontrados: 4,
              pendientes: 15,
            },
            {
              fecha: "2024-06",
              entregados: 365,
              reprogramados: 13,
              no_encontrados: 3,
              pendientes: 17,
            },
          ],
        },
        timing: {
          delivery_distribution: [
            {
              rango: "Mismo día",
              count: 156,
              percentage: 7.2,
              zona_principal: "CABA",
            },
            {
              rango: "1 día",
              count: 542,
              percentage: 25.1,
              zona_principal: "CABA/GBA",
            },
            {
              rango: "2-3 días",
              count: 789,
              percentage: 36.6,
              zona_principal: "Buenos Aires",
            },
            {
              rango: "4-5 días",
              count: 456,
              percentage: 21.2,
              zona_principal: "Interior",
            },
            {
              rango: "6-7 días",
              count: 167,
              percentage: 7.7,
              zona_principal: "Lejano",
            },
            {
              rango: "+7 días",
              count: 46,
              percentage: 2.1,
              zona_principal: "Problemático",
            },
          ],
          by_zone_detailed: {
            CABA: {
              promedio: 1.8,
              mismo_dia: 22.1,
              hasta_2_dias: 89.4,
              mas_5_dias: 2.3,
            },
            "Gran Buenos Aires": {
              promedio: 2.5,
              mismo_dia: 8.7,
              hasta_2_dias: 67.2,
              mas_5_dias: 4.1,
            },
            "Interior Buenos Aires": {
              promedio: 3.8,
              mismo_dia: 2.1,
              hasta_2_dias: 31.4,
              mas_5_dias: 12.6,
            },
            Córdoba: {
              promedio: 4.2,
              mismo_dia: 0.7,
              hasta_2_dias: 18.8,
              mas_5_dias: 15.4,
            },
            "Santa Fe": {
              promedio: 4.5,
              mismo_dia: 0.0,
              hasta_2_dias: 12.2,
              mas_5_dias: 18.9,
            },
            "Resto del País": {
              promedio: 6.8,
              mismo_dia: 0.0,
              hasta_2_dias: 3.6,
              mas_5_dias: 44.6,
            },
          },
        },
        efficiency: {
          distributors: [
            {
              distribuidor: "Envío Express",
              envios: 687,
              tasa_exito: 96.8,
              tiempo_promedio: 2.1,
              costo_promedio: 2650,
            },
            {
              distribuidor: "Logística Rápida",
              envios: 543,
              tasa_exito: 94.5,
              tiempo_promedio: 2.8,
              costo_promedio: 2450,
            },
            {
              distribuidor: "Correo Nacional",
              envios: 456,
              tasa_exito: 91.2,
              tiempo_promedio: 4.2,
              costo_promedio: 1850,
            },
            {
              distribuidor: "Distribución Local",
              envios: 298,
              tasa_exito: 93.6,
              tiempo_promedio: 3.5,
              costo_promedio: 2100,
            },
            {
              distribuidor: "Otros",
              envios: 172,
              tasa_exito: 88.4,
              tiempo_promedio: 5.1,
              costo_promedio: 3200,
            },
          ],
          batch_analysis: [
            {
              lote: "Lote Mañana",
              envios: 1287,
              tasa_exito: 95.7,
              eficiencia: "Alta",
            },
            {
              lote: "Lote Tarde",
              envios: 689,
              tasa_exito: 92.1,
              eficiencia: "Media",
            },
            {
              lote: "Lote Express",
              envios: 180,
              tasa_exito: 97.2,
              eficiencia: "Muy Alta",
            },
          ],
        },
        costs: {
          by_zone: [
            {
              zona: "CABA",
              costo_promedio: 1850,
              volumen: 687,
              total: 1271950,
            },
            {
              zona: "Gran Buenos Aires",
              costo_promedio: 2100,
              volumen: 543,
              total: 1140300,
            },
            {
              zona: "Interior Buenos Aires",
              costo_promedio: 2650,
              volumen: 389,
              total: 1030850,
            },
            {
              zona: "Córdoba",
              costo_promedio: 3200,
              volumen: 298,
              total: 953600,
            },
            {
              zona: "Santa Fe",
              costo_promedio: 3400,
              volumen: 156,
              total: 530400,
            },
            {
              zona: "Resto del País",
              costo_promedio: 4500,
              volumen: 83,
              total: 373500,
            },
          ],
          evolution: [
            { fecha: "2024-01", costo_promedio: 2650, total_costos: 865750 },
            { fecha: "2024-02", costo_promedio: 2720, total_costos: 901840 },
            { fecha: "2024-03", costo_promedio: 2780, total_costos: 975620 },
            { fecha: "2024-04", costo_promedio: 2820, total_costos: 1028140 },
            { fecha: "2024-05", costo_promedio: 2850, total_costos: 1108450 },
            { fecha: "2024-06", costo_promedio: 2890, total_costos: 1106320 },
          ],
        },
      };

      setShipmentData(mockData);
      console.log("Usando datos mock como fallback para shipments");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedZone]);

  // Cargar datos iniciales
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  useEffect(() => {
    loadShipmentStatistics();
  }, [loadShipmentStatistics]);

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
                {progress.toFixed(1)}% de éxito
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

  // Componente para zona geográfica
  const ZoneCard = ({
    zona,
    envios,
    entregados,
    tasa_exito,
    tiempo_promedio,
    costo_promedio,
    color,
    index,
  }) => (
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
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{ bgcolor: `${color}20`, color: color, width: 40, height: 40 }}
          >
            <LocationOn sx={{ fontSize: 20 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#1C1C26" }}
            >
              {zona}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6A736A" }}>
              {envios} envíos totales
            </Typography>
          </Box>
          <Chip
            label={`${tasa_exito}%`}
            size="small"
            color={
              tasa_exito >= 95
                ? "success"
                : tasa_exito >= 90
                ? "warning"
                : "error"
            }
            sx={{ fontSize: "0.75rem" }}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ color: "#10b981", fontWeight: 600 }}
              >
                {entregados}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                Entregados
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ color: "#f59e0b", fontWeight: 600 }}
              >
                {tiempo_promedio} días
              </Typography>
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                Promedio
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 2,
            p: 1,
            bgcolor: "#f8fafc",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "#6A736A" }}>
            Costo:{" "}
            <strong>{statisticsService.formatCurrency(costo_promedio)}</strong>
          </Typography>
        </Box>
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
            Estadísticas de Envíos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Análisis de logística, entregas y eficiencia por zona geográfica
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
                <InputLabel>Zona</InputLabel>
                <Select
                  value={selectedZone}
                  label="Zona"
                  onChange={(e) => setSelectedZone(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">Todas las zonas</MenuItem>
                  {zones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadShipmentStatistics}
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
            title="Total Envíos"
            value={shipmentData?.summary?.total_envios}
            subtitle="operaciones"
            icon={LocalShipping}
            color="#3b82f6"
            trend={{ growth: shipmentData?.comparison?.envios_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tasa de Entrega"
            value={shipmentData?.summary?.tasa_entrega_exitosa}
            formatted={`${shipmentData?.summary?.tasa_entrega_exitosa}%`}
            subtitle={`${shipmentData?.summary?.envios_entregados} exitosas`}
            icon={CheckCircle}
            color="#10b981"
            progress={shipmentData?.summary?.tasa_entrega_exitosa}
            trend={{ growth: shipmentData?.comparison?.tasa_entrega_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tiempo Promedio"
            value={shipmentData?.summary?.tiempo_promedio_entrega}
            formatted={`${shipmentData?.summary?.tiempo_promedio_entrega} días`}
            subtitle="de entrega"
            icon={Timer}
            color="#f59e0b"
            trend={{ growth: shipmentData?.comparison?.tiempo_entrega_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Costo Promedio"
            value={shipmentData?.summary?.costo_promedio_envio}
            formatted={statisticsService.formatCurrency(
              shipmentData?.summary?.costo_promedio_envio
            )}
            subtitle="por envío"
            icon={TrendingUp}
            color="#8b5cf6"
            trend={{ growth: shipmentData?.comparison?.costo_growth }}
          />
        </Grid>
      </Grid>

      {/* Métricas adicionales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Envíos Pendientes"
            value={shipmentData?.summary?.envios_pendientes}
            subtitle="en proceso"
            icon={HourglassEmpty}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Reprogramados"
            value={shipmentData?.summary?.envios_reprogramados}
            subtitle="reintentados"
            icon={Refresh}
            color="#f97316"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="No Encontrados"
            value={shipmentData?.summary?.envios_no_encontrados}
            subtitle="problemáticos"
            icon={Error}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Zona Filtrada"
            value={
              selectedZone === "all"
                ? "Todas"
                : zones.find((z) => z.id === selectedZone)?.nombre || "Zona"
            }
            subtitle="análisis actual"
            icon={MapOutlined}
            color="#06b6d4"
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
            <Tab label="Análisis Geográfico" />
            <Tab label="Estados y Flujo" />
            <Tab label="Tiempos de Entrega" />
            <Tab label="Eficiencia y Costos" />
          </Tabs>
        </Box>

        {/* Tab 1: Análisis Geográfico */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🗺️ Distribución Geográfica y Eficiencia por Zona
            </Typography>

            {/* Cards por zona */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {shipmentData?.geographic?.by_zone?.map((zone, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ZoneCard
                    zona={zone.zona}
                    envios={zone.envios}
                    entregados={zone.entregados}
                    tasa_exito={zone.tasa_exito}
                    tiempo_promedio={zone.tiempo_promedio}
                    costo_promedio={zone.costo_promedio}
                    color={colors[index % colors.length]}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              {/* Gráfico de entregas por zona */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Entregas por Zona
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shipmentData?.geographic?.by_zone}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="zona"
                            stroke="#6b7280"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="entregados"
                            fill={colors[0]}
                            name="Entregados"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="envios"
                            fill={colors[1]}
                            name="Total Envíos"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Mapa de calor de eficiencia */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Mapa de Eficiencia
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                      {shipmentData?.geographic?.heat_map?.map(
                        (location, index) => (
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
                                sx={{
                                  fontWeight: 500,
                                  color:
                                    location.eficiencia >= 95
                                      ? "#10b981"
                                      : location.eficiencia >= 90
                                      ? "#f59e0b"
                                      : "#ef4444",
                                }}
                              >
                                {location.eficiencia}%
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                {location.envios} envíos
                              </Typography>
                            </Box>
                          </Box>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Tab 2: Estados y Flujo */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              📦 Flujo de Estados de Envíos
            </Typography>

            <Grid container spacing={3}>
              {/* Flujo de estados */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Pipeline de Estados
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shipmentData?.states?.flow}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="estado"
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatNumber(value),
                                "Envíos",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="count"
                            radius={[4, 4, 0, 0]}
                            fill={(entry) => entry.color || colors[0]}
                          >
                            {shipmentData?.states?.flow?.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color || colors[index % colors.length]
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Estados resumidos */}
              <Grid item xs={12} lg={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {shipmentData?.states?.flow?.map((state, index) => (
                    <Card
                      key={index}
                      sx={{
                        borderRadius: 3,
                        bgcolor:
                          state.estado === "Entregado"
                            ? "#f0fdf4"
                            : state.estado === "No Encontrado"
                            ? "#fef2f2"
                            : "#f8fafc",
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
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
                            {state.estado}
                          </Typography>
                          <Chip
                            label={`${state.percentage}%`}
                            size="small"
                            sx={{
                              bgcolor:
                                state.color || colors[index % colors.length],
                              color: "#ffffff",
                              fontSize: "0.75rem",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "#1C1C26", fontWeight: 600 }}
                        >
                          {statisticsService.formatNumber(state.count)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6A736A" }}>
                          envíos en este estado
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>

            {/* Evolución temporal de estados */}
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Evolución de Estados por Mes
                  </Typography>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={shipmentData?.states?.evolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
                          dataKey="entregados"
                          stackId="1"
                          stroke={colors[0]}
                          fill={colors[0]}
                          name="Entregados"
                        />
                        <Area
                          type="monotone"
                          dataKey="pendientes"
                          stackId="1"
                          stroke={colors[1]}
                          fill={colors[1]}
                          name="Pendientes"
                        />
                        <Area
                          type="monotone"
                          dataKey="reprogramados"
                          stackId="1"
                          stroke={colors[2]}
                          fill={colors[2]}
                          name="Reprogramados"
                        />
                        <Area
                          type="monotone"
                          dataKey="no_encontrados"
                          stackId="1"
                          stroke={colors[3]}
                          fill={colors[3]}
                          name="No Encontrados"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 3: Tiempos de Entrega */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              ⏱️ Análisis de Tiempos de Entrega
            </Typography>

            <Grid container spacing={3}>
              {/* Distribución de tiempos */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Distribución de Tiempos
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={shipmentData?.timing?.delivery_distribution}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="rango"
                            stroke="#6b7280"
                            fontSize={12}
                          />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatNumber(value),
                                "Envíos",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="count"
                            fill={colors[2]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Gráfico circular de distribución */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Porcentajes de Entrega
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={shipmentData?.timing?.delivery_distribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="count"
                            label={({ rango, percentage }) =>
                              `${rango}: ${percentage}%`
                            }
                            labelLine={false}
                          >
                            {shipmentData?.timing?.delivery_distribution?.map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detalles por zona */}
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Tiempos Detallados por Zona
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                            Zona
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Promedio (días)
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Mismo Día
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Hasta 2 días
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Más de 5 días
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(
                          shipmentData?.timing?.by_zone_detailed || {}
                        ).map(([zone, details], index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {zone}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${details.promedio} días`}
                                size="small"
                                color={
                                  details.promedio <= 2
                                    ? "success"
                                    : details.promedio <= 4
                                    ? "warning"
                                    : "error"
                                }
                                sx={{ fontSize: "0.75rem" }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: "#10b981", fontWeight: 500 }}
                              >
                                {details.mismo_dia}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: "#3b82f6", fontWeight: 500 }}
                              >
                                {details.hasta_2_dias}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                sx={{ color: "#ef4444", fontWeight: 500 }}
                              >
                                {details.mas_5_dias}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 4: Eficiencia y Costos */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              💰 Análisis de Eficiencia y Costos
            </Typography>

            <Grid container spacing={3}>
              {/* Eficiencia por distribuidor */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Rendimiento por Distribuidor
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{ fontWeight: 500, color: "#6A736A" }}
                            >
                              Distribuidor
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 500, color: "#6A736A" }}
                            >
                              Envíos
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 500, color: "#6A736A" }}
                            >
                              Tasa Éxito
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 500, color: "#6A736A" }}
                            >
                              Tiempo Prom.
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: 500, color: "#6A736A" }}
                            >
                              Costo Prom.
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {shipmentData?.efficiency?.distributors?.map(
                            (dist, index) => (
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
                                        width: 32,
                                        height: 32,
                                      }}
                                    >
                                      <LocalShipping sx={{ fontSize: 16 }} />
                                    </Avatar>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {dist.distribuidor}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {statisticsService.formatNumber(
                                      dist.envios
                                    )}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={`${dist.tasa_exito}%`}
                                    size="small"
                                    color={
                                      dist.tasa_exito >= 95
                                        ? "success"
                                        : dist.tasa_exito >= 90
                                        ? "warning"
                                        : "error"
                                    }
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {dist.tiempo_promedio} días
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#10b981", fontWeight: 500 }}
                                  >
                                    {statisticsService.formatCurrency(
                                      dist.costo_promedio
                                    )}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Análisis de lotes */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Eficiencia por Lote
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {shipmentData?.efficiency?.batch_analysis?.map(
                        (batch, index) => (
                          <Card
                            key={index}
                            sx={{ borderRadius: 2, bgcolor: "#f8fafc" }}
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
                                  {batch.lote}
                                </Typography>
                                <Chip
                                  label={batch.eficiencia}
                                  size="small"
                                  color={
                                    batch.eficiencia === "Muy Alta"
                                      ? "success"
                                      : batch.eficiencia === "Alta"
                                      ? "success"
                                      : batch.eficiencia === "Media"
                                      ? "warning"
                                      : "default"
                                  }
                                  sx={{ fontSize: "0.75rem" }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ color: "#6A736A", mb: 1 }}
                              >
                                {statisticsService.formatNumber(batch.envios)}{" "}
                                envíos
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{ color: "#1C1C26", fontWeight: 600 }}
                              >
                                {batch.tasa_exito}% éxito
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

            {/* Costos por zona y evolución */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Costos por zona */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Costos por Zona
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={shipmentData?.costs?.by_zone}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="zona"
                            stroke="#6b7280"
                            fontSize={10}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) =>
                              statisticsService.formatCurrency(value)
                            }
                          />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatCurrency(value),
                                "Costo Promedio",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="costo_promedio"
                            fill={colors[4]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Evolución de costos */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Evolución de Costos
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={shipmentData?.costs?.evolution}>
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
                          <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickFormatter={(value) =>
                              statisticsService.formatCurrency(value)
                            }
                          />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatCurrency(value),
                                "Costo",
                              ],
                            ]}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="costo_promedio"
                            stroke={colors[0]}
                            strokeWidth={3}
                            dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                            name="Costo Promedio"
                          />
                        </LineChart>
                      </ResponsiveContainer>
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
                🚚 Resumen Ejecutivo de Envíos
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
                      <LocalShipping />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatNumber(
                        shipmentData?.summary?.total_envios
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Envíos Totales
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#10b981",
                        mx: "auto",
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <CheckCircle />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {shipmentData?.summary?.tasa_entrega_exitosa}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Tasa de Entrega
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
                      <Timer />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {shipmentData?.summary?.tiempo_promedio_entrega} días
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Tiempo Promedio
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
                      <TrendingUp />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatCurrency(
                        shipmentData?.summary?.costo_promedio_envio
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Costo Promedio
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
                    La zona más eficiente es{" "}
                    {shipmentData?.geographic?.by_zone?.[0]?.zona} con{" "}
                    {shipmentData?.geographic?.by_zone?.[0]?.tasa_exito}% de
                    entregas exitosas
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    El tiempo de entrega promedio{" "}
                    {shipmentData?.comparison?.tiempo_entrega_growth < 0
                      ? "mejoró"
                      : "empeoró"}{" "}
                    un{" "}
                    {Math.abs(shipmentData?.comparison?.tiempo_entrega_growth)}%
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    {shipmentData?.summary?.envios_pendientes} envíos están
                    pendientes y {shipmentData?.summary?.envios_reprogramados}{" "}
                    requieren reprogramación
                  </Typography>
                  <Typography component="li" variant="body2">
                    El costo promedio por envío es{" "}
                    {statisticsService.formatCurrency(
                      shipmentData?.summary?.costo_promedio_envio
                    )}{" "}
                    con tendencia{" "}
                    {shipmentData?.comparison?.costo_growth > 0
                      ? "alcista"
                      : "bajista"}
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

export default ShipmentStatistics;
