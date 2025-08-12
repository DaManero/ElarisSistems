// components/statistics/PaymentStatistics.js
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
  Payment,
  CreditCard,
  AccountBalance,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  Schedule,
  Analytics,
  MonetizationOn,
  Receipt,
  Error,
  HourglassEmpty,
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
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";

const PaymentStatistics = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentData, setPaymentData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState(0);

  // Función para cargar estadísticas de pagos
  const loadPaymentStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
      };

      const response = await statisticsService.getPaymentStatistics(params);
      setPaymentData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando estadísticas de pagos");
      console.error("Error loading payment statistics:", error);

      // Fallback a datos mock si el backend no está disponible
      const mockData = {
        summary: {
          total_transacciones: 2847,
          monto_total: 4250000,
          monto_promedio: 14920,
          transacciones_exitosas: 2698,
          transacciones_pendientes: 89,
          transacciones_fallidas: 60,
          tasa_exito: 94.8,
          tiempo_promedio_cobro: 2.3,
        },
        comparison: {
          transacciones_growth: 12.4,
          monto_growth: 8.7,
          tasa_exito_growth: 2.1,
          tiempo_cobro_growth: -15.6,
        },
        methods: {
          distribution: [
            {
              metodo: "Tarjeta de Crédito",
              count: 1256,
              percentage: 44.1,
              monto: 1870000,
              promedio: 14890,
            },
            {
              metodo: "Transferencia Bancaria",
              count: 684,
              percentage: 24.0,
              monto: 1280000,
              promedio: 18713,
            },
            {
              metodo: "Tarjeta de Débito",
              count: 512,
              percentage: 18.0,
              monto: 765000,
              promedio: 14941,
            },
            {
              metodo: "Efectivo",
              count: 298,
              percentage: 10.5,
              monto: 298000,
              promedio: 10000,
            },
            {
              metodo: "Billetera Digital",
              count: 97,
              percentage: 3.4,
              monto: 137000,
              promedio: 14124,
            },
          ],
          trends: [
            {
              fecha: "2024-01",
              credito: 156000,
              debito: 89000,
              transferencia: 134000,
              efectivo: 45000,
              digital: 12000,
            },
            {
              fecha: "2024-02",
              credito: 178000,
              debito: 98000,
              transferencia: 145000,
              efectivo: 42000,
              digital: 15000,
            },
            {
              fecha: "2024-03",
              credito: 189000,
              debito: 105000,
              transferencia: 156000,
              efectivo: 38000,
              digital: 18000,
            },
            {
              fecha: "2024-04",
              credito: 201000,
              debito: 112000,
              transferencia: 167000,
              efectivo: 35000,
              digital: 22000,
            },
            {
              fecha: "2024-05",
              credito: 195000,
              debito: 108000,
              transferencia: 172000,
              efectivo: 32000,
              digital: 25000,
            },
            {
              fecha: "2024-06",
              credito: 187000,
              debito: 102000,
              transferencia: 178000,
              efectivo: 28000,
              digital: 28000,
            },
          ],
        },
        states: {
          flow: [
            { estado: "Iniciado", count: 2847, percentage: 100 },
            { estado: "Procesando", count: 2787, percentage: 97.9 },
            { estado: "Exitoso", count: 2698, percentage: 94.8 },
            { estado: "Fallido", count: 60, percentage: 2.1 },
            { estado: "Pendiente", count: 89, percentage: 3.1 },
          ],
          by_method: {
            "Tarjeta de Crédito": {
              exitoso: 1198,
              fallido: 35,
              pendiente: 23,
              tasa_exito: 95.4,
            },
            "Transferencia Bancaria": {
              exitoso: 665,
              fallido: 8,
              pendiente: 11,
              tasa_exito: 97.2,
            },
            "Tarjeta de Débito": {
              exitoso: 487,
              fallido: 15,
              pendiente: 10,
              tasa_exito: 95.1,
            },
            Efectivo: {
              exitoso: 298,
              fallido: 0,
              pendiente: 0,
              tasa_exito: 100,
            },
            "Billetera Digital": {
              exitoso: 90,
              fallido: 2,
              pendiente: 5,
              tasa_exito: 92.8,
            },
          },
        },
        timing: {
          collection_time: [
            { rango: "Inmediato", count: 395, percentage: 13.9 },
            { rango: "1-2 días", count: 1698, percentage: 59.6 },
            { rango: "3-5 días", count: 598, percentage: 21.0 },
            { rango: "6-10 días", count: 123, percentage: 4.3 },
            { rango: "+10 días", count: 33, percentage: 1.2 },
          ],
          by_method: {
            Efectivo: 0,
            "Tarjeta de Débito": 0.5,
            "Tarjeta de Crédito": 1.8,
            "Billetera Digital": 2.1,
            "Transferencia Bancaria": 3.2,
          },
        },
        projections: {
          pending_collections: [
            { fecha: "Próximos 7 días", monto: 156000, transacciones: 23 },
            { fecha: "Próximos 15 días", monto: 289000, transacciones: 45 },
            { fecha: "Próximos 30 días", monto: 467000, transacciones: 78 },
          ],
        },
      };

      setPaymentData(mockData);
      console.log("Usando datos mock como fallback para payments");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  // Cargar datos iniciales
  useEffect(() => {
    loadPaymentStatistics();
  }, [loadPaymentStatistics]);

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
                {progress.toFixed(1)}%
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

  // Componente para método de pago
  const PaymentMethodCard = ({
    method,
    count,
    percentage,
    monto,
    promedio,
    color,
    icon,
  }) => {
    const Icon = icon;

    return (
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
              sx={{
                bgcolor: `${color}20`,
                color: color,
                width: 40,
                height: 40,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#1C1C26" }}
              >
                {method}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                {percentage}% del total
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#1C1C26", fontWeight: 600 }}
              >
                {statisticsService.formatNumber(count)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                transacciones
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="h6"
                sx={{ color: "#16a34a", fontWeight: 600 }}
              >
                {statisticsService.formatCurrency(monto)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6A736A" }}>
                total
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 1,
              bgcolor: "#f8fafc",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "#6A736A" }}>
              Promedio:{" "}
              <strong>{statisticsService.formatCurrency(promedio)}</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Tab Panel Component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  // Función para obtener icono de método de pago
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Tarjeta de Crédito":
        return CreditCard;
      case "Tarjeta de Débito":
        return CreditCard;
      case "Transferencia Bancaria":
        return AccountBalance;
      case "Efectivo":
        return AttachMoney;
      case "Billetera Digital":
        return Payment;
      default:
        return Payment;
    }
  };

  // Función para obtener color de método de pago
  const getPaymentMethodColor = (index) => {
    const colors = statisticsService.getChartColors();
    return colors[index % colors.length];
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
            Estadísticas de Pagos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Análisis de métodos de pago, estados de transacciones y tiempos de
            cobro
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadPaymentStatistics}
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
            title="Total Transacciones"
            value={paymentData?.summary?.total_transacciones}
            subtitle="operaciones"
            icon={Receipt}
            color="#3b82f6"
            trend={{ growth: paymentData?.comparison?.transacciones_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Monto Total"
            value={paymentData?.summary?.monto_total}
            formatted={statisticsService.formatCurrency(
              paymentData?.summary?.monto_total
            )}
            subtitle="procesado"
            icon={MonetizationOn}
            color="#16a34a"
            trend={{ growth: paymentData?.comparison?.monto_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tasa de Éxito"
            value={paymentData?.summary?.tasa_exito}
            formatted={`${paymentData?.summary?.tasa_exito}%`}
            subtitle={`${paymentData?.summary?.transacciones_exitosas} exitosas`}
            icon={CheckCircle}
            color="#10b981"
            progress={paymentData?.summary?.tasa_exito}
            trend={{ growth: paymentData?.comparison?.tasa_exito_growth }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Tiempo Promedio"
            value={paymentData?.summary?.tiempo_promedio_cobro}
            formatted={`${paymentData?.summary?.tiempo_promedio_cobro} días`}
            subtitle="de cobro"
            icon={Schedule}
            color="#f59e0b"
            trend={{ growth: paymentData?.comparison?.tiempo_cobro_growth }}
          />
        </Grid>
      </Grid>

      {/* Métricas adicionales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Transacciones Pendientes"
            value={paymentData?.summary?.transacciones_pendientes}
            subtitle="en proceso"
            icon={HourglassEmpty}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Transacciones Fallidas"
            value={paymentData?.summary?.transacciones_fallidas}
            subtitle="rechazadas"
            icon={Error}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Monto Promedio"
            value={paymentData?.summary?.monto_promedio}
            formatted={statisticsService.formatCurrency(
              paymentData?.summary?.monto_promedio
            )}
            subtitle="por transacción"
            icon={TrendingUp}
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Período Actual"
            value={
              selectedPeriod === "today"
                ? "Hoy"
                : selectedPeriod === "week"
                ? "Semana"
                : selectedPeriod === "month"
                ? "Mes"
                : "Año"
            }
            subtitle="análisis"
            icon={Analytics}
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
            <Tab label="Métodos de Pago" />
            <Tab label="Estados y Flujo" />
            <Tab label="Tiempos de Cobro" />
            <Tab label="Proyecciones" />
          </Tabs>
        </Box>

        {/* Tab 1: Métodos de Pago */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              💳 Distribución por Método de Pago
            </Typography>

            {/* Cards de métodos */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {paymentData?.methods?.distribution?.map((method, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <PaymentMethodCard
                    method={method.metodo}
                    count={method.count}
                    percentage={method.percentage}
                    monto={method.monto}
                    promedio={method.promedio}
                    color={getPaymentMethodColor(index)}
                    icon={getPaymentMethodIcon(method.metodo)}
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              {/* Gráfico de distribución */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Distribución por Transacciones
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentData?.methods?.distribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="count"
                            label={({ metodo, percentage }) =>
                              `${metodo}: ${percentage}%`
                            }
                            labelLine={false}
                          >
                            {paymentData?.methods?.distribution?.map(
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
                              (value) => [
                                statisticsService.formatNumber(value),
                                "Transacciones",
                              ],
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Evolución temporal */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Evolución de Métodos de Pago
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={paymentData?.methods?.trends}>
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
                            formatter={(value, name) => [
                              statisticsService.formatCurrency(value),
                              name,
                            ]}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="credito"
                            stackId="1"
                            stroke={colors[0]}
                            fill={colors[0]}
                            name="Tarjeta Crédito"
                          />
                          <Area
                            type="monotone"
                            dataKey="transferencia"
                            stackId="1"
                            stroke={colors[1]}
                            fill={colors[1]}
                            name="Transferencia"
                          />
                          <Area
                            type="monotone"
                            dataKey="debito"
                            stackId="1"
                            stroke={colors[2]}
                            fill={colors[2]}
                            name="Tarjeta Débito"
                          />
                          <Area
                            type="monotone"
                            dataKey="efectivo"
                            stackId="1"
                            stroke={colors[3]}
                            fill={colors[3]}
                            name="Efectivo"
                          />
                          <Area
                            type="monotone"
                            dataKey="digital"
                            stackId="1"
                            stroke={colors[4]}
                            fill={colors[4]}
                            name="Digital"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
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
              🔄 Flujo de Estados de Transacciones
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
                      Embudo de Conversión
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={paymentData?.states?.flow}
                          layout="horizontal"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis type="number" stroke="#6b7280" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="estado"
                            stroke="#6b7280"
                            fontSize={12}
                            width={80}
                          />
                          <Tooltip
                            formatter={[
                              (value) => [
                                statisticsService.formatNumber(value),
                                "Transacciones",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="count"
                            fill={colors[0]}
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tasa de éxito por método */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Éxito por Método
                    </Typography>
                    <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                      {Object.entries(paymentData?.states?.by_method || {}).map(
                        ([method, stats], index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              mb: 2,
                              borderRadius: 2,
                              bgcolor: "#f8fafc",
                              border: "1px solid #f1f5f9",
                            }}
                          >
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
                                {method}
                              </Typography>
                              <Chip
                                label={`${stats.tasa_exito}%`}
                                size="small"
                                color={
                                  stats.tasa_exito >= 95
                                    ? "success"
                                    : stats.tasa_exito >= 90
                                    ? "warning"
                                    : "error"
                                }
                                sx={{ fontSize: "0.75rem" }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.75rem",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#16a34a" }}
                              >
                                ✓ {stats.exitoso}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#ef4444" }}
                              >
                                ✗ {stats.fallido}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#f59e0b" }}
                              >
                                ⏳ {stats.pendiente}
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

        {/* Tab 3: Tiempos de Cobro */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              ⏱️ Análisis de Tiempos de Cobro
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
                      Distribución de Tiempos de Cobro
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentData?.timing?.collection_time}>
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
                                "Transacciones",
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

              {/* Tiempo promedio por método */}
              <Grid item xs={12} lg={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Tiempo Promedio por Método
                    </Typography>
                    <Box
                      sx={{
                        height: 350,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      {Object.entries(paymentData?.timing?.by_method || {}).map(
                        ([method, days], index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 2,
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
                                {React.createElement(
                                  getPaymentMethodIcon(method),
                                  { sx: { fontSize: 16 } }
                                )}
                              </Avatar>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: "#1C1C26" }}
                              >
                                {method}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color:
                                    days === 0
                                      ? "#16a34a"
                                      : days <= 2
                                      ? "#f59e0b"
                                      : "#ef4444",
                                  fontWeight: 600,
                                }}
                              >
                                {days === 0 ? "Inmediato" : `${days} días`}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#6A736A" }}
                              >
                                promedio
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

            {/* Resumen de tiempos */}
            <Box sx={{ mt: 3 }}>
              <Card sx={{ borderRadius: 3, bgcolor: "#f0f9ff" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "#1C1C26", fontWeight: 500 }}
                  >
                    📊 Resumen de Tiempos
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#16a34a", fontWeight: 600 }}
                        >
                          {paymentData?.timing?.collection_time?.find(
                            (t) => t.rango === "Inmediato"
                          )?.percentage || 0}
                          %
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6A736A" }}>
                          Cobros Inmediatos
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#3b82f6", fontWeight: 600 }}
                        >
                          {(paymentData?.timing?.collection_time?.find(
                            (t) => t.rango === "1-2 días"
                          )?.percentage || 0) +
                            (paymentData?.timing?.collection_time?.find(
                              (t) => t.rango === "Inmediato"
                            )?.percentage || 0)}
                          %
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6A736A" }}>
                          En 48 horas
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#f59e0b", fontWeight: 600 }}
                        >
                          {paymentData?.summary?.tiempo_promedio_cobro}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6A736A" }}>
                          Días Promedio
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h4"
                          sx={{ color: "#ef4444", fontWeight: 600 }}
                        >
                          {paymentData?.timing?.collection_time?.find(
                            (t) => t.rango === "+10 días"
                          )?.percentage || 0}
                          %
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6A736A" }}>
                          Cobros Tardíos
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 4: Proyecciones */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
            >
              🔮 Proyecciones de Cobro
            </Typography>

            <Grid container spacing={3}>
              {/* Proyecciones de cobros pendientes */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Cobros Pendientes Proyectados
                    </Typography>
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={paymentData?.projections?.pending_collections}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="fecha"
                            stroke="#6b7280"
                            fontSize={12}
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
                                "Monto Esperado",
                              ],
                            ]}
                          />
                          <Bar
                            dataKey="monto"
                            fill={colors[1]}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Resumen de proyecciones */}
              <Grid item xs={12} lg={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {paymentData?.projections?.pending_collections?.map(
                    (projection, index) => (
                      <Card
                        key={index}
                        sx={{
                          borderRadius: 3,
                          bgcolor: index === 0 ? "#f0fdf4" : "#f8fafc",
                        }}
                      >
                        <CardContent sx={{ p: 3, textAlign: "center" }}>
                          <Typography
                            variant="h5"
                            sx={{
                              color: index === 0 ? "#16a34a" : "#1C1C26",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            {statisticsService.formatCurrency(projection.monto)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6A736A", mb: 1 }}
                          >
                            {projection.fecha}
                          </Typography>
                          <Chip
                            label={`${projection.transacciones} transacciones`}
                            size="small"
                            color={index === 0 ? "success" : "default"}
                            sx={{ fontSize: "0.75rem" }}
                          />
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/* Alerta de seguimiento */}
                  <Card
                    sx={{
                      borderRadius: 3,
                      bgcolor: "#fef3c7",
                      border: "1px solid #fcd34d",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Schedule sx={{ color: "#f59e0b" }} />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "#92400e" }}
                        >
                          Seguimiento Requerido
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#92400e" }}>
                        {paymentData?.summary?.transacciones_pendientes}{" "}
                        transacciones pendientes requieren seguimiento activo
                        para optimizar los tiempos de cobro.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>

            {/* Tabla detallada de pendientes */}
            <Box sx={{ mt: 4 }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Detalle de Transacciones Pendientes
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, color: "#6A736A" }}>
                            Período
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Transacciones
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Monto Esperado
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Promedio
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 500, color: "#6A736A" }}
                          >
                            Estado
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentData?.projections?.pending_collections?.map(
                          (item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {item.fecha}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={item.transacciones}
                                  size="small"
                                  sx={{ bgcolor: "#f1f5f9" }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500, color: "#16a34a" }}
                                >
                                  {statisticsService.formatCurrency(item.monto)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {statisticsService.formatCurrency(
                                    item.monto / item.transacciones
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={
                                    index === 0
                                      ? "Próximo"
                                      : index === 1
                                      ? "Medio"
                                      : "Lejano"
                                  }
                                  size="small"
                                  color={
                                    index === 0
                                      ? "success"
                                      : index === 1
                                      ? "warning"
                                      : "default"
                                  }
                                  sx={{ fontSize: "0.75rem" }}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                💳 Resumen Ejecutivo de Pagos
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
                      <Receipt />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatNumber(
                        paymentData?.summary?.total_transacciones
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Transacciones Totales
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
                      <CheckCircle />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {paymentData?.summary?.tasa_exito}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Tasa de Éxito
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
                      <MonetizationOn />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {statisticsService.formatCurrency(
                        paymentData?.summary?.monto_total
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Monto Total Procesado
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
                      <Schedule />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: "#1C1C26", fontWeight: 600 }}
                    >
                      {paymentData?.summary?.tiempo_promedio_cobro} días
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6A736A" }}>
                      Tiempo Promedio
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
                    {paymentData?.methods?.distribution?.[0]?.metodo} es el
                    método más utilizado con{" "}
                    {paymentData?.methods?.distribution?.[0]?.percentage}% de
                    las transacciones
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    La tasa de éxito del {paymentData?.summary?.tasa_exito}%
                    está{" "}
                    {paymentData?.comparison?.tasa_exito_growth > 0
                      ? "mejorando"
                      : "disminuyendo"}{" "}
                    un {Math.abs(paymentData?.comparison?.tasa_exito_growth)}%
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                    El tiempo promedio de cobro es de{" "}
                    {paymentData?.summary?.tiempo_promedio_cobro} días, con
                    tendencia{" "}
                    {paymentData?.comparison?.tiempo_cobro_growth < 0
                      ? "a la mejora"
                      : "al aumento"}
                  </Typography>
                  <Typography component="li" variant="body2">
                    Hay {paymentData?.summary?.transacciones_pendientes}{" "}
                    transacciones pendientes que requieren seguimiento
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

export default PaymentStatistics;
