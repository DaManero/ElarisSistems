// services/shipmentService.js - ACTUALIZADO PARA PDF
import api from "./api";
import { authService } from "./authService"; // 🔧 IMPORT AGREGADO AL PRINCIPIO

export const shipmentService = {
  // ==========================================
  // GESTIÓN DE LOTES
  // ==========================================

  // Obtener lotes de envío del día
  getShipmentBatches: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.fecha) queryParams.append("fecha", params.fecha);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/shipments/batches?${queryString}`
        : "/shipments/batches";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener envíos de un lote específico
  getShipmentsByBatch: async (batchId) => {
    try {
      const response = await api.get(`/shipments/batch/${batchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // 🆕 GESTIÓN DE VENTAS PARA SELECCIÓN
  // ==========================================

  // 🆕 Verificar ventas disponibles para envío (En proceso + Reprogramado)
  checkAvailableSales: async (fecha = null) => {
    try {
      const queryParams = new URLSearchParams();

      // Solo agregar fecha si se proporciona
      if (fecha) queryParams.append("fecha", fecha);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/shipments/check-pending?${queryString}`
        : "/shipments/check-pending";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🆕 Obtener ventas disponibles para selección (En proceso + Reprogramado)
  getAvailableSales: async (fecha = null) => {
    try {
      const queryParams = new URLSearchParams();

      // Solo agregar fecha si se proporciona
      if (fecha) queryParams.append("fecha", fecha);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/shipments/pending-detailed?${queryString}`
        : "/shipments/pending-detailed";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // GENERACIÓN DE REPORTES
  // ==========================================

  // 🔄 MODIFICADO: Verificar ventas pendientes (MANTENER para compatibilidad)
  checkPendingSales: async (fecha = null) => {
    // Redirigir al nuevo método
    return await shipmentService.checkAvailableSales(fecha);
  },

  // 🔄 MODIFICADO: Obtener ventas detalladas para reporte (MANTENER para compatibilidad)
  getPendingSalesDetailed: async (fecha = null) => {
    // Redirigir al nuevo método
    return await shipmentService.getAvailableSales(fecha);
  },

  // 🔄 MODIFICADO: Generar reporte de envíos con ventas seleccionadas
  generateShipmentsReport: async (reportData) => {
    try {
      const response = await api.post("/shipments/generate-report", reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateBatchLabels: async (batchId) => {
    try {
      // 🔧 CORREGIDO: Usar authService.getToken()
      const token = authService.getToken();

      if (!token) {
        throw new Error(
          "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
        );
      }

      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const apiPath = `/api/shipments/batch/${batchId}/generate-labels`;
      const fullURL = `${backendURL}${apiPath}`;

      console.log("🏷️ Generando etiquetas desde:", fullURL);

      // Hacer petición con headers de autorización
      const response = await fetch(fullURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);

        if (response.status === 401) {
          throw new Error(
            "Sesión expirada. Por favor, inicia sesión nuevamente."
          );
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para generar etiquetas.");
        } else if (response.status === 404) {
          throw new Error(
            "Lote no encontrado o sin envíos para generar etiquetas."
          );
        } else {
          throw new Error(`Error ${response.status}: ${errorData}`);
        }
      }

      // Obtener el contenido HTML de las etiquetas
      const htmlContent = await response.text();

      // Abrir en nueva ventana con el contenido HTML
      const newWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        throw new Error(
          "El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio."
        );
      }

      // Escribir el HTML en la nueva ventana
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.document.title = `Etiquetas - Lote ${shipmentService.formatBatchId(
        batchId
      )}`;

      // Focus en la nueva ventana y preparar para imprimir
      newWindow.focus();

      // Opcional: Abrir automáticamente el diálogo de impresión después de un pequeño delay
      setTimeout(() => {
        newWindow.print();
      }, 1000);

      return { success: true, message: "Etiquetas generadas en nueva pestaña" };
    } catch (error) {
      console.error("Error generando etiquetas:", error);
      throw error;
    }
  },

  // ==========================================
  // 🆕 HELPERS PARA ETIQUETAS
  // ==========================================

  // Formatear datos de venta para etiqueta
  formatSaleForLabel: (sale, shipmentDate) => {
    if (!sale) return null;

    const cliente = sale.cliente || {};
    const isPaid =
      sale.estado_pago === "Pagado" || sale.estado_pago_real === "Pagado";
    const amountToPay = parseFloat(sale.total) || 0;

    return {
      saleNumber: sale.numero_venta || "N/A",
      saleDate: shipmentService.formatDate(sale.fecha),
      shipmentDate: shipmentService.formatDate(shipmentDate),
      customerName:
        `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() ||
        "Cliente no especificado",
      customerPhone: cliente.telefono || "Sin teléfono",
      customerAddress:
        cliente.direccion_completa || cliente.direccion || "Sin dirección",
      isPaid: isPaid,
      amountToPay: shipmentService.formatPrice(amountToPay),
      rawAmount: amountToPay,
    };
  },

  // Calcular número de páginas necesarias para etiquetas
  calculateLabelPages: (totalLabels) => {
    const labelsPerPage = 6; // 6 etiquetas por hoja A4
    return Math.ceil(totalLabels / labelsPerPage);
  },

  // Organizar etiquetas en páginas
  organizeLabelsByPages: (labels) => {
    const labelsPerPage = 6;
    const pages = [];

    for (let i = 0; i < labels.length; i += labelsPerPage) {
      const pageLabels = labels.slice(i, i + labelsPerPage);

      // Rellenar con etiquetas vacías si es necesario para completar la página
      while (
        pageLabels.length < labelsPerPage &&
        i + pageLabels.length < labels.length
      ) {
        pageLabels.push(null); // Etiqueta vacía
      }

      pages.push({
        pageNumber: Math.floor(i / labelsPerPage) + 1,
        labels: pageLabels,
      });
    }

    return pages;
  },

  // ==========================================
  // 🆕 MÉTODOS PARA HTML (REEMPLAZA PDF)
  // ==========================================

  // 🆕 VISUALIZAR reporte HTML en una nueva pestaña
  viewBatchHTML: async (batchId) => {
    try {
      // 🔧 CORREGIDO: Ya no necesitamos import aquí porque está al principio del archivo
      const token = authService.getToken();

      // Verificar si tenemos token
      if (!token) {
        throw new Error(
          "No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
        );
      }

      // 🔧 SOLUCIÓN: Usar fetch con headers de autorización apropiados
      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const apiPath = `/api/shipments/batch/${batchId}/view-html`;
      const fullURL = `${backendURL}${apiPath}`;

      console.log("🔍 Intentando obtener reporte desde:", fullURL);

      // Hacer petición con headers de autorización
      const response = await fetch(fullURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);

        if (response.status === 401) {
          throw new Error(
            "Sesión expirada. Por favor, inicia sesión nuevamente."
          );
        } else if (response.status === 403) {
          throw new Error("No tienes permisos para acceder a este reporte.");
        } else {
          throw new Error(`Error ${response.status}: ${errorData}`);
        }
      }

      // Obtener el contenido HTML
      const htmlContent = await response.text();

      // Abrir en nueva ventana con el contenido HTML
      const newWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        throw new Error(
          "El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio."
        );
      }

      // Escribir el HTML en la nueva ventana
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.document.title = `Reporte - Lote ${shipmentService.formatBatchId(
        batchId
      )}`;

      return { success: true, message: "Reporte abierto en nueva pestaña" };
    } catch (error) {
      console.error("Error abriendo reporte HTML:", error);
      throw error;
    }
  },

  // 🆕 MÉTODO ALTERNATIVO: Si el backend espera el token como query parameter
  viewBatchHTMLWithQueryToken: (batchId) => {
    try {
      // 🔧 CORREGIDO: Usar authService.getToken()
      const token = authService.getToken();

      if (!token) {
        throw new Error("No se encontró token de autenticación.");
      }

      // Usar query parameter en lugar de header
      const backendURL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";
      const fullURL = `${backendURL}/api/shipments/batch/${batchId}/view-html?token=${encodeURIComponent(
        token
      )}`;

      console.log("🔍 Intentando abrir URL con token en query:", fullURL);

      // Abrir en nueva pestaña
      const newWindow = window.open(
        fullURL,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        throw new Error(
          "El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio."
        );
      }

      return { success: true, message: "Reporte abierto en nueva pestaña" };
    } catch (error) {
      console.error("Error abriendo reporte HTML:", error);
      throw error;
    }
  },

  // 🆕 Generar archivo HTML para un lote (opcional)
  generateBatchHTML: async (batchId) => {
    try {
      const response = await api.post(
        `/shipments/batch/${batchId}/generate-html`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 🆕 Listar archivos PDF disponibles
  listBatchPDFs: async () => {
    try {
      const response = await api.get(`/shipments/pdfs/list`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // ACTUALIZACIÓN DE ESTADOS
  // ==========================================

  // Actualizar estado de un envío específico
  updateShipmentStatus: async (shipmentId, statusData) => {
    try {
      const response = await api.put(
        `/shipments/${shipmentId}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar múltiples envíos de un lote
  updateBatchStatus: async (batchId, updates) => {
    try {
      const response = await api.put(`/shipments/batch/${batchId}/status`, {
        updates,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  // Obtener estadísticas de envíos
  getShipmentStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.fecha_desde)
        queryParams.append("fecha_desde", params.fecha_desde);
      if (params.fecha_hasta)
        queryParams.append("fecha_hasta", params.fecha_hasta);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/shipments/stats?${queryString}`
        : "/shipments/stats";

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ==========================================
  // 🆕 HELPERS PARA SELECCIÓN DE VENTAS
  // ==========================================

  // 🆕 Formatear venta para lista de selección
  formatSaleForSelection: (sale) => {
    if (!sale) return null;

    return {
      id: sale.id,
      numero_venta: sale.numero_venta,
      fecha: sale.fecha,
      estado_venta: sale.estado_venta, // 'En proceso' o 'Reprogramado'
      cliente: {
        nombre: sale.cliente?.nombre || "Cliente no especificado",
        telefono: sale.cliente?.telefono,
        direccion: sale.cliente?.direccion_completa || "Sin dirección",
      },
      items: sale.items || [],
      total: sale.total || 0,
      metodo_pago: sale.metodo_pago || "Sin método",
      estado_pago: sale.estado_pago || "Pendiente",
      // 🆕 Información para mostrar en la interfaz
      display: {
        fecha_formatted: shipmentService.formatDate(sale.fecha),
        total_formatted: shipmentService.formatPrice(sale.total),
        items_count: sale.items?.length || 0,
        items_summary:
          sale.items
            ?.map((item) => `${item.cantidad}x ${item.producto}`)
            .join(", ") || "",
      },
    };
  },

  // 🆕 Validar selección de ventas
  validateSaleSelection: (selectedSales) => {
    const errors = [];

    if (!Array.isArray(selectedSales) || selectedSales.length === 0) {
      errors.push("Debe seleccionar al menos una venta");
    }

    // Validar que todas las ventas tengan direcciones completas
    const salesWithIncompleteAddress = selectedSales.filter((sale) => {
      const direccion =
        sale.cliente?.direccion || sale.cliente?.direccion_completa;
      return (
        !direccion ||
        direccion.trim().length < 10 ||
        direccion === "Sin dirección"
      );
    });

    if (salesWithIncompleteAddress.length > 0) {
      errors.push(
        `${salesWithIncompleteAddress.length} ventas tienen direcciones incompletas`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      salesWithIncompleteAddress,
    };
  },

  // 🆕 Calcular estadísticas de ventas seleccionadas
  calculateSelectionStats: (selectedSales) => {
    if (!Array.isArray(selectedSales) || selectedSales.length === 0) {
      return {
        count: 0,
        total_amount: 0,
        total_items: 0,
        estados: {},
        metodos_pago: {},
      };
    }

    const stats = {
      count: selectedSales.length,
      total_amount: selectedSales.reduce(
        (sum, sale) => sum + (parseFloat(sale.total) || 0),
        0
      ),
      total_items: selectedSales.reduce((sum, sale) => {
        return (
          sum +
          (sale.items?.reduce(
            (itemSum, item) => itemSum + (item.cantidad || 0),
            0
          ) || 0)
        );
      }, 0),
      estados: {},
      metodos_pago: {},
    };

    // Contar por estado
    selectedSales.forEach((sale) => {
      const estado = sale.estado_venta || "Sin estado";
      stats.estados[estado] = (stats.estados[estado] || 0) + 1;
    });

    // Contar por método de pago
    selectedSales.forEach((sale) => {
      const metodo = sale.metodo_pago || "Sin método";
      stats.metodos_pago[metodo] = (stats.metodos_pago[metodo] || 0) + 1;
    });

    return stats;
  },

  // 🆕 Obtener información del estado de venta con colores
  getSaleStatusInfo: (estado_venta) => {
    const statusMap = {
      "En proceso": {
        color: "primary",
        text: "En proceso",
        icon: "⚡",
        description: "Lista para envío",
        bgColor: "#e3f2fd",
        textColor: "#1565c0",
      },
      Reprogramado: {
        color: "warning",
        text: "Reprogramado",
        icon: "📅",
        description: "Necesita reenvío",
        bgColor: "#fff3e0",
        textColor: "#ef6c00",
      },
      Enviado: {
        color: "info",
        text: "Enviado",
        icon: "🚚",
        description: "En distribución",
        bgColor: "#e1f5fe",
        textColor: "#0277bd",
      },
      Entregado: {
        color: "success",
        text: "Entregado",
        icon: "✅",
        description: "Entrega completada",
        bgColor: "#e8f5e8",
        textColor: "#2e7d32",
      },
      Cancelado: {
        color: "error",
        text: "Cancelado",
        icon: "❌",
        description: "Venta cancelada",
        bgColor: "#ffebee",
        textColor: "#c62828",
      },
    };
    return (
      statusMap[estado_venta] || {
        color: "default",
        text: estado_venta || "Desconocido",
        icon: "❓",
        description: "",
        bgColor: "#f5f5f5",
        textColor: "#757575",
      }
    );
  },

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  // Formatear fecha para display
  formatDate: (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  // Formatear datetime para display
  formatDateTime: (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // 🆕 Formatear precio
  formatPrice: (amount) => {
    if (amount === null || amount === undefined) return "$0";
    return `$${parseFloat(amount).toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  },

  // Formatear batch ID para display
  formatBatchId: (batchId) => {
    if (!batchId) return "";
    // ENV-20250618-1430-01 -> ENV-2025/06/18 14:30 #01
    const parts = batchId.split("-");
    if (parts.length === 4) {
      const [prefix, date, time, number] = parts;
      const formattedDate = `${date.slice(0, 4)}/${date.slice(
        4,
        6
      )}/${date.slice(6, 8)}`;
      const formattedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}`;
      return `${prefix}-${formattedDate} ${formattedTime} #${number}`;
    }
    return batchId;
  },

  // Obtener información del estado de entrega con colores
  getDeliveryStatusInfo: (estado_entrega) => {
    const statusMap = {
      Pendiente: {
        color: "warning",
        text: "Pendiente",
        icon: "⏳",
        description: "En espera de entrega",
        bgColor: "#fff3cd",
        textColor: "#856404",
      },
      Entregado: {
        color: "success",
        text: "Entregado",
        icon: "✅",
        description: "Entrega completada",
        bgColor: "#d1edff",
        textColor: "#0c5460",
      },
      "No encontrado": {
        color: "error",
        text: "No encontrado",
        icon: "❌",
        description: "Cliente no encontrado",
        bgColor: "#f8d7da",
        textColor: "#721c24",
      },
      Reprogramado: {
        color: "info",
        text: "Reprogramado",
        icon: "📅",
        description: "Entrega reprogramada",
        bgColor: "#d1ecf1",
        textColor: "#0c5460",
      },
      Cancelado: {
        color: "default",
        text: "Cancelado",
        icon: "🚫",
        description: "Entrega cancelada",
        bgColor: "#e2e3e5",
        textColor: "#383d41",
      },
    };
    return (
      statusMap[estado_entrega] || {
        color: "default",
        text: estado_entrega || "Desconocido",
        icon: "❓",
        description: "",
        bgColor: "#f8f9fa",
        textColor: "#6c757d",
      }
    );
  },

  // Obtener información del estado de pago con colores
  getPaymentStatusInfo: (estado_pago_real) => {
    const statusMap = {
      Pendiente: {
        color: "warning",
        text: "Pendiente",
        icon: "💰",
        description: "Pago pendiente",
        bgColor: "#fff3cd",
        textColor: "#856404",
      },
      Pagado: {
        color: "success",
        text: "Pagado",
        icon: "💳",
        description: "Pago confirmado",
        bgColor: "#d4edda",
        textColor: "#155724",
      },
      Rechazado: {
        color: "error",
        text: "Rechazado",
        icon: "❌",
        description: "Pago rechazado",
        bgColor: "#f8d7da",
        textColor: "#721c24",
      },
    };
    return (
      statusMap[estado_pago_real] || {
        color: "default",
        text: estado_pago_real || "Desconocido",
        icon: "❓",
        description: "",
        bgColor: "#f8f9fa",
        textColor: "#6c757d",
      }
    );
  },

  // Obtener progreso del envío (porcentaje)
  getShipmentProgress: (estado_entrega, estado_pago_real) => {
    const deliveryProgress = {
      Pendiente: 25,
      Entregado: 75,
      "No encontrado": 0,
      Reprogramado: 50,
      Cancelado: 0,
    };

    const paymentProgress = {
      Pendiente: 0,
      Pagado: 25,
      Rechazado: 0,
    };

    const delivery = deliveryProgress[estado_entrega] || 0;
    const payment = paymentProgress[estado_pago_real] || 0;

    return Math.min(100, delivery + payment);
  },

  // Verificar si el envío está completado
  isShipmentCompleted: (shipment) => {
    if (!shipment) return false;
    return (
      shipment.estado_entrega === "Entregado" &&
      shipment.estado_pago_real === "Pagado"
    );
  },

  // ==========================================
  // BUSINESS LOGIC HELPERS
  // ==========================================

  // 🔄 MODIFICADO: Validar datos para generar reporte
  validateReportData: (reportData) => {
    const errors = [];

    if (reportData.sale_ids && reportData.sale_ids.length === 0) {
      errors.push("Debe seleccionar al menos una venta");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Preparar datos para actualización de estado
  prepareStatusUpdateData: (statusData) => {
    const preparedData = {};

    if (statusData.estado_entrega !== undefined) {
      preparedData.estado_entrega = statusData.estado_entrega;
    }

    if (statusData.estado_pago_real !== undefined) {
      preparedData.estado_pago_real = statusData.estado_pago_real;
    }

    if (statusData.observaciones_distribuidor !== undefined) {
      preparedData.observaciones_distribuidor =
        statusData.observaciones_distribuidor?.trim() || null;
    }

    return preparedData;
  },

  // Agrupar envíos por estado
  groupShipmentsByStatus: (shipments) => {
    if (!Array.isArray(shipments)) return {};

    return shipments.reduce((groups, shipment) => {
      const status = shipment.estado_entrega || "Sin estado";
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(shipment);
      return groups;
    }, {});
  },

  // Calcular estadísticas de un lote
  calculateBatchStats: (shipments) => {
    if (!Array.isArray(shipments) || shipments.length === 0) {
      return {
        total: 0,
        entregados: 0,
        pendientes: 0,
        no_encontrados: 0,
        reprogramados: 0,
        cancelados: 0,
        pagados: 0,
        pagos_pendientes: 0,
        completados: 0,
        progreso: 0,
      };
    }

    const stats = {
      total: shipments.length,
      entregados: shipments.filter((s) => s.estado_entrega === "Entregado")
        .length,
      pendientes: shipments.filter((s) => s.estado_entrega === "Pendiente")
        .length,
      no_encontrados: shipments.filter(
        (s) => s.estado_entrega === "No encontrado"
      ).length,
      reprogramados: shipments.filter(
        (s) => s.estado_entrega === "Reprogramado"
      ).length,
      cancelados: shipments.filter((s) => s.estado_entrega === "Cancelado")
        .length,
      pagados: shipments.filter((s) => s.estado_pago_real === "Pagado").length,
      pagos_pendientes: shipments.filter(
        (s) => s.estado_pago_real === "Pendiente"
      ).length,
      completados: shipments.filter((s) =>
        shipmentService.isShipmentCompleted(s)
      ).length,
    };

    // Calcular progreso general
    stats.progreso =
      stats.total > 0 ? Math.round((stats.completados / stats.total) * 100) : 0;

    return stats;
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  // Construir parámetros de búsqueda para APIs
  buildSearchParams: (filters) => {
    const params = {};

    if (filters.fecha) {
      params.fecha = filters.fecha;
    }

    if (filters.fecha_desde) {
      params.fecha_desde = filters.fecha_desde;
    }

    if (filters.fecha_hasta) {
      params.fecha_hasta = filters.fecha_hasta;
    }

    if (filters.estado_entrega && filters.estado_entrega !== "all") {
      params.estado_entrega = filters.estado_entrega;
    }

    if (filters.estado_pago_real && filters.estado_pago_real !== "all") {
      params.estado_pago_real = filters.estado_pago_real;
    }

    if (filters.batch_id) {
      params.batch_id = filters.batch_id;
    }

    return params;
  },

  // Formatear envío para display en listas
  formatShipmentForDisplay: (shipment) => {
    if (!shipment) return null;

    const deliveryInfo = shipmentService.getDeliveryStatusInfo(
      shipment.estado_entrega
    );
    const paymentInfo = shipmentService.getPaymentStatusInfo(
      shipment.estado_pago_real
    );
    const progress = shipmentService.getShipmentProgress(
      shipment.estado_entrega,
      shipment.estado_pago_real
    );

    return {
      id: shipment.id,
      batch_id: shipment.shipment_batch_id,
      fecha_envio: shipmentService.formatDate(shipment.fecha_envio),
      delivery_status: deliveryInfo,
      payment_status: paymentInfo,
      progress: progress,
      is_completed: shipmentService.isShipmentCompleted(shipment),
      venta: shipment.venta,
      observaciones: shipment.observaciones_distribuidor,
      ultima_actualizacion: shipmentService.formatDateTime(
        shipment.fecha_actualizacion
      ),
    };
  },

  // ==========================================
  // CONSTANTS
  // ==========================================

  // Estados de entrega
  DELIVERY_STATES: [
    "Pendiente",
    "Entregado",
    "No encontrado",
    "Reprogramado",
    "Cancelado",
  ],

  // Estados de pago real
  PAYMENT_STATES: ["Pendiente", "Pagado", "Rechazado"],

  // 🆕 Estados de venta
  SALE_STATES: [
    "En proceso",
    "Enviado",
    "Entregado",
    "Reprogramado",
    "Cancelado",
  ],

  // 🆕 Estados disponibles para selección de envío
  AVAILABLE_FOR_SHIPMENT_STATES: ["En proceso", "Reprogramado"],

  // Acciones rápidas comunes
  QUICK_ACTIONS: [
    {
      id: "mark_delivered",
      label: "Marcar como Entregado",
      estado_entrega: "Entregado",
      estado_pago_real: "Pagado",
      color: "success",
      icon: "✅",
    },
    {
      id: "mark_not_found",
      label: "No Encontrado",
      estado_entrega: "No encontrado",
      color: "error",
      icon: "❌",
    },
    {
      id: "mark_rescheduled",
      label: "Reprogramar",
      estado_entrega: "Reprogramado",
      color: "info",
      icon: "📅",
    },
    {
      id: "mark_payment_pending",
      label: "Pago Pendiente",
      estado_pago_real: "Pendiente",
      color: "warning",
      icon: "💰",
    },
  ],

  // Filtros predefinidos
  PREDEFINED_FILTERS: [
    {
      id: "today",
      label: "Hoy",
      getValue: () => new Date().toISOString().split("T")[0],
    },
    {
      id: "yesterday",
      label: "Ayer",
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split("T")[0];
      },
    },
    {
      id: "last_7_days",
      label: "Últimos 7 días",
      getValue: () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return {
          fecha_desde: sevenDaysAgo.toISOString().split("T")[0],
          fecha_hasta: new Date().toISOString().split("T")[0],
        };
      },
    },
  ],

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  // Health check del módulo de envíos
  healthCheck: async () => {
    try {
      const response = await api.get("/shipments/health");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==========================================
// 🆕 CONSTANTES ADICIONALES
// ==========================================

// Agregar a las constantes existentes
export const BATCH_STATES = [
  "ACTIVO", // Lote recién creado, envíos en proceso
  "EN_PROCESO", // Algunos envíos completados, otros pendientes
  "COMPLETADO", // Todos los envíos entregados y pagados
  "FINALIZADO", // Lote cerrado manualmente (con faltantes)
  "ARCHIVADO", // Lote movido al historial
];

// Agregar filtros para historial
export const HISTORY_FILTERS = [
  {
    id: "last_week",
    label: "Última semana",
    getValue: () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        fecha_desde: weekAgo.toISOString().split("T")[0],
        fecha_hasta: new Date().toISOString().split("T")[0],
      };
    },
  },
  {
    id: "last_month",
    label: "Último mes",
    getValue: () => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return {
        fecha_desde: monthAgo.toISOString().split("T")[0],
        fecha_hasta: new Date().toISOString().split("T")[0],
      };
    },
  },
  {
    id: "completed_only",
    label: "Solo completados",
    getValue: () => ({ solo_completados: true }),
  },
  {
    id: "include_archived",
    label: "Incluir archivados",
    getValue: () => ({ incluir_archivados: true }),
  },
];

// ==========================================
// 🆕 NUEVOS MÉTODOS PARA HISTORIAL
// ==========================================

// Obtener historial de lotes con filtros
shipmentService.getBatchHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.estado) queryParams.append("estado", params.estado);
    if (params.fecha_desde)
      queryParams.append("fecha_desde", params.fecha_desde);
    if (params.fecha_hasta)
      queryParams.append("fecha_hasta", params.fecha_hasta);
    if (params.incluir_archivados)
      queryParams.append("incluir_archivados", "true");
    if (params.solo_completados) queryParams.append("solo_completados", "true");
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/shipments/batches/history?${queryString}`
      : "/shipments/batches/history";

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener estadísticas del historial
shipmentService.getHistoryStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.fecha_desde)
      queryParams.append("fecha_desde", params.fecha_desde);
    if (params.fecha_hasta)
      queryParams.append("fecha_hasta", params.fecha_hasta);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/shipments/batches/history/stats?${queryString}`
      : "/shipments/batches/history/stats";

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Calcular estado automático del lote
shipmentService.calculateBatchState = (batchStats) => {
  const { total, completados, entregados, cancelados } = batchStats;

  if (completados === total) {
    return "COMPLETADO";
  }

  const procesados = entregados + cancelados;
  if (procesados === total) {
    return "FINALIZADO"; // Todos procesados pero no todos pagados
  }

  if (procesados > 0) {
    return "EN_PROCESO";
  }

  return "ACTIVO";
};

// Actualizar estado de lote
shipmentService.updateBatchState = async (batchId) => {
  try {
    const response = await api.put(`/shipments/batch/${batchId}/update-state`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Archivar lote
shipmentService.archiveBatch = async (batchId) => {
  try {
    const response = await api.put(`/shipments/batch/${batchId}/archive`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Archivado automático
shipmentService.autoArchiveOldBatches = async (daysOld = 30) => {
  try {
    const response = await api.post("/shipments/batches/auto-archive", {
      days_old: daysOld,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener información del estado del lote
shipmentService.getBatchStateInfo = (estado) => {
  const stateMap = {
    ACTIVO: {
      color: "primary",
      text: "Activo",
      icon: "🚀",
      description: "Lote recién creado",
      bgColor: "#e3f2fd",
      textColor: "#1565c0",
      canEdit: true,
      canFinalize: false,
      canArchive: false,
    },
    EN_PROCESO: {
      color: "warning",
      text: "En Proceso",
      icon: "⚡",
      description: "Envíos en progreso",
      bgColor: "#fff3e0",
      textColor: "#ef6c00",
      canEdit: true,
      canFinalize: true,
      canArchive: false,
    },
    COMPLETADO: {
      color: "success",
      text: "Completado",
      icon: "✅",
      description: "Todos los envíos finalizados",
      bgColor: "#e8f5e8",
      textColor: "#2e7d32",
      canEdit: false,
      canFinalize: false,
      canArchive: true,
    },
    FINALIZADO: {
      color: "info",
      text: "Finalizado",
      icon: "🏁",
      description: "Cerrado manualmente",
      bgColor: "#e1f5fe",
      textColor: "#0277bd",
      canEdit: false,
      canFinalize: false,
      canArchive: true,
    },
    ARCHIVADO: {
      color: "default",
      text: "Archivado",
      icon: "📦",
      description: "Movido al historial",
      bgColor: "#f5f5f5",
      textColor: "#757575",
      canEdit: false,
      canFinalize: false,
      canArchive: false,
    },
  };

  return (
    stateMap[estado] || {
      color: "default",
      text: estado || "Desconocido",
      icon: "❓",
      description: "",
      bgColor: "#f8f9fa",
      textColor: "#6c757d",
      canEdit: false,
      canFinalize: false,
      canArchive: false,
    }
  );
};

// Calcular edad del lote
shipmentService.calculateBatchAge = (fechaCreacion) => {
  const now = new Date();
  const created = new Date(fechaCreacion);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else {
    return `${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  }
};

// Agregar las nuevas constantes al objeto principal
shipmentService.BATCH_STATES = BATCH_STATES;
shipmentService.HISTORY_FILTERS = HISTORY_FILTERS;

// Export por defecto también
export default shipmentService;
