require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ================================
const app = express();

// ================================
// MIDDLEWARES
// ================================
app.use(cors());
app.use(express.json());

// ================================
// IMPORTACIONES DE CONFIGURACIÓN
// ================================
const { testConnection, syncDatabase } = require("./src/config/database");

// ================================
// RUTAS PRINCIPALES
// ================================
// Ruta de información de la API

app.get("/", (req, res) => {
  res.json({
    message: "Sistema de Perfumes API",
    status: "funcionando",
    version: "1.0.0",
    modules: {
      usuarios: "✅ Disponible",
      productos: "✅ Disponible",
      ventas: "✅ Disponible",
      clientes: "✅ Disponible",
      estadisticas: "✅ Disponible",
    },
  });
});

// ================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ================================
const initializeApp = async () => {
  try {
    console.log("🚀 Iniciando aplicación...");

    // Conexión y configuración de base de datos
    await testConnection();
    await syncDatabase();

    // Configuración de rutas de la API
    const routes = require("./src/routes");
    app.use("/api", routes);
    console.log("✅ Rutas configuradas");

    // Inicio del servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
        🚀 Servidor corriendo en puerto ${PORT}
        📍 URL Local: http://localhost:${PORT}        
        📍 API Base:  http://localhost:${PORT}/api 
                  `);
    });
  } catch (error) {
    console.error("❌ Error inicializando aplicación:", error);
    process.exit(1);
  }
};

// ================================
// MANEJO DE ERRORES GLOBALES
// ================================
process.on("unhandledRejection", (error) => {
  console.error("❌ Error no manejado:", error);
  process.exit(1);
});

// ================================
// INICIO DE LA APLICACIÓN
// ================================
initializeApp();
