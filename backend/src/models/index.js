// src/models/index.js
const User = require("./User");
const Category = require("./Category");
const Measure = require("./Measure");
const Provider = require("./Provider");
const Customer = require("./Customer");
const PaymentMethod = require("./PaymentMethod");
const Product = require("./Product");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");
const Shipment = require("./Shipment");

// Función para definir todas las asociaciones
const defineAssociations = () => {
  console.log("🔗 Definiendo asociaciones entre modelos...");

  // ==========================================
  // ASOCIACIONES EXISTENTES (mantener como están)
  // ==========================================

  // Usuarios y roles (si tienes estas asociaciones)
  // User -> Sale (vendedor)
  User.hasMany(Sale, {
    foreignKey: "usuario_id",
    as: "ventas",
  });

  Sale.belongsTo(User, {
    foreignKey: "usuario_id",
    as: "usuario",
  });

  // Categorías -> Productos
  Category.hasMany(Product, {
    foreignKey: "categoria_id",
    as: "productos",
  });

  Product.belongsTo(Category, {
    foreignKey: "categoria_id",
    as: "categoria",
  });

  // Medidas -> Productos
  Measure.hasMany(Product, {
    foreignKey: "medida_id",
    as: "productos",
  });

  Product.belongsTo(Measure, {
    foreignKey: "medida_id",
    as: "medida",
  });

  // Proveedores -> Productos
  Provider.hasMany(Product, {
    foreignKey: "proveedor_id",
    as: "productos",
  });

  Product.belongsTo(Provider, {
    foreignKey: "proveedor_id",
    as: "proveedor",
  });

  // Clientes -> Ventas
  Customer.hasMany(Sale, {
    foreignKey: "cliente_id",
    as: "ventas",
  });

  Sale.belongsTo(Customer, {
    foreignKey: "cliente_id",
    as: "cliente",
  });

  // Métodos de Pago -> Ventas
  PaymentMethod.hasMany(Sale, {
    foreignKey: "metodo_pago_id",
    as: "ventas",
  });

  Sale.belongsTo(PaymentMethod, {
    foreignKey: "metodo_pago_id",
    as: "metodoPago",
  });

  // Ventas -> Items de Venta
  Sale.hasMany(SaleItem, {
    foreignKey: "venta_id",
    as: "items",
  });

  SaleItem.belongsTo(Sale, {
    foreignKey: "venta_id",
    as: "venta",
  });

  // Productos -> Items de Venta
  Product.hasMany(SaleItem, {
    foreignKey: "producto_id",
    as: "ventaItems",
  });

  SaleItem.belongsTo(Product, {
    foreignKey: "producto_id",
    as: "producto",
  });

  // ==========================================
  // NUEVAS ASOCIACIONES PARA SHIPMENTS
  // ==========================================

  // Ventas -> Envíos (Una venta puede tener múltiples envíos)
  Sale.hasMany(Shipment, {
    foreignKey: "venta_id",
    as: "envios",
  });

  Shipment.belongsTo(Sale, {
    foreignKey: "venta_id",
    as: "venta",
  });

  // Usuarios -> Envíos actualizados (Un usuario puede actualizar muchos envíos)
  User.hasMany(Shipment, {
    foreignKey: "actualizado_por",
    as: "enviosActualizados",
  });

  Shipment.belongsTo(User, {
    foreignKey: "actualizado_por",
    as: "usuarioActualizador",
  });

  console.log("✅ Asociaciones definidas correctamente");
};

// Función para verificar que todos los modelos estén disponibles
const verifyModels = () => {
  const models = {
    User,
    Category,
    Measure,
    Provider,
    Customer,
    PaymentMethod,
    Product,
    Sale,
    SaleItem,
    Shipment,
  };

  console.log("🔍 Verificando modelos disponibles:");

  Object.keys(models).forEach((modelName) => {
    if (models[modelName]) {
      console.log(`  ✅ ${modelName}`);
    } else {
      console.log(`  ❌ ${modelName} - NO ENCONTRADO`);
    }
  });

  return models;
};

// Exportar todos los modelos y funciones
module.exports = {
  // Modelos
  User,
  Category,
  Measure,
  Provider,
  Customer,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  Shipment,

  // Funciones
  defineAssociations,
  verifyModels,
};
