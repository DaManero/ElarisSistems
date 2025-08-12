const { Product, Customer, PaymentMethod } = require("../models");

// Crear métodos de pago
const createPaymentMethods = async () => {
  const count = await PaymentMethod.count();
  if (count === 0) {
    console.log("💳 Creando métodos de pago...");

    await PaymentMethod.bulkCreate([
      {
        nombre: "Efectivo",
        descripcion: "Pago en efectivo al momento de la entrega",
        activo: true,
        requiere_referencia: false,
      },
      {
        nombre: "Transferencia Bancaria",
        descripcion: "Transferencia bancaria o depósito",
        activo: true,
        requiere_referencia: true,
      },
      {
        nombre: "MercadoPago",
        descripcion: "Pago a través de MercadoPago",
        activo: true,
        requiere_referencia: true,
      },
      {
        nombre: "Tarjeta de Débito",
        descripcion: "Pago con tarjeta de débito",
        activo: true,
        requiere_referencia: true,
      },
      {
        nombre: "Tarjeta de Crédito",
        descripcion: "Pago con tarjeta de crédito",
        activo: true,
        requiere_referencia: true,
      },
    ]);

    console.log("✅ Métodos de pago creados");
  }
};

// Crear clientes de ejemplo
const createCustomers = async () => {
  const count = await Customer.count();
  if (count === 0) {
    console.log("👥 Creando clientes de ejemplo...");

    await Customer.bulkCreate([
      {
        nombre: "María",
        apellido: "González",
        telefono: "1155443322",
        email: "maria.gonzalez@email.com",
        calle: "Av. Corrientes",
        altura: "1234",
        piso: "4",
        dpto: "B",
        codigo_postal: "C1414",
        aclaracion: "Timbre del medio",
        provincia: "Buenos Aires",
        localidad: "CABA",
        tipo_cliente: "Recurrente",
        status: true,
      },
      {
        nombre: "Juan",
        apellido: "Pérez",
        telefono: "1144556677",
        email: "juan.perez@email.com",
        calle: "Belgrano",
        altura: "567",
        codigo_postal: "B1642",
        aclaracion: "Casa con rejas negras",
        provincia: "Buenos Aires",
        localidad: "San Isidro",
        tipo_cliente: "Nuevo",
        status: true,
      },
      {
        nombre: "Ana",
        apellido: "Rodríguez",
        telefono: "1166778899",
        email: "ana.rodriguez@email.com",
        calle: "San Martín",
        altura: "890",
        piso: "2",
        dpto: "A",
        codigo_postal: "C1425",
        provincia: "Buenos Aires",
        localidad: "CABA",
        tipo_cliente: "Recurrente",
        status: true,
      },
    ]);

    console.log("✅ Clientes de ejemplo creados");
  }
};

// Crear productos de ejemplo
const createProducts = async () => {
  const count = await Product.count();
  if (count === 0) {
    console.log("📦 Creando productos de ejemplo...");

    await Product.bulkCreate([
      {
        fragancia: "Black Opium",
        caracteristicas:
          "Una fragancia adictiva y seductora con notas de café negro, vainilla blanca y flor de naranjo.",
        imagen:
          "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
        categoria_id: 1,
        medida_id: 2,
        proveedor_id: 1,
        stock: 25,
        stock_minimo: 5,
        precio_venta: 85000.0,
      },
      {
        fragancia: "Sauvage Dior",
        caracteristicas:
          "Fragancia masculina fresca y poderosa con bergamota de Calabria.",
        imagen:
          "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400",
        categoria_id: 2,
        medida_id: 3,
        proveedor_id: 1,
        stock: 30,
        stock_minimo: 8,
        precio_venta: 95000.0,
      },
      // Agregar más productos según necesites
    ]);

    console.log("✅ Productos de ejemplo creados");
  }
};

// Función principal para crear todos los datos
const createSampleData = async () => {
  try {
    console.log("🌱 Creando datos de ejemplo...");

    await createPaymentMethods();
    await createCustomers();
    await createProducts();

    console.log("✅ Todos los datos de ejemplo creados");
  } catch (error) {
    console.error("❌ Error creando datos de ejemplo:", error);
    throw error;
  }
};

module.exports = {
  createSampleData,
  createPaymentMethods,
  createCustomers,
  createProducts,
};
