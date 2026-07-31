"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { CATEGORY_COLOR_CLASSES, type CategoryNavKey } from "@/lib/categoryNavigation";
import type { CategoryProduct } from "@/lib/categoryProducts";

interface CategoryListProps {
  title: string;
  slug: string;
  accentKey: CategoryNavKey;
  products: CategoryProduct[];
}

type SortOption = "popular" | "precio-asc" | "precio-desc" | "nuevo";

function isNewProduct(product: CategoryProduct): boolean {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const now = Date.now();
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  return now - created <= thirtyDays;
}

function normalizeCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesCategory(productCategory: string, slug: string) {
  const normalized = normalizeCategoryName(productCategory);
  const normalizedSlug = normalizeCategoryName(slug);

  if (normalizedSlug === "tv") {
    return normalized.includes("tv") || normalized.includes("mueble tv");
  }
  if (normalizedSlug === "otros") {
    return (
      normalized.includes("otros") ||
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

function extractMaterial(name: string | undefined): string {
  const materials: Record<string, string[]> = {
    "Cuero": ["cuero", "leather"],
    "Tela": ["tela", "fabric", "algodón", "lino"],
    "Madera": ["madera", "wood", "pino", "roble"],
    "Metal": ["metal", "acero", "hierro"],
    "Rattan": ["rattan", "ratán"],
  };

  const nameLower = (name || "").toLowerCase();
  for (const [material, keywords] of Object.entries(materials)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      return material;
    }
  }
  return "Otros";
}

function getFilterOptions(products: CategoryProduct[]) {
  const materials = new Set<string>();
  const tipos = new Set<string>();

  products.forEach(p => {
    materials.add(extractMaterial(p.nombre));
    if (p.tipo_oferta) tipos.add(p.tipo_oferta);
  });

  return {
    materiales: Array.from(materials).sort(),
    tipos: Array.from(tipos).sort(),
  };
}

function getPriceInfo(product: CategoryProduct): { lista: number; oferta: number | null } {
  // Obtener precios de lista y oferta para cada región, priorizando por disponibilidad
  const precios_lista = [
    product.precio_lista_chiapas,
    product.precio_lista_tabasco,
    product.precio_lista_tapachula,
  ].filter((p): p is number => Boolean(p));

  const precios_oferta = [
    product.precio_oferta_chiapas,
    product.precio_oferta_tabasco,
    product.precio_oferta_tapachula,
  ].filter((p): p is number => Boolean(p));

  const lista = precios_lista.length > 0 ? Math.min(...precios_lista) : 0;
  const oferta = precios_oferta.length > 0 ? Math.min(...precios_oferta) : null;

  return { lista, oferta };
}

export default function CategoryListView({ title, slug, accentKey, products }: CategoryListProps) {
  const accent = CATEGORY_COLOR_CLASSES[accentKey];
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => matchesCategory(p.categoria, slug));

    if (searchTerm) {
      result = result.filter(p =>
        (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMaterial) {
      result = result.filter(p => extractMaterial(p.nombre) === selectedMaterial);
    }

    if (selectedTipo) {
      result = result.filter(p => p.tipo_oferta === selectedTipo);
    }

    // Ordenamiento
    if (sortBy === "precio-asc") {
      result.sort((a, b) => getPriceInfo(a).lista - getPriceInfo(b).lista);
    } else if (sortBy === "precio-desc") {
      result.sort((a, b) => getPriceInfo(b).lista - getPriceInfo(a).lista);
    } else if (sortBy === "nuevo") {
      result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }

    return result;
  }, [products, slug, searchTerm, selectedMaterial, selectedTipo, sortBy]);

  const filterOptions = useMemo(() => getFilterOptions(products.filter(p => matchesCategory(p.categoria, slug))), [products, slug]);

  const priceRange = useMemo(() => {
    const prices = products
      .filter(p => matchesCategory(p.categoria, slug))
      .map(product => getPriceInfo(product).lista)
      .filter(p => p > 0);

    if (prices.length === 0) return { min: 0, max: 100000 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products, slug]);

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">{title}</h1>
          <p className="text-[#626264]">Catálogo completo de {title.toLowerCase()}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Panel de filtros */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white border border-[#E4E4E7] rounded-xl p-5 space-y-5 sticky top-20">
              <h2 className="font-bold text-[#1A1A1A] text-lg">Filtrar</h2>

              {/* Búsqueda dentro de la categoría */}
              <div>
                <label className="text-sm font-semibold text-[#1A1A1A] mb-2 block">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Busca productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:border-[#CE2C3C]"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-[#626264]" />
                </div>
              </div>

              {/* Materiales */}
              {filterOptions.materiales.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Material</h3>
                  <div className="space-y-2">
                    {filterOptions.materiales.map(material => (
                      <label key={material} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="material"
                          value={material}
                          checked={selectedMaterial === material}
                          onChange={(e) => setSelectedMaterial(e.target.checked ? material : "")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-[#626264]">{material}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipo de Oferta */}
              {filterOptions.tipos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Tipo de Oferta</h3>
                  <div className="space-y-2">
                    {filterOptions.tipos.map(tipo => (
                      <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tipo"
                          value={tipo}
                          checked={selectedTipo === tipo}
                          onChange={(e) => setSelectedTipo(e.target.checked ? tipo : "")}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-[#626264]">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rango de Precios */}
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Rango de Precios</h3>
                <div className="text-xs text-[#626264]">
                  ${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}
                </div>
              </div>

              {/* Limpiar filtros */}
              {(selectedMaterial || selectedTipo || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedMaterial("");
                    setSelectedTipo("");
                    setSearchTerm("");
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition ${accent.active === "text-[#CE2C3C]" ? "bg-[#CE2C3C] text-white hover:bg-[#A8202D]" : accent.active === "text-[#D97706]" ? "bg-[#D97706] text-white hover:bg-[#B45309]" : accent.active === "text-[#0F766E]" ? "bg-[#0F766E] text-white hover:bg-[#115E59]" : accent.active === "text-[#2563EB]" ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8]" : accent.active === "text-[#0F172A]" ? "bg-[#0F172A] text-white hover:bg-[#111827]" : "bg-[#475569] text-white hover:bg-[#334155]"}`}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Área de productos */}
          <div className="flex-1">
            {/* Opciones de ordenamiento */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-[#626264]">
                <span className="font-semibold text-[#1A1A1A]">{filteredProducts.length}</span> productos encontrados
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#626264]">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-[#E4E4E7] rounded-lg text-sm focus:outline-none focus:border-[#CE2C3C] bg-white"
                >
                  <option value="popular">Más populares</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="nuevo">Más nuevos</option>
                </select>
              </div>
            </div>

            {/* Grid de productos */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#E4E4E7] rounded-xl p-12 text-center">
                <p className="text-[#626264] mb-2">No encontramos productos que coincidan con tus filtros.</p>
                <button
                  onClick={() => {
                    setSelectedMaterial("");
                    setSelectedTipo("");
                    setSearchTerm("");
                  }}
                  className="text-[#CE2C3C] font-semibold text-sm hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const isNew = isNewProduct(product);

                  return (
                    <article
                      key={product.id}
                      className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#CE2C3C] group"
                    >
                      <div className="bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden">
                        {product.badge_oferta ? (
                          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full z-10 ${accent.active === "text-[#CE2C3C]" ? "bg-red-100 text-red-700" : accent.active === "text-[#D97706]" ? "bg-yellow-100 text-yellow-700" : accent.active === "text-[#0F766E]" ? "bg-teal-100 text-teal-700" : accent.active === "text-[#2563EB]" ? "bg-blue-100 text-blue-700" : accent.active === "text-[#0F172A]" ? "bg-slate-100 text-slate-900" : "bg-gray-100 text-gray-700"}`}>
                            {product.badge_oferta}
                          </span>
                        ) : isNew ? (
                          <span className="absolute top-3 left-3 bg-[#FEF9C3] text-[#854D0E] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            Nuevo
                          </span>
                        ) : null}

                        {product.tipo_oferta && (
                          <span className="absolute bottom-3 right-3 bg-[#FDE8EA] text-[#A8202D] text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase z-10">
                            {product.tipo_oferta}
                          </span>
                        )}

                        {product.imagenUrl ? (
                          <img
                            src={product.imagenUrl}
                            alt={product.nombre}
                            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-5xl opacity-40">{product.foto_icono || "🛋️"}</span>
                        )}
                      </div>

                      <div className="p-4">
                        <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">{product.categoria}</span>
                        <h3 className="font-bold text-sm text-[#1A1A1A] mt-2 mb-4 h-10 line-clamp-2">{product.nombre}</h3>
                        <Link
                          href={`/producto/${product.id}?categoria=${encodeURIComponent(product.categoria)}`}
                          className={`block w-full bg-[#CE2C3C] text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition`}
                        >
                          Ver producto
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
