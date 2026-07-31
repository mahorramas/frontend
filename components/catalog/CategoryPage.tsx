import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryNavKey } from "@/lib/categoryNavigation";
import { CATEGORY_COLOR_CLASSES } from "@/lib/categoryNavigation";

export interface CategoryProduct {
  id: string;
  nombre: string;
  categoria: string;
  badge_oferta?: string;
  tipo_oferta?: string;
  foto_icono?: string;
  imagenUrl?: string | null;
  createdAt?: string;
}

interface CategoryPageProps {
  title: string;
  description: string;
  slug: string;
  accentKey: CategoryNavKey;
  products: CategoryProduct[];
}

function normalizeCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesCategory(productCategory: string, slug: string) {
  const normalizedCategory = normalizeCategoryName(productCategory);
  const normalizedSlug = normalizeCategoryName(slug);

  if (normalizedSlug === "tv") {
    return normalizedCategory.includes("tv") || normalizedCategory.includes("mueble tv");
  }

  if (normalizedSlug === "otros") {
    return (
      normalizedCategory.includes("otro") ||
      (normalizedCategory.includes("mueble") &&
        !normalizedCategory.includes("sala") &&
        !normalizedCategory.includes("recamara") &&
        !normalizedCategory.includes("comedor") &&
        !normalizedCategory.includes("colchon") &&
        !normalizedCategory.includes("tv"))
    );
  }

  if (normalizedSlug === "salas") return normalizedCategory.includes("sala");
  if (normalizedSlug === "recamaras") return normalizedCategory.includes("recamara");
  if (normalizedSlug === "comedores") return normalizedCategory.includes("comedor");
  if (normalizedSlug === "colchones") return normalizedCategory.includes("colchon");

  return false;
}

function getPlaceholderIcon(slug: string) {
  switch (slug) {
    case "salas":
      return "🛋️";
    case "recamaras":
      return "🛏️";
    case "comedores":
      return "🪑";
    case "colchones":
      return "🛌";
    case "tv":
      return "📺";
    default:
      return "🪑";
  }
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
  const directUrl = typeof attrs.url === "string" && attrs.url.trim() ? attrs.url : null;
  if (directUrl) return directUrl;

  const formats = attrs.formats as Record<string, unknown> | undefined;
  const preferredFormats = ["large", "medium", "small", "thumbnail"];
  for (const formatName of preferredFormats) {
    const formatValue = formats?.[formatName] as Record<string, unknown> | undefined;
    const formatUrl = typeof formatValue?.url === "string" && formatValue.url.trim() ? formatValue.url : null;
    if (formatUrl) return formatUrl;
  }

  return null;
}

export function mapCategoryProduct(rawItem: unknown): CategoryProduct {
  const item = rawItem as Record<string, unknown>;
  const attrs = (item.attributes as Record<string, unknown>) || item;
  const categoryValue = attrs.categoria as Record<string, unknown> | undefined;
  const categoryRecord = categoryValue?.data ? (categoryValue.data as Record<string, unknown>) : categoryValue;
  const categoryAttrs = ((categoryRecord?.attributes as Record<string, unknown> | undefined) || categoryRecord) as Record<string, unknown> | undefined;
  const categoryName = (categoryAttrs?.nombre as string | undefined) || "Muebles";
  const imageUrl = resolveMediaUrl(attrs.imagen_producto ?? attrs.imagen ?? attrs.foto_principal ?? attrs.foto ?? attrs.image);

  return {
    id: String((item.documentId as string | number | undefined) || (item.id as string | number | undefined) || ""),
    nombre: (attrs.nombre as string | undefined) || "Producto sin nombre",
    categoria: categoryName.toUpperCase(),
    badge_oferta: attrs.badge_oferta as string | undefined,
    tipo_oferta: attrs.tipo_oferta as string | undefined,
    foto_icono: (categoryAttrs?.icono as string | undefined) || "🛋️",
    imagenUrl: imageUrl,
    createdAt: attrs.createdAt as string | undefined || item.createdAt as string | undefined,
  };
}

function isNewProduct(product: CategoryProduct): boolean {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const now = Date.now();
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  return now - created <= thirtyDays;
}

export default function CategoryPage({ title, description, slug, accentKey, products }: CategoryPageProps) {
  const accent = CATEGORY_COLOR_CLASSES[accentKey];
  const filteredProducts = products.filter((product) => matchesCategory(product.categoria, slug));

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 min-h-[70vh]">
      <section className="rounded-[28px] border border-[#E4E4E7] bg-white shadow-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${accent.active === "text-[#CE2C3C]" ? "from-[#FFF1F2] to-[#FDE8E9]" : accent.active === "text-[#D97706]" ? "from-[#FFF7ED] to-[#FDECDC]" : accent.active === "text-[#0F766E]" ? "from-[#F0FDF9] to-[#CCFBF1]" : accent.active === "text-[#2563EB]" ? "from-[#EFF6FF] to-[#DBEAFE]" : accent.active === "text-[#0F172A]" ? "from-[#F8FAFC] to-[#E2E8F0]" : "from-[#F8FAFC] to-[#E5E7EB]"} p-6 md:p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${accent.active} bg-white/80`}>
                Catálogo Ahorramás
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#1A1A1A]">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-[#626264]">{description}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-[#1A1A1A] shadow-sm">
              <p className="font-semibold">{filteredProducts.length} productos disponibles</p>
              <p className="text-[#626264]">Diseños pensados para tu hogar</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-10 text-center text-[#626264]">
              Próximamente agregaremos más opciones en esta categoría.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((item) => (
                <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative flex h-48 items-center justify-center bg-[#F4F4F5] p-4">
                    {item.badge_oferta && (
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${accent.active} bg-white shadow-sm`}>
                        {item.badge_oferta}
                      </span>
                    )}

                    {item.tipo_oferta && (
                      <span className="absolute right-3 bottom-3 rounded-full bg-[#FDE8EA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8202D] shadow-sm">
                        {item.tipo_oferta}
                      </span>
                    )}

                    {item.imagenUrl ? (
                      <img src={item.imagenUrl} alt={item.nombre} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="text-5xl opacity-80">{item.foto_icono || getPlaceholderIcon(slug)}</span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#626264]">{item.categoria}</p>
                    <h2 className="mt-2 text-lg font-semibold text-[#1A1A1A] line-clamp-2">{item.nombre}</h2>

                    <Link
                      href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`}
                      className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${accent.active === "text-[#CE2C3C]" ? "bg-[#CE2C3C] text-white hover:bg-[#A8202D]" : accent.active === "text-[#D97706]" ? "bg-[#D97706] text-white hover:bg-[#B45309]" : accent.active === "text-[#0F766E]" ? "bg-[#0F766E] text-white hover:bg-[#115E59]" : accent.active === "text-[#2563EB]" ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]" : accent.active === "text-[#0F172A]" ? "bg-[#0F172A] text-white hover:bg-[#111827]" : "bg-[#475569] text-white hover:bg-[#334155]"}`}
                    >
                      Ver producto
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
