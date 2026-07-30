export interface CategoryProduct {
  id: string;
  nombre: string;
  categoria: string;
  badge_oferta?: string;
  tipo_oferta?: string;
  foto_icono?: string;
  imagenUrl?: string | null;
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

export function mapCategoryProduct(rawItem: unknown): CategoryProduct {
  const item = rawItem as Record<string, unknown>;
  const attrs = (item.attributes as Record<string, unknown>) || item;
  const categoryData = ((attrs.categoria as Record<string, unknown> | undefined)?.data as Record<string, unknown> | undefined)?.attributes as Record<string, unknown> | undefined;
  const categoryName = (categoryData?.nombre as string | undefined) || ((attrs.categoria as Record<string, unknown> | undefined)?.nombre as string | undefined) || "Muebles";

  const fotoData = (attrs.imagen_producto as Record<string, unknown> | undefined)?.data as Array<Record<string, unknown>> | undefined;
  let fotoUrl: string | null = null;

  if (Array.isArray(fotoData) && fotoData.length > 0) {
    const first = fotoData[0];
    const firstAttrs = (first.attributes as Record<string, unknown>) || first;
    fotoUrl = (firstAttrs.url as string | undefined) || null;
  }

  const badge = readString(readValue(attrs, ["badge_oferta", "badge", "etiqueta_oferta", "tipo_oferta"]));
  const tipo = readString(readValue(attrs, ["tipo_oferta", "tipo", "tipo_promocion", "nombre_oferta"]));

  return {
    id: String((item.documentId as string | number | undefined) || (item.id as string | number | undefined) || ""),
    nombre: readString(attrs.nombre) || "Producto sin nombre",
    categoria: categoryName.toUpperCase(),
    badge_oferta: badge,
    tipo_oferta: tipo,
    foto_icono: (categoryData?.icono as string | undefined) || "🛋️",
    imagenUrl: fotoUrl,
    precio_lista_chiapas: readNumber(readValue(attrs, ["precio_lista_chiapas", "price_list_chiapas", "precio_chiapas"])),
    precio_oferta_chiapas: readNumber(readValue(attrs, ["precio_oferta_chiapas", "price_offer_chiapas", "precio_oferta"])),
    precio_lista_tabasco: readNumber(readValue(attrs, ["precio_lista_tabasco", "price_list_tabasco", "precio_tabasco"])),
    precio_oferta_tabasco: readNumber(readValue(attrs, ["precio_oferta_tabasco", "price_offer_tabasco"])),
    precio_lista_tapachula: readNumber(readValue(attrs, ["precio_lista_tapachula", "price_list_tapachula"])),
    precio_oferta_tapachula: readNumber(readValue(attrs, ["precio_oferta_tapachula", "price_offer_tapachula"])),
  };
}
