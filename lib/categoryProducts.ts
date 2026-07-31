import { fetchAPI, getStrapiMedia } from "@/lib/api";

export interface CategoryProduct {
  id: string;
  nombre: string;
  categoria: string;
  badge_oferta?: string;
  tipo_oferta?: string;
  foto_icono?: string;
  imagenUrl?: string | null;
  createdAt?: string;
  precio_lista_chiapas?: number;
  precio_oferta_chiapas?: number;
  precio_lista_tabasco?: number;
  precio_oferta_tabasco?: number;
  precio_lista_tapachula?: number;
  precio_oferta_tapachula?: number;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return undefined;
}

function normalizeCategoryName(value?: string): string {
  if (!value) return "Muebles";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function resolveMediaUrl(value: unknown): string | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolved = resolveMediaUrl(entry);
      if (resolved) return resolved;
    }
    return null;
  }

  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (record.data !== undefined) {
    return resolveMediaUrl(record.data);
  }

  const attrs = (record.attributes as Record<string, unknown>) || record;
  const directUrl = readString(attrs.url as string | undefined);
  if (directUrl) return directUrl;

  const formats = attrs.formats as Record<string, unknown> | undefined;
  const preferredFormats = ["large", "medium", "small", "thumbnail"];
  for (const formatName of preferredFormats) {
    const formatValue = formats?.[formatName] as Record<string, unknown> | undefined;
    const formatUrl = readString(formatValue?.url as string | undefined);
    if (formatUrl) return formatUrl;
  }

  return null;
}

export function mapCategoryProduct(rawItem: unknown): CategoryProduct {
  const item = rawItem as Record<string, unknown>;
  const attrs = (item.attributes as Record<string, unknown>) || item;

  const categoryValue = readValue(attrs, ["categoria"]);
  const categoryRecord = categoryValue as Record<string, unknown> | undefined;
  const categoryAttrs = ((categoryRecord?.data as Record<string, unknown> | undefined)?.attributes as Record<string, unknown> | undefined) || ((categoryRecord?.attributes as Record<string, unknown> | undefined) || categoryRecord);
  const categoryName = readString(categoryAttrs?.nombre) || readString(categoryRecord?.nombre) || "Muebles";

  const imageValue = readValue(attrs, ["imagen_producto", "imagen", "foto_principal", "foto", "image"]);
  const fotoUrl = resolveMediaUrl(imageValue);

  const badge = readString(readValue(attrs, ["badge_oferta", "badge", "etiqueta_oferta", "tipo_oferta"]));
  const tipo = readString(readValue(attrs, ["tipo_oferta", "tipo", "tipo_promocion", "nombre_oferta"]));

  return {
    id: String((item.documentId as string | number | undefined) || (item.id as string | number | undefined) || ""),
    nombre: readString(attrs.nombre) || "Producto sin nombre",
    categoria: categoryName.toUpperCase(),
    badge_oferta: badge,
    tipo_oferta: tipo,
    foto_icono: readString(categoryAttrs?.icono) || "🛋️",
    imagenUrl: fotoUrl ? getStrapiMedia(fotoUrl) : null,
    createdAt: readString(readValue(attrs, ["createdAt", "created_at", "fecha_creacion"])),
    precio_lista_chiapas: readNumber(readValue(attrs, ["precio_lista_chiapas", "price_list_chiapas", "precio_chiapas"])),
    precio_oferta_chiapas: readNumber(readValue(attrs, ["precio_oferta_chiapas", "price_offer_chiapas", "precio_oferta"])),
    precio_lista_tabasco: readNumber(readValue(attrs, ["precio_lista_tabasco", "price_list_tabasco", "precio_tabasco"])),
    precio_oferta_tabasco: readNumber(readValue(attrs, ["precio_oferta_tabasco", "price_offer_tabasco"])),
    precio_lista_tapachula: readNumber(readValue(attrs, ["precio_lista_tapachula", "price_list_tapachula"])),
    precio_oferta_tapachula: readNumber(readValue(attrs, ["precio_oferta_tapachula", "price_offer_tapachula"])),
  };
}

export async function loadCategoryProducts(): Promise<CategoryProduct[]> {
  const response = await fetchAPI("muebles", "populate=*");
  return (response.data || []).map(mapCategoryProduct);
}

export function matchesCategory(productCategory: string, slug: string): boolean {
  const normalized = normalizeCategoryName(productCategory);
  const normalizedSlug = normalizeCategoryName(slug);

  if (normalizedSlug === "tv") {
    return normalized.includes("tv") || normalized.includes("mueble tv");
  }
  if (normalizedSlug === "otros") {
    return (
      normalized.includes("otro") ||
      (normalized.includes("mueble") &&
        !normalized.includes("sala") &&
        !normalized.includes("recamara") &&
        !normalized.includes("comedor") &&
        !normalized.includes("colchon") &&
        !normalized.includes("tv"))
    );
  }
  if (normalizedSlug === "salas") return normalized.includes("sala");
  if (normalizedSlug === "recamaras") return normalized.includes("recamara");
  if (normalizedSlug === "comedores") return normalized.includes("comedor");
  if (normalizedSlug === "colchones") return normalized.includes("colchon");

  return false;
}
