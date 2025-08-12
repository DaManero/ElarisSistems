// ================================
// CONFIGURACIÓN DE BASE DE DATOS
// ================================
const { Sequelize } = require("sequelize");

// ================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ================================
const validateEnvironment = () => {
  const required = ["DB_NAME", "DB_USERNAME", "DB_PASSWORD", "DB_HOST"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(", ")}`);
  }
};

// Validar antes de crear la conexión
validateEnvironment();

// ================================
// CONFIGURACIÓN MEJORADA DE SEQUELIZE
// ================================
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",

    // Logging configurable
    logging: process.env.DB_LOGGING === "true" ? console.log : false,

    // Pool de conexiones configurable
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
      min: 0,
      acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 30000,
      idle: parseInt(process.env.DB_TIMEOUT) || 10000,
    },

    // Timezone configurable
    timezone: process.env.DB_TIMEZONE || "-03:00",

    // Configuraciones adicionales para producción
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /ER_LOCK_WAIT_TIMEOUT/,
        /ER_LOCK_DEADLOCK/,
      ],
    },

    // Configuraciones de performance
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      timestamps: true,
      underscored: false,
    },
  }
);

// ================================
// FUNCIÓN DE CONEXIÓN MEJORADA
// ================================
const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Conexión a MySQL exitosa");
      return true;
    } catch (error) {
      console.error(
        `❌ Error conectando a MySQL (intento ${attempt}/${retries}):`,
        error.message
      );

      if (attempt === retries) {
        throw error;
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

// ================================
// SINCRONIZACIÓN DE BASE DE DATOS OPTIMIZADA
// ================================
const syncDatabase = async () => {
  try {
    console.log("🔄 Iniciando sincronización de base de datos...");

    // Importar modelos
    const models = require("../models");

    // Verificar modelos disponibles
    models.verifyModels();

    // Definir asociaciones
    models.defineAssociations();

    // Sincronizar en paralelo las tablas base (sin foreign keys)
    console.log("📋 Sincronizando tablas base...");
    await Promise.all([
      models.User.sync(),
      models.Category.sync(),
      models.Measure.sync(),
      models.Provider.sync(),
      models.Customer.sync(),
      models.PaymentMethod.sync(),
    ]);
    console.log("✅ Tablas base sincronizadas");

    // Sincronizar tablas con dependencias de nivel 1
    console.log("📋 Sincronizando tablas con dependencias...");
    await Promise.all([models.Product.sync(), models.Sale.sync()]);
    console.log("✅ Tablas de nivel 1 sincronizadas");

    // Sincronizar tablas con dependencias de nivel 2
    await Promise.all([models.SaleItem.sync(), models.Shipment.sync()]);
    console.log("✅ Tablas de nivel 2 sincronizadas");

    // Verificación final (opcional en desarrollo)
    if (process.env.NODE_ENV === "development") {
      await verifyTablesCreated();
    }

    console.log("✅ Base de datos sincronizada completamente");
    return true;
  } catch (error) {
    console.error("❌ Error sincronizando base de datos:", error.message);

    // Log detallado solo si es necesario
    if (process.env.NODE_ENV === "development") {
      console.error("🔍 Detalles del error:", {
        message: error.message,
        sql: error.sql,
        original: error.original?.message,
      });
    }

    throw error;
  }
};

// ================================
// VERIFICACIÓN DE TABLAS (SEPARADA)
// ================================
const verifyTablesCreated = async () => {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    const expectedTables = [
      "users",
      "categories",
      "measures",
      "providers",
      "customers",
      "paymentmethods",
      "products",
      "sales",
      "saleitems",
      "shipments",
    ];

    const missingTables = expectedTables.filter(
      (expected) =>
        !tables.some((table) => table.toLowerCase() === expected.toLowerCase())
    );

    if (missingTables.length > 0) {
      console.log(`⚠️ Tablas faltantes: ${missingTables.join(", ")}`);
    } else {
      console.log("✅ Todas las tablas requeridas están presentes");
    }

    return { tables, missingTables };
  } catch (error) {
    console.error("❌ Error verificando tablas:", error.message);
    return { tables: [], missingTables: [] };
  }
};

// ================================
// FUNCIÓN DE RECREACIÓN SEGURA
// ================================
const forceSyncDatabase = async () => {
  // Validaciones de seguridad
  if (process.env.NODE_ENV === "production") {
    throw new Error("No se puede forzar sincronización en producción");
  }

  if (!process.env.FORCE_SYNC_ALLOWED) {
    throw new Error("Para forzar sync, define FORCE_SYNC_ALLOWED=true en .env");
  }

  try {
    console.log("⚠️ FORZANDO recreación de base de datos...");
    console.log("⚠️ ESTO ELIMINARÁ TODOS LOS DATOS EXISTENTES");

    const models = require("../models");
    models.defineAssociations();

    await sequelize.sync({ force: true });
    console.log("✅ Base de datos recreada completamente");
  } catch (error) {
    console.error("❌ Error forzando sincronización:", error.message);
    throw error;
  }
};

// ================================
// ESTADO DE BASE DE DATOS SIMPLIFICADO
// ================================
const checkDatabaseStatus = async () => {
  try {
    // Verificar conexión
    await testConnection();

    // Obtener información básica
    const tables = await sequelize.getQueryInterface().showAllTables();
    const expectedTables = [
      "users",
      "categories",
      "measures",
      "providers",
      "customers",
      "paymentmethods",
      "products",
      "sales",
      "saleitems",
      "shipments",
    ];

    const missingTables = expectedTables.filter(
      (expected) =>
        !tables.some((table) => table.toLowerCase() === expected.toLowerCase())
    );

    const status = {
      connected: true,
      tablesCount: tables.length,
      expectedTables: expectedTables.length,
      missingTables: missingTables,
      isComplete: missingTables.length === 0,
    };

    // Log resumido
    console.log(
      `📊 Estado BD: ${tables.length}/${expectedTables.length} tablas`
    );
    if (missingTables.length > 0) {
      console.log(`⚠️ Faltan: ${missingTables.join(", ")}`);
    }

    return status;
  } catch (error) {
    console.error("❌ Error verificando estado de BD:", error.message);
    return {
      connected: false,
      error: error.message,
      isComplete: false,
    };
  }
};

// ================================
// HEALTH CHECK DE CONEXIÓN
// ================================
const healthCheck = async () => {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const responseTime = Date.now() - startTime;

    return {
      status: "healthy",
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// ================================
// FUNCIÓN DE CONSULTA MEJORADA
// ================================
const executeQuery = async (query, options = {}) => {
  try {
    const queryType = options.type || sequelize.QueryTypes.SELECT;
    const result = await sequelize.query(query, {
      type: queryType,
      ...options,
    });

    // Para SELECT retorna solo los resultados, para otros retorna completo
    return queryType === sequelize.QueryTypes.SELECT ? result : result;
  } catch (error) {
    console.error("❌ Error ejecutando consulta:", error.message);
    throw error;
  }
};

// ================================
// FUNCIÓN DE CIERRE SEGURO
// ================================
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log("👋 Conexión a base de datos cerrada");
  } catch (error) {
    console.error("❌ Error cerrando conexión:", error.message);
    throw error;
  }
};

// ================================
// FUNCIÓN DE MIGRACIÓN SIMPLE
// ================================
const runMigrations = async () => {
  try {
    console.log("🔄 Verificando necesidad de migraciones...");

    // Aquí podrías agregar lógica de migración personalizada
    // Por ahora solo verifica que las tablas existan
    const status = await checkDatabaseStatus();

    if (!status.isComplete) {
      console.log("📝 Ejecutando sincronización como migración...");
      await syncDatabase();
    } else {
      console.log("✅ No se requieren migraciones");
    }

    return true;
  } catch (error) {
    console.error("❌ Error en migraciones:", error.message);
    throw error;
  }
};

// ================================
// EXPORTS
// ================================
module.exports = {
  // Instancia principal
  sequelize,

  // Funciones principales (mantienen compatibilidad)
  testConnection,
  syncDatabase,

  // Funciones de utilidad mejoradas
  checkDatabaseStatus,
  closeConnection,
  executeQuery,

  // Funciones adicionales
  forceSyncDatabase,
  healthCheck,
  runMigrations,
  verifyTablesCreated,
};
