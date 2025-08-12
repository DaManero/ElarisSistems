// components/AddressAutocomplete.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  InputAdornment,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { LocationOn, Home, Search } from "@mui/icons-material";
import georefService from "../services/georefService";

const AddressAutocomplete = ({
  onAddressSelect,
  placeholder = "Buscar dirección en Argentina...",
  disabled = false,
  sx = {},
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const fetchSuggestions = async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await georefService.getAddressSuggestions(input);

      if (result.success) {
        setSuggestions(result.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        console.error("Error en autocompletado:", result.error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Debounce para evitar demasiadas llamadas a la API
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.fullText);
    setShowSuggestions(false);
    setSuggestions([]);

    if (onAddressSelect) {
      onAddressSelect(suggestion.data);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Estilos para el input
  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      fontSize: "14px",
      "& fieldset": {
        borderColor: "#e5e7eb",
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "#d1d5db",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1C1C26",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "14px",
      color: "#6b7280",
      "&.Mui-focused": {
        color: "#1C1C26",
      },
    },
    ...sx,
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <TextField
        ref={inputRef}
        fullWidth
        label="Buscar Dirección"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        variant="outlined"
        autoComplete="off"
        sx={inputStyles}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#6b7280", fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: isLoading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} color="inherit" />
            </InputAdornment>
          ) : null,
        }}
        helperText="Escriba al menos 3 caracteres para buscar direcciones en Argentina"
      />

      {showSuggestions && suggestions.length > 0 && (
        <Paper
          ref={suggestionsRef}
          elevation={8}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: "300px",
            overflow: "auto",
            mt: 1,
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          }}
        >
          <List sx={{ p: 0 }}>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={suggestion.id}
                button
                selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  borderBottom:
                    index < suggestions.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  cursor: "pointer",
                  "&.Mui-selected": {
                    backgroundColor: "#f0f9ff",
                    "&:hover": {
                      backgroundColor: "#e0f2fe",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {suggestion.type === "address" ? (
                    <LocationOn sx={{ color: "#10b981", fontSize: 20 }} />
                  ) : (
                    <Home sx={{ color: "#6b7280", fontSize: 20 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#111827",
                          fontSize: "14px",
                        }}
                      >
                        {suggestion.mainText}
                      </Typography>
                      {suggestion.type === "street" && (
                        <Chip
                          label="Solo calle"
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6b7280",
                        fontSize: "12px",
                        lineHeight: 1.3,
                      }}
                    >
                      {suggestion.secondaryText}
                    </Typography>
                  }
                  sx={{
                    "& .MuiListItemText-primary": {
                      marginBottom: "2px",
                    },
                    "& .MuiListItemText-secondary": {
                      lineHeight: 1.3,
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Footer con info sobre GeoRef */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #f3f4f6",
              backgroundColor: "#f9fafb",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#6b7280",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              🇦🇷 Direcciones proporcionadas por GeoRef API - Gobierno de
              Argentina
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Estado vacío cuando no hay resultados */}
      {showSuggestions &&
        suggestions.length === 0 &&
        !isLoading &&
        inputValue.length >= 3 && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1300,
              mt: 1,
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              p: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
              No se encontraron direcciones
            </Typography>
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Intente con una búsqueda más específica o use la carga manual
            </Typography>
          </Paper>
        )}
    </Box>
  );
};

export default AddressAutocomplete;
