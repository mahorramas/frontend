"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI, getStrapiMedia } from "@/lib/api";

// Interfaz para el tipado interno de productos en Next.js
interface Product {
  id: string;
  nombre: string;
  categoria: string;
  badge_oferta?: string;
  tipo_oferta?: string;
  foto_icono?: string;
  imagenUrl?: string | null;
}

// Interfaces de Strapi (v4 y v5)
interface StrapiMuebleCategoria {
  data?: {
    attributes?: {
      nombre?: string;
      icono?: string;
    }
  } | null;
  nombre?: string;
  icono?: string;
}

interface StrapiMuebleImagen {
  data?: Array<{
    id: number;
    attributes?: {
      url: string;
    };
    url?: string;
  }> | null;
}

interface StrapiMueble {
  id?: number | string;
  documentId?: string;
  attributes?: {
    nombre?: string;
    categoria?: StrapiMuebleCategoria;
    imagen_producto?: StrapiMuebleImagen;
    badge_oferta?: string;
    tipo_oferta?: string;
  };
  nombre?: string;
  categoria?: StrapiMuebleCategoria;
  imagen_producto?: StrapiMuebleImagen;
  badge_oferta?: string;
  tipo_oferta?: string;
}

interface StrapiMueblesResponse {
  data: StrapiMueble[];
}

// Tipado del Banner
interface BannerData {
  imagen_banner: string | null;
  link_destino: string | null;
}

interface StrapiBannerImagen {
  data?: {
    id?: number;
    attributes?: { url: string };
    url?: string;
  } | null;
  url?: string;
}

interface StrapiBannerAttributes {
  imagen_banner?: StrapiBannerImagen;
  link_destino?: string;
  visualidad?: boolean;
}

interface StrapiBannerResponse {
  data: Array<
    {
      id?: number;
      attributes?: StrapiBannerAttributes;
    } & Partial<StrapiBannerAttributes>
  >;
}

const BANNER_FALLBACK: BannerData = {
  imagen_banner: null,
  link_destino: null,
};


function getSafeBannerHref(link?: string): string | null {
  if (!link) return null;

  const trimmed = link.trim();

  // Solo permitir rutas internas como:
  // /
  // /productos
  // /categoria/salas
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.includes("\\")
  ) {
    return trimmed;
  }

  return null;
}

