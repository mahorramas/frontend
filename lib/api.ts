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

  const url = `${baseUrl.replace(/\/$/, "")}/api/${path}${query ? `?${query}` : ""}`;

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
