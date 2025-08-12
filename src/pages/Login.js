import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError({
        type: "validation",
        message: "Email y contraseña son obligatorios",
      });
      return;
    }

    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate("/dashboard/products/products");
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific error types
      if (error.code === "USER_INACTIVE") {
        setError({
          type: "inactive",
          title: error.title,
          message: error.message,
        });
      } else if (error.code === "INVALID_CREDENTIALS") {
        setError({
          type: "credentials",
          message: error.message,
        });
      } else if (error.code === "SERVER_ERROR") {
        setError({
          type: "server",
          message: error.message,
        });
      } else {
        setError({
          type: "general",
          message: error.message || "Error al iniciar sesión",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorAlert = () => {
    if (!error) return null;

    const alertProps = {
      sx: {
        mb: 4,
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 8px 32px rgba(28, 28, 38, 0.08)",
        "& .MuiAlert-message": {
          width: "100%",
        },
      },
    };

    switch (error.type) {
      case "inactive":
        return (
          <Slide direction="down" in={true} mountOnEnter unmountOnExit>
            <Alert
              severity="warning"
              {...alertProps}
              sx={{
                ...alertProps.sx,
                backgroundColor: "#FFFFFF",
                color: "#1C1C26",
                border: "2px solid #F2F2F2",
                "& .MuiAlert-icon": {
                  color: "#6A736A",
                },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "#1C1C26",
                    fontSize: "15px",
                  }}
                >
                  {error.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6A736A",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    mb: 3,
                  }}
                >
                  {error.message}
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#F2F2F2",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <AdminPanelSettings sx={{ color: "#6A736A", fontSize: 20 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6A736A",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Contacta al administrador para reactivar tu cuenta
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </Slide>
        );

      case "credentials":
        return (
          <Slide direction="down" in={true} mountOnEnter unmountOnExit>
            <Alert
              severity="error"
              {...alertProps}
              sx={{
                ...alertProps.sx,
                backgroundColor: "#FFFFFF",
                color: "#1C1C26",
                border: "2px solid #BEBFBD",
                "& .MuiAlert-icon": {
                  color: "#6A736A",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#1C1C26",
                }}
              >
                {error.message}
              </Typography>
            </Alert>
          </Slide>
        );

      case "server":
        return (
          <Slide direction="down" in={true} mountOnEnter unmountOnExit>
            <Alert
              severity="info"
              {...alertProps}
              sx={{
                ...alertProps.sx,
                backgroundColor: "#FFFFFF",
                color: "#1C1C26",
                border: "2px solid #F2F2F2",
                "& .MuiAlert-icon": {
                  color: "#6A736A",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#1C1C26",
                }}
              >
                {error.message}
              </Typography>
            </Alert>
          </Slide>
        );

      default:
        return (
          <Slide direction="down" in={true} mountOnEnter unmountOnExit>
            <Alert
              severity="error"
              {...alertProps}
              sx={{
                ...alertProps.sx,
                backgroundColor: "#FFFFFF",
                color: "#1C1C26",
                border: "2px solid #BEBFBD",
                "& .MuiAlert-icon": {
                  color: "#6A736A",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: "14px",
                  color: "#1C1C26",
                }}
              >
                {error.message}
              </Typography>
            </Alert>
          </Slide>
        );
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: "#FFFFFF",
      fontSize: "15px",
      fontWeight: 400,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "& fieldset": {
        borderColor: "#F2F2F2",
        borderWidth: "2px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      "&:hover fieldset": {
        borderColor: "#BEBFBD",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1C1C26",
        borderWidth: "2px",
      },
      "&.Mui-focused": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 32px rgba(28, 28, 38, 0.12)",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "15px",
      fontWeight: 500,
      color: "#6A736A",
      transform: "translate(14px, 16px) scale(1)",
      "&.Mui-focused": {
        color: "#1C1C26",
      },
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -9px) scale(0.85)",
      },
    },
    "& .MuiOutlinedInput-input": {
      padding: "16px 14px",
      fontSize: "15px",
      color: "#1C1C26",
      "&::placeholder": {
        color: "#BEBFBD",
        opacity: 1,
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F2F2F2 0%, #FFFFFF 100%)",
        p: 3,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(28, 28, 38, 0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            maxWidth: 440,
            width: "100%",
            borderRadius: "28px",
            backgroundColor: "#FFFFFF",
            boxShadow:
              "0 32px 64px rgba(28, 28, 38, 0.08), 0 8px 32px rgba(28, 28, 38, 0.04)",
            border: "1px solid rgba(242, 242, 242, 0.8)",
            overflow: "visible",
            position: "relative",
            transform: "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow:
                "0 40px 80px rgba(28, 28, 38, 0.12), 0 16px 40px rgba(28, 28, 38, 0.06)",
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Header Section */}
            <Box sx={{ px: 6, pt: 8, pb: 2, textAlign: "center" }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "24px",
                  backgroundColor: "#F2F2F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 4,
                  position: "relative",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -2,
                    borderRadius: "26px",
                    background: "linear-gradient(135deg, #1C1C26, #6A736A)",
                    padding: "2px",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "xor",
                    opacity: 0,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  },
                  "&:hover::before": {
                    opacity: 1,
                  },
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1C1C26"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  color: "#1C1C26",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "28px",
                  letterSpacing: "-0.02em",
                }}
              >
                Bienvenido
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#6A736A",
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: "280px",
                  mx: "auto",
                }}
              >
                Ingresa tus credenciales para acceder al sistema
              </Typography>
            </Box>

            {/* Error Alert */}
            <Box sx={{ px: 6 }}>{getErrorAlert()}</Box>

            {/* Form Section */}
            <Box sx={{ px: 6, pb: 8 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    variant="outlined"
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            sx={{
                              color: "#BEBFBD",
                              fontSize: "20px",
                              transition: "color 0.3s ease",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ mb: 6 }}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    variant="outlined"
                    sx={inputStyles}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
                            sx={{
                              color: "#BEBFBD",
                              fontSize: "20px",
                              transition: "color 0.3s ease",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                            sx={{
                              color: "#BEBFBD",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                color: "#6A736A",
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    borderRadius: "16px",
                    py: 2,
                    fontSize: "16px",
                    fontWeight: 600,
                    textTransform: "none",
                    backgroundColor: "#1C1C26",
                    color: "#FFFFFF",
                    border: "none",
                    boxShadow: "0 8px 32px rgba(28, 28, 38, 0.24)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "#0D0D0D",
                      transform: "translateY(-2px)",
                      boxShadow: "0 16px 40px rgba(28, 28, 38, 0.32)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                    "&:disabled": {
                      backgroundColor: "#BEBFBD",
                      color: "#FFFFFF",
                      transform: "none",
                      boxShadow: "0 4px 16px rgba(190, 191, 189, 0.16)",
                    },
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress
                        size={20}
                        sx={{
                          color: "#FFFFFF",
                          "& .MuiCircularProgress-circle": {
                            strokeLinecap: "round",
                          },
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                        }}
                      >
                        Iniciando sesión...
                      </Typography>
                    </Box>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login;