function ProductSkeleton() {
  return (
    <div className="w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] min-w-[240px] max-w-[320px] shrink-0 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden">
      <div className="h-40 bg-zinc-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-zinc-200 rounded animate-pulse" />
        <div className="h-4 bg-zinc-200 rounded animate-pulse" />
        <div className="h-10 bg-zinc-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  // Ahora manejamos un arreglo de banners para el carrusel
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Referencia para pausar el autoplay al pasar el mouse por encima
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Carga de los Banners desde Strapi
  useEffect(() => {
    async function loadBanners() {
      try {
        setBannerLoading(true);
        // Consultamos los banners visibles sin limitar a 1 para poder armar el carrusel
        const json: StrapiBannerResponse = await fetchAPI(
          "banner-homes",
          "populate=*&filters[visualidad][$eq]=true&pagination[limit]=10"
        );
        if (json.data && json.data.length > 0) {
          const list: BannerData[] = json.data.map((item) => {
            const attrs = item.attributes || item;
            const imagenData = attrs.imagen_banner?.data || attrs.imagen_banner || null;
            const imagenUrl = getStrapiMedia(imagenData?.url || null);
            console.log(imagenUrl);
            return {
              imagen_banner: imagenUrl,
              link_destino: getSafeBannerHref(attrs.link_destino),
            };
          }).filter(b => b.imagen_banner !== null); // Filtramos los que no tengan imagen válida

          setBanners(list.length > 0 ? list : [BANNER_FALLBACK]);
        } else {
          setBanners([BANNER_FALLBACK]);
        }
      } catch (error) {
        console.error("Error al cargar banners...", error);

        setBanners([BANNER_FALLBACK]);
      } finally {
        setBannerLoading(false);
      }
    }

    loadBanners();
  }, []);

  // Efecto para el cambio automático del carrusel (Autoplay)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // 5000ms (5 segundos) es un estándar óptimo de lectura

    return () => clearInterval(interval);
  }, [banners, isPaused]);

  // Funciones de navegación manual
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  // Carga de productos desde Strapi
  useEffect(() => {
    async function loadProducts() {
      try {
        const json: StrapiMueblesResponse =
          await fetchAPI("muebles", "populate=*");
        const mapped = json.data.map((item: StrapiMueble) => {
          const attrs = item.attributes || item;

          const catData = attrs.categoria?.data?.attributes || attrs.categoria || {};
          const categoriaNombre = catData.nombre || "Muebles";
          const categoriaIcono = catData.icono || "🛋️";

          const fotoData = attrs.imagen_producto?.data || attrs.imagen_producto || null;
          let fotoUrl = null;
          if (Array.isArray(fotoData) && fotoData.length > 0) {
            const primeraFoto = fotoData[0];
            const fotoAttrs = primeraFoto.attributes || primeraFoto;
            fotoUrl = fotoAttrs.url || null;
          }

          return {
            id: item.documentId || String(item.id),
            nombre: attrs.nombre ?? "Producto sin nombre",
            categoria: categoriaNombre.toUpperCase(),
            badge_oferta: attrs.badge_oferta,
            tipo_oferta: attrs.tipo_oferta,
            foto_icono: categoriaIcono,
            imagenUrl: getStrapiMedia(fotoUrl)
          };
        });

        setProducts(mapped);
      } catch (error) {
        console.error("Error al conectar con Strapi, cargando locales...", error);
        setProducts([
          { id: "1", nombre: "Sala Marruecos", categoria: "SALAS", badge_oferta: "Oferta 30%", tipo_oferta: "Hot Sale", foto_icono: "🛋️", imagenUrl: null },
          { id: "2", nombre: "C.E. Milán", categoria: "MUEBLES TV", badge_oferta: "Oferta 30%", tipo_oferta: "Hot Sale", foto_icono: "📺", imagenUrl: null },
          { id: "3", nombre: "Recámara Porto", categoria: "RECÁMARAS", badge_oferta: "Oferta 30%", tipo_oferta: "Hot Sale", foto_icono: "🛏️", imagenUrl: null },
          { id: "4", nombre: "Comedor Nataly", categoria: "COMEDORES", badge_oferta: "Oferta 30%", tipo_oferta: "Hot Sale", foto_icono: "🪑", imagenUrl: null }
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const offerProducts = products.filter(
    (item) => item.badge_oferta || item.tipo_oferta
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen text-[#1A1A1A] font-sans antialiased">

      {/* SECCIÓN DEL HERO BANNER (Carrusel) */}
      <section className="max-w-7xl mx-auto px-6 mt-6">
        {bannerLoading ? (
          <div className="h-[180px] sm:h-[260px] md:h-[340px] lg:h-[380px] rounded-2xl bg-zinc-100 animate-pulse" />
        ) : banners.length > 0 && banners[0].imagen_banner ? (
          <div
            className="relative w-full h-[180px] sm:h-[260px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden border border-[#E4E4E7] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Contenedor de Slides */}
            {banners.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
              >
                {/* 
                  Solución para banners cuadrados o con distinta proporción:
                  1. Un contenedor de fondo con la misma imagen escalada y con desenfoque extremo (blur-2xl).
                     Esto rellena los laterales vacíos con una estética coherente al diseño del banner.
                  2. La imagen real centrada con 'object-contain', asegurando que nunca se deforme ni se recorte.
                */}
                <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden">

                  {/* Fondo difuminado para banners no apaisados */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-110 opacity-40 select-none pointer-events-none"
                    style={{ backgroundImage: `url(${item.imagen_banner})` }}
                  />

                  {/* Imagen principal */}
                  {item.link_destino ? (
                    <Link
                      href={item.link_destino}
                      className="relative z-10 w-full h-full block"
                    >
                      <img
                        src={item.imagen_banner || ""}
                        alt="Banner promocional"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </Link>
                  ) : (
                    <img
                      src={item.imagen_banner || ""}
                      alt="Banner promocional"
                      className="relative z-10 w-full h-full object-contain select-none pointer-events-none"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Controles de navegación manual (Solo si hay más de 1 banner) */}
            {banners.length > 1 && (
              <>
                {/* Flecha Izquierda */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-zinc-800 p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center w-10 h-10"
                  aria-label="Anterior slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Flecha Derecha */}
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-zinc-800 p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center w-10 h-10"
                  aria-label="Siguiente slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* Indicadores (Puntos / Dots) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
                        }`}
                      aria-label={`Ir al slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* BANNER DE RESPALDO (Texto / Gradiente) */
          <div className="bg-gradient-to-r from-[#FCE8EA] to-[#FCDCE1] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#E4E4E7] overflow-hidden relative">
            <div className="max-w-lg z-10">
              <span className="bg-white/80 text-[#CE2C3C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Especial de Temporada</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#1A1A1A] mt-4 leading-tight font-title">
                El Regalo Perfecto <br />para <span className="text-[#CE2C3C]">Mamá</span>
              </h2>
              <p className="text-zinc-600 mt-4 text-sm md:text-base">
                Aprovecha descuentos reales y flete gratis directo a domicilio en todo Chiapas y Tabasco.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center text-center bg-[#CE2C3C] text-white p-8 rounded-full w-64 h-64 border-4 border-white shadow-lg animate-pulse shrink-0">
              <span className="text-xs uppercase tracking-widest font-bold opacity-90">Toda la tienda</span>
              <span className="text-5xl font-black mt-1">40%</span>
              <span className="text-xl font-bold">+ 35%</span>
              <span className="text-xs font-extrabold uppercase mt-1">DESCUENTO + REGALO*</span>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 1: LO MÁS NUEVO */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold font-title flex items-center gap-1.5">
            Lo más <span className="text-[#CE2C3C]">nuevo</span>
          </h3>
          <p className="text-sm text-[#626264] mt-0.5">Lo recién agregado en esta temporada</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
            : products.map((item) => (
              <div key={`nuevo-${item.id}`} className="w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] min-w-[240px] max-w-[320px] shrink-0 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]">
                <div className="bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-2 left-2 bg-[#FEF9C3] text-[#854D0E] text-[10px] font-bold px-2 py-0.5 rounded-full z-10">Nuevo</span>
                  {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <span className="text-5xl opacity-80">{item.foto_icono}</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">{item.categoria}</span>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mt-1 mb-4 h-10 line-clamp-2">{item.nombre}</h4>
                  <Link href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`} className="block w-full bg-[#CE2C3C] text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* SECCIÓN 2: FAVORITOS */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold font-title">Favoritos</h3>
          <p className="text-sm text-[#626264] mt-0.5">Los mejores calificados de los usuarios</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
            : products.map((item) => (
              <div key={`fav-${item.id}`} className="w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] min-w-[240px] max-w-[320px] shrink-0 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]">
                <div className="bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden">
                  {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <span className="text-5xl opacity-80">{item.foto_icono}</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">{item.categoria}</span>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mt-1 mb-4 h-10 line-clamp-2">{item.nombre}</h4>
                  <Link href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`} className="block w-full bg-[#CE2C3C] text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* SECCIÓN 3: EN OFERTA */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold font-title">En <span className="text-[#CE2C3C]">oferta</span></h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* Filtramos para renderizar únicamente productos que tengan badge o tipo de oferta asignados */}
          {offerProducts.length > 0 ? (
            loading
              ? Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
              :
              offerProducts.map((item) => (
                <div key={`oferta-${item.id}`} className="w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] min-w-[240px] max-w-[320px] shrink-0 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]">
                  <div className="bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden">

                    {/* Solo muestra el badge superior si existe en Strapi */}
                    {item.badge_oferta && (
                      <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {item.badge_oferta}
                      </span>
                    )}

                    {/* Solo muestra el badge inferior si existe en Strapi */}
                    {item.tipo_oferta && (
                      <span className="absolute bottom-2 right-2 bg-[#FDE8EA] text-[#A8202D] text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase z-10">
                        {item.tipo_oferta}
                      </span>
                    )}

                    {item.imagenUrl ? (
                      <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <span className="text-5xl opacity-80">{item.foto_icono}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">{item.categoria}</span>
                    <h4 className="font-bold text-sm text-[#1A1A1A] mt-1 mb-4 h-10 line-clamp-2">{item.nombre}</h4>
                    <Link href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`} className="block w-full bg-[#CE2C3C] text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition">
                      Ver producto
                    </Link>
                  </div>
                </div>
              ))
          ) : (
            <div className="w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-10 text-center">
              <h4 className="text-lg font-semibold text-zinc-700">
                No hay ofertas disponibles
              </h4>

              <p className="mt-2 text-sm text-zinc-500">
                Vuelve pronto para descubrir nuevas promociones.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 4: PRODUCTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 mt-12 mb-16">
        <div className="mb-6">
          <h3 className="text-2xl font-extrabold font-title">Productos <span className="text-[#CE2C3C]">destacados</span></h3>
          <p className="text-sm text-[#626264] mt-0.5">Los más vendidos de esta temporada</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
            : products.map((item) => (
              <div key={`destacado-${item.id}`} className="w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] min-w-[240px] max-w-[320px] shrink-0 bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]">
                <div className="bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden">
                  <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">{item.badge_oferta || "Oferta 30%"}</span>
                  <span className="absolute bottom-2 right-2 bg-[#FDE8EA] text-[#A8202D] text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase z-10">{item.tipo_oferta || "Hot Sale"}</span>
                  {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <span className="text-5xl opacity-80">{item.foto_icono}</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">{item.categoria}</span>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mt-1 mb-4 h-10 line-clamp-2">{item.nombre}</h4>
                  <Link href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`} className="block w-full bg-[#CE2C3C] text-[#FAFAFA] text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition">
                    Ver producto
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}