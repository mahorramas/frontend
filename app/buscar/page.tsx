import { fetchAPI } from "@/lib/api";
import SearchRealtimeClient from "@/app/buscar/SearchRealtimeClient";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;


interface Product {
    id: string;
    nombre: string;
    categoria: string;
    badge_oferta?: string;
    tipo_oferta?: string;
    foto_icono?: string;
    imagenUrl?: string | null;
}

// Interfaces alineadas al 100% con tu schema.json de Strapi (v4 y v5)
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
        url: string;
    }> | null;
}

interface StrapiMueble {
    id?: number | string;
    documentId?: string;
    attributes?: {
        nombre?: string;
        categoria?: StrapiMuebleCategoria;
        imagen_producto: StrapiMuebleImagen;
        badge_oferta?: string;
        tipo_oferta?: string;
    };
    nombre?: string;
    categoria?: StrapiMuebleCategoria;
    imagen_producto: StrapiMuebleImagen;
    badge_oferta?: string;
    tipo_oferta?: string;
}

function mapProduct(item: StrapiMueble): Product {
    const attrs = item.attributes || item;

    // Parser dual robusto para Strapi v4 y v5 [2]
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
}

// Resuelve la URL completa de medios de Strapi (antepone http://localhost:1337)
function getStrapiMedia(url: string | null) {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return `${STRAPI_URL}${url}`;
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q } = await searchParams;

    const response = await fetchAPI("muebles", "populate=*");
    const products = response.data.map(mapProduct);

    return <SearchRealtimeClient key={q || ""} products={products} initialQuery={q || ""} />;
}