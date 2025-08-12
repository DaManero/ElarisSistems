// services/georefService.js - Versión simplificada para cascada Provincia → Localidad

class GeoRefService {
  constructor() {
    this.baseUrl = "https://apis.datos.gob.ar/georef/api";
  }

  // Obtener todas las provincias argentinas
  async getProvinces() {
    try {
      console.log("🌎 Obteniendo provincias desde GeoRef...");

      const response = await fetch(
        `${this.baseUrl}/provincias?campos=id,nombre&max=24`
      );
      const result = await response.json();

      if (result.provincias && result.provincias.length > 0) {
        console.log(
          `✅ ${result.provincias.length} provincias obtenidas desde GeoRef`
        );

        // Formatear respuesta
        const provinces = result.provincias.map((province) => ({
          id: province.id,
          name: province.nombre,
          value: province.nombre,
        }));

        return {
          success: true,
          data: provinces,
        };
      } else {
        console.log("⚠️ GeoRef sin provincias, usando fallback");
        return this.getProvincesFromFallback();
      }
    } catch (error) {
      console.error("❌ Error en GeoRef provincias:", error);
      return this.getProvincesFromFallback();
    }
  }

  // Fallback de provincias argentinas
  getProvincesFromFallback() {
    const argentineProvinces = [
      {
        id: "02",
        name: "Ciudad Autónoma de Buenos Aires",
        value: "Ciudad Autónoma de Buenos Aires",
      },
      { id: "06", name: "Buenos Aires", value: "Buenos Aires" },
      { id: "10", name: "Catamarca", value: "Catamarca" },
      { id: "22", name: "Chaco", value: "Chaco" },
      { id: "26", name: "Chubut", value: "Chubut" },
      { id: "14", name: "Córdoba", value: "Córdoba" },
      { id: "18", name: "Corrientes", value: "Corrientes" },
      { id: "30", name: "Entre Ríos", value: "Entre Ríos" },
      { id: "34", name: "Formosa", value: "Formosa" },
      { id: "38", name: "Jujuy", value: "Jujuy" },
      { id: "42", name: "La Pampa", value: "La Pampa" },
      { id: "46", name: "La Rioja", value: "La Rioja" },
      { id: "50", name: "Mendoza", value: "Mendoza" },
      { id: "54", name: "Misiones", value: "Misiones" },
      { id: "58", name: "Neuquén", value: "Neuquén" },
      { id: "62", name: "Río Negro", value: "Río Negro" },
      { id: "66", name: "Salta", value: "Salta" },
      { id: "70", name: "San Juan", value: "San Juan" },
      { id: "74", name: "San Luis", value: "San Luis" },
      { id: "78", name: "Santa Cruz", value: "Santa Cruz" },
      { id: "82", name: "Santa Fe", value: "Santa Fe" },
      { id: "86", name: "Santiago del Estero", value: "Santiago del Estero" },
      {
        id: "94",
        name: "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
        value: "Tierra del Fuego",
      },
      { id: "90", name: "Tucumán", value: "Tucumán" },
    ];

    return {
      success: true,
      data: argentineProvinces.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  // Obtener localidades por provincia
  async getLocalitiesByProvince(provinceName) {
    try {
      if (!provinceName) {
        return { success: true, data: [] };
      }

      console.log(`🏘️ Obteniendo localidades para: ${provinceName}`);

      // Para CABA, devolver barrios en lugar de localidades
      if (
        provinceName.includes("Ciudad Autónoma") ||
        provinceName.includes("CABA")
      ) {
        return this.getCABABarrios();
      }

      const response = await fetch(
        `${this.baseUrl}/localidades?provincia=${encodeURIComponent(
          provinceName
        )}&campos=id,nombre&max=500&orden=nombre`
      );
      const result = await response.json();

      if (result.localidades && result.localidades.length > 0) {
        console.log(
          `✅ ${result.localidades.length} localidades obtenidas para ${provinceName}`
        );

        // Formatear y ordenar localidades
        const localities = result.localidades
          .map((locality) => ({
            id: locality.id,
            name: locality.nombre,
            value: locality.nombre,
            province: provinceName,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return {
          success: true,
          data: localities,
        };
      } else {
        console.log(`⚠️ No se encontraron localidades para ${provinceName}`);
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error(
        `❌ Error obteniendo localidades para ${provinceName}:`,
        error
      );
      return { success: false, error: error.message };
    }
  }

  // Barrios de CABA en lugar de localidades (SIN códigos postales)
  getCABABarrios() {
    const cabaBarrios = [
      { id: "retiro", name: "Retiro", value: "Retiro" },
      { id: "san-nicolas", name: "San Nicolás", value: "San Nicolás" },
      { id: "puerto-madero", name: "Puerto Madero", value: "Puerto Madero" },
      { id: "san-telmo", name: "San Telmo", value: "San Telmo" },
      { id: "la-boca", name: "La Boca", value: "La Boca" },
      { id: "barracas", name: "Barracas", value: "Barracas" },
      { id: "constitucion", name: "Constitución", value: "Constitución" },
      { id: "montserrat", name: "Montserrat", value: "Montserrat" },
      { id: "recoleta", name: "Recoleta", value: "Recoleta" },
      { id: "palermo", name: "Palermo", value: "Palermo" },
      { id: "belgrano", name: "Belgrano", value: "Belgrano" },
      { id: "nunez", name: "Núñez", value: "Núñez" },
      { id: "saavedra", name: "Saavedra", value: "Saavedra" },
      { id: "villa-urquiza", name: "Villa Urquiza", value: "Villa Urquiza" },
      {
        id: "villa-pueyrredon",
        name: "Villa Pueyrredón",
        value: "Villa Pueyrredón",
      },
      { id: "flores", name: "Flores", value: "Flores" },
      { id: "floresta", name: "Floresta", value: "Floresta" },
      { id: "villa-luro", name: "Villa Luro", value: "Villa Luro" },
      { id: "liniers", name: "Liniers", value: "Liniers" },
      { id: "mataderos", name: "Mataderos", value: "Mataderos" },
      {
        id: "parque-chacabuco",
        name: "Parque Chacabuco",
        value: "Parque Chacabuco",
      },
      { id: "caballito", name: "Caballito", value: "Caballito" },
      { id: "villa-crespo", name: "Villa Crespo", value: "Villa Crespo" },
      { id: "almagro", name: "Almagro", value: "Almagro" },
      { id: "balvanera", name: "Balvanera (Once)", value: "Balvanera" },
      { id: "villa-devoto", name: "Villa Devoto", value: "Villa Devoto" },
      {
        id: "villa-del-parque",
        name: "Villa del Parque",
        value: "Villa del Parque",
      },
      { id: "agronomia", name: "Agronomía", value: "Agronomía" },
      { id: "chacarita", name: "Chacarita", value: "Chacarita" },
      { id: "coghlan", name: "Coghlan", value: "Coghlan" },
      { id: "villa-ortuzar", name: "Villa Ortúzar", value: "Villa Ortúzar" },
      { id: "colegiales", name: "Colegiales", value: "Colegiales" },
      { id: "paternal", name: "Paternal", value: "Paternal" },
      { id: "boedo", name: "Boedo", value: "Boedo" },
      { id: "nueva-pompeya", name: "Nueva Pompeya", value: "Nueva Pompeya" },
      {
        id: "parque-patricios",
        name: "Parque Patricios",
        value: "Parque Patricios",
      },
      { id: "barrio-norte", name: "Barrio Norte", value: "Barrio Norte" },
      { id: "villa-soldati", name: "Villa Soldati", value: "Villa Soldati" },
      { id: "villa-lugano", name: "Villa Lugano", value: "Villa Lugano" },
      {
        id: "villa-riachuelo",
        name: "Villa Riachuelo",
        value: "Villa Riachuelo",
      },
      { id: "pompeya", name: "Pompeya", value: "Pompeya" },
      { id: "san-cristobal", name: "San Cristóbal", value: "San Cristóbal" },
    ].sort((a, b) => a.name.localeCompare(b.name));

    console.log(`✅ ${cabaBarrios.length} barrios de CABA obtenidos`);

    return {
      success: true,
      data: cabaBarrios,
    };
  }

  // Función de prueba de conexión
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/provincias?max=1`);
      const result = await response.json();

      if (result.provincias && result.provincias.length > 0) {
        return {
          success: true,
          message: "Conexión exitosa con GeoRef API",
          data: result.provincias[0],
        };
      }

      return {
        success: false,
        error: "GeoRef API responde pero sin datos",
      };
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error.message}`,
      };
    }
  }
}

const georefService = new GeoRefService();
export default georefService;
