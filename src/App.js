import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserList from "./components/UserList";
import { authService } from "./services/authService";

// Create Material-UI theme with custom palette and typography
const theme = createTheme({
  typography: {
    fontFamily:
      '"Commissioner", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 300,
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 400,
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 400,
      letterSpacing: "0.00735em",
    },
    h5: {
      fontWeight: 400,
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 500,
      letterSpacing: "0.0075em",
    },
    body1: {
      fontWeight: 400,
      letterSpacing: "0.00938em",
    },
    body2: {
      fontWeight: 400,
      letterSpacing: "0.01071em",
    },
    button: {
      fontWeight: 500,
      letterSpacing: "0.02857em",
    },
  },
  palette: {
    primary: {
      main: "#1C1C26", // Dark charcoal
      contrastText: "#F2F2F2", // Light gray text
    },
    secondary: {
      main: "#6A736A", // Medium gray-green
      contrastText: "#F2F2F2",
    },
    background: {
      default: "#F2F2F2", // Light background
      paper: "#BEBFBD", // Medium light for cards/papers
    },
    text: {
      primary: "#0D0D0D", // Almost black for main text
      secondary: "#1C1C26", // Dark charcoal for secondary text
    },
    grey: {
      50: "#F2F2F2",
      100: "#BEBFBD",
      200: "#6A736A",
      300: "#1C1C26",
      900: "#0D0D0D",
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = authService.isLoggedIn();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isLoggedIn = authService.isLoggedIn();
  return !isLoggedIn ? (
    children
  ) : (
    <Navigate to="/dashboard/products/categories" replace />
  );
};

// Placeholder components for routes
const PlaceholderComponent = ({ title }) => (
  <div style={{ padding: "2rem", textAlign: "center", color: "#6A736A" }}>
    <h3>{title}</h3>
    <p>Este módulo estará disponible próximamente</p>
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Dashboard with nested routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirects - ACTUALIZADOS */}
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/products/categories" replace />}
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard/products/categories" replace />}
          />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
