// components/statistics/ProductStatistics.js
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
  Inventory,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Analytics,
  Category,
  AttachMoney,
  Assessment,
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
  ScatterChart,
  Scatter,
} from "recharts";
import { statisticsService } from "../../services/statisticsService";
import { categoryService } from "../../services/categoryService";

const ProductStatistics = () => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [productData, setProductData] = useState(null);

  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [analysisType, setAnalysisType] = useState("rotation");
  const [activeTab, setActiveTab] = useState(0);

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

  // Función para cargar estadísticas de productos
  const loadProductStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        period: selectedPeriod,
        categoria_id: selectedCategory,
        analysis_type: analysisType,
      };

      const response = await statisticsService.getProductStatistics(params);
      setProductData(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error cargando estadísticas de productos");
      console.error("Error loading product statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedCategory, analysisType]);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProductStatistics();
  }, [loadProductStatistics]);

  // Componente para tarjetas de métricas
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    progress,
    trend,
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
                label={trend.label}
                size="small"
                color={trend.color}
                variant="outlined"
                sx={{ fontSize: "0.75rem", height: 24 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Componente para lista de productos
  const ProductList = ({
    title,
    products,
    showStock = true,
    showValue = false,
  }) => (
    <Card
      sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
        >
          {title}
        </Typography>
        {products && products.length > 0 ? (
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {products.map((product, index) => (
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
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={product.imagen}
                    sx={{ width: 40, height: 40 }}
                    variant="rounded"
                  >
                    <Inventory />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#1C1C26" }}
                    >
                      {product.fragancia || product.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6A736A" }}>
                      {product.categoria || "Sin categoría"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  {showStock && (
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#1C1C26" }}
                    >
                      {product.stock || product.cantidad_vendida || 0} unidades
                    </Typography>
                  )}
                  {showValue && (
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#16a34a" }}
                    >
                      {product.ingresos_formatted ||
                        statisticsService.formatCurrency(product.ingresos || 0)}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "#6A736A" }}>
                    {product.rotacion_dias
                      ? `${product.rotacion_dias} días`
                      : product.margen
                      ? `${product.margen}% margen`
                      : "Producto"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, color: "#6A736A" }}>
            <Typography variant="body2">No hay datos disponibles</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Tab content component
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

  // Datos de ejemplo para la demo
  const mockData = {
    rotation: {
      highRotation: [
        {
          fragancia: "Black Opium",
          categoria: "Femenino",
          rotacion_dias: 15,
          stock: 25,
        },
        {
          fragancia: "Sauvage Dior",
          categoria: "Masculino",
          rotacion_dias: 18,
          stock: 30,
        },
        {
          fragancia: "Good Girl",
          categoria: "Femenino",
          rotacion_dias: 22,
          stock: 15,
        },
      ],
      lowRotation: [
        {
          fragancia: "Vintage Classic",
          categoria: "Unisex",
          rotacion_dias: 180,
          stock: 45,
        },
        {
          fragancia: "Royal Essence",
          categoria: "Premium",
          rotacion_dias: 150,
          stock: 38,
        },
      ],
      noMovement: [
        {
          fragancia: "Old Collection",
          categoria: "Descontinuado",
          rotacion_dias: 365,
          stock: 50,
        },
      ],
    },
    profitability: {
      profitable: [
        {
          fragancia: "Luxury Line",
          categoria: "Premium",
          margen: 85,
          ingresos: 150000,
        },
        {
          fragancia: "Best Seller",
          categoria: "Popular",
          margen: 70,
          ingresos: 120000,
        },
      ],
      marginal: [
        {
          fragancia: "Standard Line",
          categoria: "Básico",
          margen: 45,
          ingresos: 80000,
        },
      ],
      unprofitable: [
        {
          fragancia: "Clearance Item",
          categoria: "Liquidación",
          margen: 15,
          ingresos: 25000,
        },
      ],
    },
    categories: [
      { categoria: "Femenino", ingresos: 250000, items_vendidos: 150 },
      { categoria: "Masculino", ingresos: 180000, items_vendidos: 120 },
      { categoria: "Unisex", ingresos: 90000, items_vendidos: 80 },
      { categoria: "Premium", ingresos: 200000, items_vendidos: 60 },
    ],
  };

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
            Estadísticas de Productos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6A736A", mt: 0.5 }}>
            Análisis de inventario, rotación y rentabilidad de productos
          </Typography>
        </Box>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Período */}
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

            {/* Categoría */}
            <Grid item xs={12} md={3}>
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

            {/* Tipo de Análisis */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Análisis</InputLabel>
                <Select
                  value={analysisType}
                  label="Análisis"
                  onChange={(e) => setAnalysisType(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {statisticsService.getAnalysisTypes().map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Actualizar */}
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={loadProductStatistics}
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
            title="Productos Activos"
            value="247"
            subtitle="en inventario"
            icon={Inventory}
            color="#3b82f6"
            progress={85}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Alta Rotación"
            value="45"
            subtitle="productos"
            icon={TrendingUp}
            color="#16a34a"
            trend={{ label: "Excelente", color: "success" }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Stock Bajo"
            value="12"
            subtitle="productos"
            icon={Warning}
            color="#f59e0b"
            trend={{ label: "Atención", color: "warning" }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Sin Movimiento"
            value="8"
            subtitle="productos"
            icon={TrendingDown}
            color="#ef4444"
            trend={{ label: "Revisar", color: "error" }}
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
            <Tab label="Rotación de Stock" />
            <Tab label="Análisis ABC" />
            <Tab label="Rentabilidad" />
            <Tab label="Por Categorías" />
          </Tabs>
        </Box>

        {/* Tab 1: Rotación de Stock */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} md={4}>
              <ProductList
                title="📈 Alta Rotación"
                products={mockData.rotation.highRotation}
                showStock={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProductList
                title="📉 Baja Rotación"
                products={mockData.rotation.lowRotation}
                showStock={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProductList
                title="🚫 Sin Movimiento"
                products={mockData.rotation.noMovement}
                showStock={true}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Análisis ABC */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                  >
                    Distribución ABC por Ingresos
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Categoría A (80%)",
                              value: 80,
                              color: colors[0],
                            },
                            {
                              name: "Categoría B (15%)",
                              value: 15,
                              color: colors[1],
                            },
                            {
                              name: "Categoría C (5%)",
                              value: 5,
                              color: colors[2],
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={150}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            {
                              name: "Categoría A (80%)",
                              value: 80,
                              fill: colors[0],
                            },
                            {
                              name: "Categoría B (15%)",
                              value: 15,
                              fill: colors[1],
                            },
                            {
                              name: "Categoría C (5%)",
                              value: 5,
                              fill: colors[2],
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Card sx={{ borderRadius: 3, bgcolor: "#f0fdf4" }}>
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ color: "#16a34a", fontWeight: 600 }}
                    >
                      A
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#15803d" }}>
                      Categoría A - 80% Ingresos
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#1C1C26", mt: 1 }}>
                      45 productos
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3, bgcolor: "#fffbeb" }}>
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ color: "#f59e0b", fontWeight: 600 }}
                    >
                      B
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#d97706" }}>
                      Categoría B - 15% Ingresos
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#1C1C26", mt: 1 }}>
                      95 productos
                    </Typography>
                  </CardContent>
                </Card>
                <Card sx={{ borderRadius: 3, bgcolor: "#fef2f2" }}>
                  <CardContent sx={{ p: 3, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{ color: "#ef4444", fontWeight: 600 }}
                    >
                      C
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#dc2626" }}>
                      Categoría C - 5% Ingresos
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#1C1C26", mt: 1 }}>
                      107 productos
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Rentabilidad */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} md={4}>
              <ProductList
                title="💰 Alta Rentabilidad"
                products={mockData.profitability.profitable}
                showValue={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProductList
                title="⚖️ Rentabilidad Media"
                products={mockData.profitability.marginal}
                showValue={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ProductList
                title="📉 Baja Rentabilidad"
                products={mockData.profitability.unprofitable}
                showValue={true}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Por Categorías */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "#1C1C26", fontWeight: 500 }}
                    >
                      Ingresos por Categoría
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData.categories}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="categoria"
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
                              (value) =>
                                statisticsService.formatCurrency(value),
                              "Ingresos",
                            ]}
                          />
                          <Bar
                            dataKey="ingresos"
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
                      Resumen por Categoría
                    </Typography>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {mockData.categories.map((cat, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: "#1C1C26" }}
                          >
                            {cat.categoria}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ color: "#16a34a", fontWeight: 600 }}
                          >
                            {statisticsService.formatCurrency(cat.ingresos)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6A736A" }}
                          >
                            {cat.items_vendidos} productos vendidos
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ProductStatistics;
