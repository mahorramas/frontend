// src/lib/api.ts

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

function isValidStrapiUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Strapi limita a 25 registros por página por defecto.
// Al solicitar sin paginación explícita, aseguramos que se traigan todos
// los registros (hasta 100) para que ninguna categoría se quede fuera.
const DEFAULT_PAGE_SIZE = 100;

/**
 * Ayudante para realizar peticiones de forma limpia a Strapi
 * @param path Ruta del endpoint de la API (ej: "muebles")
 * @param query Parámetros opcionales de filtrado, orden o población (ej: "populate=*")
 */
export async function fetchAPI(path: string, query?: string) {
  const baseUrl = STRAPI_URL?.trim();
  if (!baseUrl || !isValidStrapiUrl(baseUrl)) {
    throw new Error("La URL de Strapi no es válida.");
  }

  // Si el llamador no define paginación, solicitamos un pageSize amplio
  // para evitar que Strapi trunque los resultados en 25 registros.
  let effectiveQuery = query || "";
  if (!effectiveQuery.includes("pagination")) {
    const separator = effectiveQuery ? "&" : "";
    effectiveQuery = `${effectiveQuery}${separator}pagination[pageSize]=${DEFAULT_PAGE_SIZE}`;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/${path}${effectiveQuery ? `?${effectiveQuery}` : ""}`;

  try {
    const response = await fetch(url, {
      // Next.js mantendrá en caché los productos para cargarlos al instante,
      // y revisará si hay cambios en Strapi de forma automática cada 60 segundos
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(
        `Error al conectar con la API de Strapi: ${response.statusText}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("fetchAPI error:", error);
    throw error;
  }
}

/**
 * Formatea correctamente las URLs de las imágenes que vienen de Strapi
 */
export function getStrapiMedia(url: string | null) {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${STRAPI_URL}${url}`;
}
