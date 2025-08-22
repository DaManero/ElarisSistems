// RobustImage.js - Componente de imagen robusto para Google Drive
import React, { useState, useEffect } from "react";

const RobustImage = ({
  src,
  alt = "Imagen",
  fallbackSrc = null,
  className = "",
  style = {},
  onLoad = null,
  onError = null,
  showRetry = true,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Reset cuando cambia la fuente
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [src]);

  // Función para generar múltiples URLs de Google Drive (estrategia mejorada)
  const getAlternativeGoogleDriveUrl = (url, attempt) => {
    if (
      !url ||
      (!url.includes("drive.google.com") &&
        !url.includes("drive.usercontent.google.com"))
    ) {
      return null;
    }

    // Extraer file ID de cualquier formato
    let fileId = null;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/ID
      /id=([a-zA-Z0-9_-]+)/, // id=ID
      /\/d\/([a-zA-Z0-9_-]+)/, // /d/ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }

    if (!fileId) return null;

    // 🔧 ESTRATEGIAS MEJORADAS CON PROXY DE GOOGLE
    switch (attempt) {
      case 0:
        // Proxy oficial de Google (más confiable para evitar CORS)
        return `https://lh3.googleusercontent.com/d/${fileId}=w1000-h1000`;
      case 1:
        // Proxy de Google con tamaño diferente
        return `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`;
      case 2:
        // Thumbnail API de Google Drive
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000-h1000`;
      case 3:
        // Thumbnail API con tamaño menor
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`;
      case 4:
        // Formato usercontent (directo)
        return `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
      case 5:
        // Formato uc tradicional
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      case 6:
        // Formato uc con authuser
        return `https://drive.google.com/uc?export=view&id=${fileId}&authuser=0`;
      default:
        return null;
    }
  };

  const handleLoad = (e) => {
    console.log(`✅ Imagen cargada exitosamente:`, currentSrc);
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.error(`❌ Error cargando imagen:`, {
      src: currentSrc,
      originalSrc: src,
      retryCount,
      error: e,
    });

    setIsLoading(false);

    // Si es Google Drive, intentar formatos alternativos (hasta 7 intentos)
    if (
      (currentSrc?.includes("drive.google.com") ||
        currentSrc?.includes("drive.usercontent.google.com")) &&
      retryCount < 7
    ) {
      const alternativeUrl = getAlternativeGoogleDriveUrl(src, retryCount);
      if (alternativeUrl && alternativeUrl !== currentSrc) {
        console.log(
          `🔄 Intentando estrategia ${retryCount + 1}/7:`,
          alternativeUrl
        );
        setRetryCount((prev) => prev + 1);
        setCurrentSrc(alternativeUrl);
        setIsLoading(true);
        return;
      }
    }

    // Si hay URL de fallback, intentarla
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`🔄 Usando imagen de fallback:`, fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      return;
    }

    // Marcar como error final
    setHasError(true);
    if (onError) onError(e);
  };

  const handleRetry = () => {
    console.log(`🔄 Reintentando cargar imagen:`, src);
    setRetryCount(0);
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
  };

  // Si hay error y no se puede cargar, mostrar placeholder
  if (hasError) {
    return (
      <div
        className={`robust-image-error ${className}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "8px",
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "16px",
          color: "#666",
          fontSize: "12px",
          ...style,
        }}
        {...props}
      >
        <div style={{ fontSize: "24px" }}>🖼️</div>
        <div>Error cargando imagen</div>
        <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
          Se intentaron {retryCount + 1} estrategias diferentes
        </div>
        {showRetry && (
          <button
            onClick={handleRetry}
            style={{
              cursor: "pointer",
              background: "none",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "11px",
              color: "#666",
            }}
          >
            🔄 Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`robust-image ${className}`}
      style={{
        ...style,
        opacity: isLoading ? 0.7 : 1,
        transition: "opacity 0.3s ease",
        filter: isLoading ? "blur(1px)" : "none",
      }}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export default RobustImage;
