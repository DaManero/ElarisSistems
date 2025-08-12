import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import CategoryList from "../components/CategoryList";
import MeasureList from "../components/MeasureList";
import ProviderList from "../components/ProviderList";
import ProductList from "../components/ProductList";

// Placeholder component for unimplemented sections
const PlaceholderComponent = ({ title, description }) => (
  <Box sx={{ p: 4, textAlign: "center", color: "#6A736A" }}>
    <Typography variant="h6" sx={{ mb: 2, color: "#1C1C26" }}>
      {title}
    </Typography>
    <Typography variant="body2">
      {description || "Este módulo estará disponible próximamente"}
    </Typography>
  </Box>
);

// ==========================================
// CATEGORY WRAPPERS
// ==========================================

// Wrapper component for category editing (future use)
const CategoryEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // const fetchCategory = async () => {
    //   try {
    //     const response = await categoryService.getCategory(id);
    //     setCategoryData(response.data);
    //   } catch (error) {
    //     setError("Categoría no encontrada");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // if (id) {
    //   fetchCategory();
    // }

    // Por ahora, redirect a la lista
    navigate("/dashboard/products/categories");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for category creation (future use)
const CategoryCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde CategoryList)
  useEffect(() => {
    navigate("/dashboard/products/categories");
  }, [navigate]);

  return null;
};

// ==========================================
// MEASURE WRAPPERS
// ==========================================

// Wrapper component for measure editing (future use)
const MeasureEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [measureData, setMeasureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // const fetchMeasure = async () => {
    //   try {
    //     const response = await measureService.getMeasure(id);
    //     setMeasureData(response.data);
    //   } catch (error) {
    //     setError("Medida no encontrada");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // if (id) {
    //   fetchMeasure();
    // }

    // Por ahora, redirect a la lista
    navigate("/dashboard/products/measures");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for measure creation (future use)
const MeasureCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde MeasureList)
  useEffect(() => {
    navigate("/dashboard/products/measures");
  }, [navigate]);

  return null;
};

// ==========================================
// SUPPLIER WRAPPERS (PROVIDERS)
// ==========================================

// Wrapper component for supplier editing (future use)
const SupplierEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // const fetchSupplier = async () => {
    //   try {
    //     const response = await providerService.getProvider(id);
    //     setSupplierData(response.data);
    //   } catch (error) {
    //     setError("Proveedor no encontrado");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // if (id) {
    //   fetchSupplier();
    // }

    // Por ahora, redirect a la lista
    navigate("/dashboard/products/suppliers");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for supplier creation (future use)
const SupplierCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde ProviderList)
  useEffect(() => {
    navigate("/dashboard/products/suppliers");
  }, [navigate]);

  return null;
};

// ==========================================
// PRODUCT WRAPPERS
// ==========================================

// Wrapper component for product editing (future use)
const ProductEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Implementar cuando sea necesario editar por URL
    // const fetchProduct = async () => {
    //   try {
    //     const response = await productService.getProduct(id);
    //     setProductData(response.data);
    //   } catch (error) {
    //     setError("Producto no encontrado");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // if (id) {
    //   fetchProduct();
    // }

    // Por ahora, redirect a la lista
    navigate("/dashboard/products/products");
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

// Wrapper component for product creation (future use)
const ProductCreateWrapper = () => {
  const navigate = useNavigate();

  // Por ahora, redirect a la lista (el modal se maneja desde ProductList)
  useEffect(() => {
    navigate("/dashboard/products/products");
  }, [navigate]);

  return null;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const Products = () => {
  const location = useLocation();

  // Debug: mostrar ruta actual
  console.log("Products component - Current path:", location.pathname);

  return (
    <Routes>
      {/* Productos */}
      <Route path="products" element={<ProductList />} />
      <Route path="products/create" element={<ProductCreateWrapper />} />
      <Route path="products/edit/:id" element={<ProductEditWrapper />} />

      {/* Categorías */}
      <Route path="categories" element={<CategoryList />} />
      <Route path="categories/create" element={<CategoryCreateWrapper />} />
      <Route path="categories/edit/:id" element={<CategoryEditWrapper />} />

      {/* Proveedores/Suppliers */}
      <Route path="suppliers" element={<ProviderList />} />
      <Route path="suppliers/create" element={<SupplierCreateWrapper />} />
      <Route path="suppliers/edit/:id" element={<SupplierEditWrapper />} />

      {/* Medidas */}
      <Route path="measures" element={<MeasureList />} />
      <Route path="measures/create" element={<MeasureCreateWrapper />} />
      <Route path="measures/edit/:id" element={<MeasureEditWrapper />} />

      {/* Ruta por defecto - redirige a productos */}
      <Route path="*" element={<ProductList />} />
    </Routes>
  );
};

export default Products;
