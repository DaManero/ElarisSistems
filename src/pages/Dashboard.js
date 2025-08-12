// pages/Dashboard.js - ACTUALIZADO CON ESTADÍSTICAS
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Circle,
  TrendingUp,
  RotateLeft,
  BarChart,
  PersonOutline,
  Lock,
} from "@mui/icons-material";
import { authService } from "../services/authService";
import Users from "../pages/Users";
import AccessDenied from "../components/AccessDenied";
import Products from "../pages/Products";
import Sales from "../pages/Sales";
import Statistics from "../pages/Statistics"; // 📊 NUEVA IMPORTACIÓN

const DRAWER_WIDTH = 240;

// Placeholder component for unimplemented routes
const PlaceholderComponent = ({ title }) => (
  <Box sx={{ p: 4, textAlign: "center", color: "#6A736A" }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      {title}
    </Typography>
    <Typography variant="body2">
      Este módulo estará disponible próximamente
    </Typography>
  </Box>
);

// Access denied component specifically for users module
const UsersAccessDenied = () => (
  <AccessDenied
    title="Acceso Restringido"
    message="Solo los administradores pueden acceder al módulo de gestión de usuarios. Si necesitas acceso, contacta con el administrador del sistema."
  />
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Check if user has access to users module
  const canAccessUsers = () => {
    return user && user.role === "admin";
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/login";
    } catch (error) {
      window.location.href = "/login";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#1C1C26";
      case "seller":
        return "#6A736A";
      case "viewer":
        return "#BEBFBD";
      default:
        return "#6A736A";
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  // Menu configuration - 📊 ACTUALIZADO CON ESTADÍSTICAS
  const menuItems = [
    {
      id: "products",
      label: "Productos",
      icon: <Circle sx={{ fontSize: "1rem" }} />,
      path: "/dashboard/products",
      subItems: [
        { label: "Productos", path: "/dashboard/products/products" },
        { label: "Categorías", path: "/dashboard/products/categories" },
        { label: "Medidas", path: "/dashboard/products/measures" },
        { label: "Proveedores", path: "/dashboard/products/suppliers" },
      ],
      requiresRole: null,
    },
    {
      id: "sales",
      label: "Ventas",
      icon: <TrendingUp sx={{ fontSize: "1rem" }} />,
      path: "/dashboard/sales",
      subItems: [
        { label: "Nueva Venta", path: "/dashboard/sales/new" },
        { label: "Historial", path: "/dashboard/sales/history" },
        { label: "Envíos", path: "/dashboard/sales/shipments" },
        { label: "Clientes", path: "/dashboard/sales/customers" },
        { label: "Métodos de Pago", path: "/dashboard/sales/payment-methods" },
      ],
      requiresRole: null,
    },
    {
      id: "restock",
      label: "Reposición",
      icon: <RotateLeft sx={{ fontSize: "1rem" }} />,
      path: "/dashboard/restock",
      subItems: [
        { label: "Pedidos", path: "/dashboard/restock/orders" },
        { label: "Stock Bajo", path: "/dashboard/restock/low-stock" },
      ],
      requiresRole: null,
    },
    {
      id: "statistics", // 📊 NUEVO MÓDULO COMPLETO
      label: "Estadísticas",
      icon: <BarChart sx={{ fontSize: "1rem" }} />,
      path: "/dashboard/statistics",
      subItems: [
        { label: "Dashboard", path: "/dashboard/statistics/dashboard" },
        { label: "Ventas", path: "/dashboard/statistics/sales" },
        { label: "Productos", path: "/dashboard/statistics/products" },
        { label: "Clientes", path: "/dashboard/statistics/customers" },
        { label: "Pagos", path: "/dashboard/statistics/payments" },
        { label: "Envíos", path: "/dashboard/statistics/shipments" },
        { label: "Geográfico", path: "/dashboard/statistics/geographic" },
        { label: "Tendencias", path: "/dashboard/statistics/trends" },
      ],
      requiresRole: null,
    },
    {
      id: "users",
      label: "Usuarios",
      icon: <PersonOutline sx={{ fontSize: "1rem" }} />,
      path: "/dashboard/users",
      subItems: [
        { label: "Lista", path: "/dashboard/users/list" },
        { label: "Roles", path: "/dashboard/users/roles" },
      ],
      requiresRole: "admin",
    },
  ];

  // Check if user has access to a specific module
  const hasAccessToModule = (module) => {
    if (!module.requiresRole) return true;
    return user && user.role === module.requiresRole;
  };

  // Get current active module and submenu based on current route
  const getCurrentModule = () => {
    const path = location.pathname;
    return menuItems.find((item) => path.startsWith(item.path)) || menuItems[0];
  };

  // 📊 FUNCIÓN ACTUALIZADA para manejar sub-rutas de estadísticas
  const getCurrentSubModuleIndex = () => {
    const currentModule = getCurrentModule();
    const path = location.pathname;

    const subIndex = currentModule.subItems.findIndex((sub) => {
      // Coincidencia exacta
      if (sub.path === path) {
        return true;
      }

      // 📊 ESPECIAL: Para estadísticas, incluir todas las sub-rutas
      if (sub.path === "/dashboard/statistics/dashboard") {
        return path.startsWith("/dashboard/statistics/dashboard");
      }

      if (sub.path === "/dashboard/statistics/sales") {
        return path.startsWith("/dashboard/statistics/sales");
      }

      if (sub.path === "/dashboard/statistics/products") {
        return path.startsWith("/dashboard/statistics/products");
      }

      if (sub.path === "/dashboard/statistics/customers") {
        return path.startsWith("/dashboard/statistics/customers");
      }

      if (sub.path === "/dashboard/statistics/payments") {
        return path.startsWith("/dashboard/statistics/payments");
      }

      if (sub.path === "/dashboard/statistics/shipments") {
        return path.startsWith("/dashboard/statistics/shipments");
      }

      if (sub.path === "/dashboard/statistics/geographic") {
        return path.startsWith("/dashboard/statistics/geographic");
      }

      if (sub.path === "/dashboard/statistics/trends") {
        return path.startsWith("/dashboard/statistics/trends");
      }

      // 🎯 Para envíos
      if (sub.path === "/dashboard/sales/shipments") {
        return path.startsWith("/dashboard/sales/shipments");
      }

      // 🔄 Para otros módulos con sub-rutas
      if (sub.path === "/dashboard/sales/customers") {
        return path.startsWith("/dashboard/sales/customers");
      }

      if (sub.path === "/dashboard/sales/payment-methods") {
        return path.startsWith("/dashboard/sales/payment-methods");
      }

      if (sub.path === "/dashboard/products/products") {
        return path.startsWith("/dashboard/products/products");
      }

      return false;
    });

    return subIndex >= 0 ? subIndex : 0;
  };

  const currentModule = getCurrentModule();
  const currentSubModuleIndex = getCurrentSubModuleIndex();

  const handleModuleChange = (module) => {
    // Solo revisar usuarios, todos los demás pueden pasar
    if (module.id === "users" && !canAccessUsers()) {
      navigate("/dashboard/users/access-denied");
      return;
    }

    navigate(module.subItems[0].path);
  };

  const handleSubModuleChange = (event, newValue) => {
    const subItem = currentModule.subItems[newValue];

    // Additional check for users module
    if (currentModule.id === "users" && !canAccessUsers()) {
      navigate("/dashboard/users/access-denied");
      return;
    }

    navigate(subItem.path);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#FAFAFA" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#FFFFFF",
            borderRight: "1px solid rgba(190, 191, 189, 0.12)",
            boxShadow: "2px 0 8px rgba(28, 28, 38, 0.04)",
          },
        }}
      >
        {/* Logo/Brand */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            borderBottom: "1px solid rgba(190, 191, 189, 0.12)",
            bgcolor: "#FAFAFA",
            mb: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: "#1C1C26",
              letterSpacing: "0.5px",
              fontSize: "1.1rem",
            }}
          >
            Perfume
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#6A736A",
              letterSpacing: "1px",
              fontSize: "0.75rem",
            }}
          >
            SYSTEM
          </Typography>
        </Box>

        {/* Menu Items */}
        <List sx={{ px: 3, py: 3, bgcolor: "#FFFFFF" }}>
          {menuItems.map((item) => {
            const isSelected = currentModule.id === item.id;

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleModuleChange(item)}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(28, 28, 38, 0.06)",
                      "&:hover": {
                        backgroundColor: "rgba(28, 28, 38, 0.08)",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(28, 28, 38, 0.03)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? "#1C1C26" : "#6A736A",
                      minWidth: 36,
                      fontSize: "1.2rem",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "0.95rem",
                        fontWeight: isSelected ? 500 : 400,
                        color: isSelected ? "#1C1C26" : "#6A736A",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        {/* Footer area with subtle background */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "#F8F9FA",
            borderTop: "1px solid rgba(190, 191, 189, 0.08)",
          }}
        />
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Top Header */}
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            borderBottom: "1px solid rgba(190, 191, 189, 0.08)",
            px: 4,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#1C1C26",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6A736A",
                      textTransform: "capitalize",
                      fontSize: "0.75rem",
                    }}
                  >
                    {user.role}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: getRoleColor(user.role),
                    width: 36,
                    height: 36,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                  onClick={handleMenuOpen}
                >
                  {getInitials(user.first_name, user.last_name)}
                </Avatar>
              </Box>
            )}
          </Box>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(28, 28, 38, 0.1)",
              border: "1px solid rgba(190, 191, 189, 0.1)",
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 3 }}>
            <AccountCircle
              sx={{ mr: 2, fontSize: "1.2rem", color: "#6A736A" }}
            />
            <Typography variant="body2">Perfil</Typography>
          </MenuItem>
          <Divider sx={{ opacity: 0.3 }} />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3 }}>
            <Logout sx={{ mr: 2, fontSize: "1.2rem", color: "#6A736A" }} />
            <Typography variant="body2">Cerrar Sesión</Typography>
          </MenuItem>
        </Menu>

        {/* Horizontal Submenu */}
        {hasAccessToModule(currentModule) && (
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid rgba(190, 191, 189, 0.08)",
              px: 4,
            }}
          >
            <Tabs
              value={currentSubModuleIndex}
              onChange={handleSubModuleChange}
              sx={{
                minHeight: "auto",
                "& .MuiTab-root": {
                  textTransform: "none",
                  minWidth: "auto",
                  minHeight: "auto",
                  mr: 4,
                  py: 2,
                  px: 0,
                  color: "#6A736A",
                  fontWeight: 400,
                  fontSize: "0.9rem",
                  "&.Mui-selected": {
                    color: "#1C1C26",
                    fontWeight: 500,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#1C1C26",
                  height: 2,
                },
              }}
            >
              {currentModule.subItems.map((subItem, index) => (
                <Tab key={index} label={subItem.label} />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Content Area with Routes */}
        <Box sx={{ p: 4 }}>
          <Routes>
            {/* Users Routes - Protected */}
            <Route path="users/access-denied" element={<UsersAccessDenied />} />
            <Route
              path="users/*"
              element={canAccessUsers() ? <Users /> : <UsersAccessDenied />}
            />

            {/* Products Routes */}
            <Route path="products/*" element={<Products />} />

            {/* Sales Routes */}
            <Route path="sales/*" element={<Sales />} />

            {/* Statistics Routes - 📊 NUEVA RUTA COMPLETA */}
            <Route path="statistics/*" element={<Statistics />} />

            {/* Restock Routes */}
            <Route
              path="restock/orders"
              element={<PlaceholderComponent title="Pedidos" />}
            />
            <Route
              path="restock/low-stock"
              element={<PlaceholderComponent title="Stock Bajo" />}
            />

            {/* Default route */}
            <Route
              path="*"
              element={<PlaceholderComponent title="Dashboard" />}
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
