import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Block, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AccessDenied = ({
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a este módulo. Contacta al administrador si necesitas acceso.",
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Volver a la página anterior
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        p: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(28, 28, 38, 0.1)",
          border: "1px solid #f1f5f9",
        }}
      >
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          {/* Icon */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fecaca",
              }}
            >
              <Block
                sx={{
                  fontSize: 40,
                  color: "#dc2626",
                }}
              />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              color: "#1C1C26",
              fontWeight: 600,
              mb: 2,
              fontSize: "1.5rem",
            }}
          >
            {title}
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: "#6A736A",
              mb: 4,
              lineHeight: 1.6,
              fontSize: "1rem",
            }}
          >
            {message}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            {showBackButton && (
              <Button
                onClick={handleGoBack}
                startIcon={<ArrowBack />}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 3,
                  py: 1.5,
                  color: "#6A736A",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                    borderColor: "#d1d5db",
                  },
                }}
              >
                Volver
              </Button>
            )}

            <Button
              onClick={() => navigate("/dashboard/productos")}
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                py: 1.5,
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "#1C1C26",
                "&:hover": {
                  backgroundColor: "#0D0D0D",
                },
              }}
            >
              Ir al Dashboard
            </Button>
          </Box>

          {/* Additional Info */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#9ca3af",
                fontSize: "12px",
              }}
            >
              Si crees que esto es un error, contacta al administrador del
              sistema
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccessDenied;
