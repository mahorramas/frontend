"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Armchair,
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    ShoppingCart,
    Star,
    Tv,
} from "lucide-react";
import { useLocation } from "@/components/providers/LocationProvider";
import { getActivePrices } from "@/lib/pricing";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

type ApplicationType = "Base" | "Frente" | "Ambos";
type UnknownRecord = Record<string, unknown>;

interface Comment {
    id?: string;
    autor?: string;
    puntuacion?: number;
    titulo?: string;
    comentario?: string;
    ubicacion?: string;
}

interface ProductVariant {
    id: string;
    tela: string;
    color_hex: string;
    imagen?: string;
    tipo_aplicacion: ApplicationType;
    material_nombre?: string;
}

interface ProductDetail {
    id: string;
    nombre: string;
    codigo_producto?: string;
    badge_oferta?: string;
    tipo_oferta?: string;
    categoria: string;
    categoria_icono?: string;
    calificacion: number;
    precio_lista_chiapas?: number;
    precio_oferta_chiapas?: number;
    precio_lista_tabasco?: number;
    precio_oferta_tabasco?: number;
    precio_lista_tapachula?: number;
    precio_oferta_tapachula?: number;
    galeria: string[];
    variantes: ProductVariant[];
    comentarios: Comment[];
}

interface RelatedProduct {
    id: string;
    nombre: string;
    categoria: string;
    imagenUrl: string | null;
    precio_lista_chiapas: number;
    precio_oferta_chiapas: number;
    precio_lista_tabasco: number;
    precio_oferta_tabasco: number;
    precio_lista_tapachula: number;
    precio_oferta_tapachula: number;
    badge_oferta?: string;
    foto_icono?: string;
}

const productPopulateQuery = new URLSearchParams({
    "populate[imagen_producto]": "true",
    "populate[categoria]": "true",
    "populate[comentarios]": "true",
    "populate[variantes][populate][imagen]": "true",
    "populate[variantes][populate][tela][populate][material]": "true",
});

const catalogPopulateQuery = new URLSearchParams({
    "populate[imagen_producto]": "true",
    "populate[categoria]": "true",
});

function asRecord(value: unknown): UnknownRecord {
    return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function unwrap(value: unknown): UnknownRecord {
    const record = asRecord(value);
    const data = record.data;
    const attrs = asRecord(record.attributes);

    if (data) return unwrap(data);
    if (Object.keys(attrs).length > 0) return { ...record, ...attrs };
    return record;
}

function unwrapArray(value: unknown): UnknownRecord[] {
    if (Array.isArray(value)) return value.map(unwrap);
    const record = asRecord(value);
    if (Array.isArray(record.data)) return record.data.map(unwrap);
    return [];
}

function readString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}

function getStrapiMedia(url: string | null | undefined) {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return `${STRAPI_URL}${url}`;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2,
    }).format(value);
}

function normalizeApplicationType(value: string): ApplicationType {
    if (value === "Base" || value === "Frente" || value === "Ambos") return value;
    return "Ambos";
}

function mapProduct(rawItem: unknown): ProductDetail {
    const item = unwrap(rawItem);
    const category = unwrap(item.categoria);
    const images = unwrapArray(item.imagen_producto)
        .map((image) => readString(image.url))
        .filter(Boolean);

    const variants = unwrapArray(item.variantes)
        .map((variant, index): ProductVariant | null => {
            const tela = unwrap(variant.tela);
            const image = unwrap(variant.imagen);
            const material = unwrap(tela.material);
            const name = readString(tela.nombre).trim();
            const color = readString(tela.color_hex).trim();

            if (!name && !color && !readString(image.url)) return null;

            return {
                id: String(variant.id || `${name}-${index}`),
                tela: name || "Color disponible",
                color_hex: color || "#E5E7EB",
                imagen: readString(image.url),
                tipo_aplicacion: normalizeApplicationType(readString(tela.tipo_aplicacion)),
                material_nombre: readString(material.nombre) || undefined,
            };
        })
        .filter((variant): variant is ProductVariant => Boolean(variant));

    const comments = unwrapArray(item.comentarios).map((comment) => ({
        id: String(comment.id || crypto.randomUUID()),
        autor: readString(comment.autor) || "Cliente Ahorramás",
        puntuacion: readNumber(comment.puntuacion) || 5,
        titulo: readString(comment.titulo),
        comentario: readString(comment.comentario),
        ubicacion: readString(comment.ubicacion),
    }));

    return {
        id: String(item.documentId || item.id || ""),
        nombre: readString(item.nombre) || "Mueble sin nombre",
        codigo_producto: readString(item.codigo_producto) || String(item.id || ""),
        badge_oferta: readString(item.badge_oferta),
        tipo_oferta: readString(item.tipo_oferta),
        categoria: (readString(category.nombre) || "Muebles").toUpperCase(),
        categoria_icono: readString(category.icono),
        calificacion: readNumber(item.calificacion) || 5,
        precio_lista_chiapas: readNumber(item.precio_lista_chiapas),
        precio_oferta_chiapas: readNumber(item.precio_oferta_chiapas),
        precio_lista_tabasco: readNumber(item.precio_lista_tabasco),
        precio_oferta_tabasco: readNumber(item.precio_oferta_tabasco),
        precio_lista_tapachula: readNumber(item.precio_lista_tapachula),
        precio_oferta_tapachula: readNumber(item.precio_oferta_tapachula),
        galeria: images,
        variantes: variants,
        comentarios: comments,
    };
}

function mapRelatedProduct(rawItem: unknown): RelatedProduct {
    const item = unwrap(rawItem);
    const category = unwrap(item.categoria);
    const image = unwrapArray(item.imagen_producto)[0];

    return {
        id: String(item.documentId || item.id || ""),
        nombre: readString(item.nombre) || "Mueble sin nombre",
        categoria: (readString(category.nombre) || "Muebles").toUpperCase(),
        imagenUrl: getStrapiMedia(readString(image?.url)),
        precio_lista_chiapas: readNumber(item.precio_lista_chiapas),
        precio_oferta_chiapas: readNumber(item.precio_oferta_chiapas),
        precio_lista_tabasco: readNumber(item.precio_lista_tabasco),
        precio_oferta_tabasco: readNumber(item.precio_oferta_tabasco),
        precio_lista_tapachula: readNumber(item.precio_lista_tapachula),
        precio_oferta_tapachula: readNumber(item.precio_oferta_tapachula),
        badge_oferta: readString(item.badge_oferta),
        foto_icono: readString(category.icono),
    };
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className={className}
            aria-hidden="true"
        >
            <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" />
            <path d="M8.8 8.8c.2 3.1 2.5 5.5 5.6 6l1.1-1.1c.3-.3.7-.3 1.1-.1l1.7.9" />
        </svg>
    );
}


export default function ProductDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBaseTela, setSelectedBaseTela] = useState("");
    const [selectedFrenteTela, setSelectedFrenteTela] = useState("");
    const [selectedGalleryImage, setSelectedGalleryImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [specsOpen, setSpecsOpen] = useState(true);
    const { region, hasValidPostalCode } = useLocation();

    useEffect(() => {
        let ignore = false;

        async function loadProductData() {
            if (!id) return;
            setLoading(true);

            try {
                const [resDetail, resCatalog] = await Promise.all([
                    fetch(`${STRAPI_URL}/api/muebles/${id}?${productPopulateQuery.toString()}`),
                    fetch(`${STRAPI_URL}/api/muebles?${catalogPopulateQuery.toString()}`),
                ]);

                if (!resDetail.ok || !resCatalog.ok) {
                    throw new Error("No se pudo cargar la información del producto.");
                }

                const [jsonDetail, jsonCatalog] = await Promise.all([
                    resDetail.json(),
                    resCatalog.json(),
                ]);

                if (ignore) return;

                const mappedProduct = mapProduct(jsonDetail.data);
                const baseInitial = mappedProduct.variantes.find(
                    (variant) =>
                        variant.tipo_aplicacion === "Base" || variant.tipo_aplicacion === "Ambos",
                );
                const frontInitial = mappedProduct.variantes.find(
                    (variant) =>
                        variant.tipo_aplicacion === "Frente" || variant.tipo_aplicacion === "Ambos",
                );

                setProduct(mappedProduct);
                setSelectedBaseTela(baseInitial?.tela || "");
                setSelectedFrenteTela(frontInitial?.tela || "");
                setSelectedGalleryImage("");

                const catalogData: unknown[] = Array.isArray(jsonCatalog.data)
                    ? jsonCatalog.data
                    : [];
                setRelatedProducts(
                    catalogData
                        .map(mapRelatedProduct)
                        .filter((item) => item.id && item.id !== id)
                        .slice(0, 8),
                );
            } catch (error) {
                console.error(error);
                if (!ignore) setProduct(null);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        loadProductData();

        return () => {
            ignore = true;
        };
    }, [id]);

    const baseTelas = useMemo(
        () =>
            product?.variantes.filter(
                (variant) =>
                    variant.tipo_aplicacion === "Base" || variant.tipo_aplicacion === "Ambos",
            ) || [],
        [product],
    );

    const frenteTelas = useMemo(
        () =>
            product?.variantes.filter(
                (variant) =>
                    variant.tipo_aplicacion === "Frente" || variant.tipo_aplicacion === "Ambos",
            ) || [],
        [product],
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f6f6f7] px-4 py-20 text-center text-zinc-500">
                Cargando detalles del producto...
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-[#f6f6f7] px-4 py-20 text-center font-medium text-zinc-500">
                No se pudo localizar este producto en la base de datos.
            </main>
        );
    }

    const prices = region ? getActivePrices(product, region) : null;
    const savings = prices ? Math.max(prices.lista - prices.oferta, 0) : 0;
    const activeVariant = product.variantes.find(
        (variant) =>
            variant.tela === selectedBaseTela || variant.tela === selectedFrenteTela,
    );
    const mainImage =
        selectedGalleryImage ||
        getStrapiMedia(activeVariant?.imagen) ||
        getStrapiMedia(product.galeria[0]);
    const hasConfiguration = baseTelas.length > 0 || frenteTelas.length > 0;
    const reviewTotal = product.comentarios.length;
    const materials = Array.from(
        new Set(product.variantes.map((variant) => variant.material_nombre).filter(Boolean)),
    );
    const galleryImages = product.galeria
        .map(getStrapiMedia)
        .filter((image): image is string => Boolean(image));
    const variantImages = product.variantes
        .map((variant) => getStrapiMedia(variant.imagen))
        .filter((image): image is string => Boolean(image));
    const thumbnails = Array.from(new Set([...galleryImages, ...variantImages])).slice(0, 5);


    return (
        <div className="min-h-screen bg-[#f5f5f6] text-[#202124]">
            <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
                <div className="mb-5 text-xs text-zinc-500">
                    Inicio / Catálogo / {product.categoria} /{" "}
                    <span className="font-semibold text-[#d12d3d]">{product.nombre}</span>
                </div>

                <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
                    <div>
                        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-[#f1f1f2] p-6">
                            <div className="flex aspect-[1.28/1] items-center justify-center bg-white">
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={product.nombre}
                                        className="max-h-full w-full object-contain"
                                    />
                                ) : (
                                    <Armchair className="h-36 w-36 text-zinc-300" />
                                )}
                            </div>
                        </div>

                        {thumbnails.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
                                {thumbnails.slice(0, 4).map((image) => (
                                    <button
                                        type="button"
                                        key={image}
                                        onClick={() => setSelectedGalleryImage(image)}
                                        className={`h-16 rounded-lg border bg-white p-1 transition sm:h-20 ${(selectedGalleryImage || mainImage) === image
                                            ? "border-[#d12d3d] ring-2 ring-[#f8c9cf]"
                                            : "border-zinc-200 hover:border-zinc-300"
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Vista de ${product.nombre}`}
                                            className="h-full w-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                            <button
                                type="button"
                                onClick={() => setSpecsOpen((open) => !open)}
                                className="flex w-full items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-left text-sm font-extrabold text-zinc-800"
                            >
                                <span>Especificaciones Detalladas</span>
                                {specsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {specsOpen && (
                                <div className="overflow-x-auto px-4 py-3">
                                    <table className="w-full min-w-[480px] text-left text-xs">
                                        <tbody className="[&_td]:border-b [&_td]:border-zinc-100 [&_td]:py-2">
                                            <tr>
                                                <td className="font-bold text-zinc-500">Producto</td>
                                                <td className="font-semibold text-zinc-700">{product.nombre}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-zinc-500">Categoría</td>
                                                <td className="font-semibold text-zinc-700">{product.categoria}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-zinc-500">Código</td>
                                                <td className="font-semibold text-zinc-700">{product.codigo_producto}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-zinc-500">Materiales</td>
                                                <td className="font-semibold text-zinc-700">
                                                    {materials.length > 0 ? materials.join(", ") : "Tela y estructura seleccionadas en sucursal"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-bold text-zinc-500">Garantía Corporativa</td>
                                                <td className="font-semibold text-zinc-700">
                                                    6 meses contra cualquier defecto de fabricación
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>

                    <div>
                        <div className="mb-3">
                            <span className="inline-flex rounded-full bg-[#fde8eb] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#d12d3d]">
                                {product.badge_oferta || product.tipo_oferta || "Oferta especial"}
                            </span>
                        </div>

                        <h1 className="text-4xl font-black tracking-normal text-zinc-950 md:text-5xl">
                            {product.nombre}
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500">
                            Código de Producto: {product.codigo_producto || product.id}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <div className="flex text-[#ff9900]">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={index}
                                        className={`h-6 w-6 ${index < Math.round(product.calificacion)
                                            ? "fill-current"
                                            : "fill-zinc-200 text-zinc-200"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-zinc-500">
                                {product.calificacion.toFixed(1)} ({reviewTotal} reseñas de clientes)
                            </span>
                        </div>

                        <div className="mt-6">
                            {hasValidPostalCode && prices ? (
                                <>
                                    {prices.lista > prices.oferta && (
                                        <div className="text-base font-semibold text-zinc-400 line-through">
                                            {formatCurrency(prices.lista)}
                                        </div>
                                    )}
                                    <div className="mt-1 flex flex-wrap items-center gap-4">
                                        <span className="text-4xl font-black text-[#d12d3d]">
                                            {formatCurrency(prices.oferta)}
                                        </span>
                                        {savings > 0 && (
                                            <span className="rounded-full bg-[#fde8eb] px-4 py-2 text-sm font-extrabold text-[#d12d3d]">
                                                Ahorras {formatCurrency(savings)}
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-sm font-semibold text-zinc-600">
                                    Ingresa tu Código Postal en el navbar para ver el precio de este producto.
                                </div>
                            )}
                        </div>

                        <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-zinc-600">
                            Set premium con estructura de madera sólida estufada y acabados de alta costura a la medida del cliente.
                        </p>

                        {hasConfiguration && (
                            <section className="mt-7 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#d12d3d]">
                                    Configuración
                                </h2>

                                {baseTelas.length > 0 && (
                                    <VariantPicker
                                        number={1}
                                        title="Color de la base (estructura)"
                                        variants={baseTelas}
                                        selected={selectedBaseTela}
                                        onSelect={(variant) => {
                                            setSelectedBaseTela(variant.tela);
                                            setSelectedGalleryImage(getStrapiMedia(variant.imagen) || "");
                                        }}
                                    />
                                )}

                                {frenteTelas.length > 0 && (
                                    <VariantPicker
                                        number={baseTelas.length > 0 ? 2 : 1}
                                        title="Color del frente (cojines y respaldos)"
                                        variants={frenteTelas}
                                        selected={selectedFrenteTela}
                                        onSelect={(variant) => {
                                            setSelectedFrenteTela(variant.tela);
                                            setSelectedGalleryImage(getStrapiMedia(variant.imagen) || "");
                                        }}
                                    />
                                )}
                            </section>
                        )}

                        <div className="mt-4 rounded-3xl border border-[#f6dd64] bg-[#fff7b8] px-5 py-4 text-sm leading-7 text-[#8a5d00]">
                            <strong className="block text-[#6d4300]">¿No quieres el set completo?</strong>
                            Puedes cambiar el número de sillones del set. Solo haz click en el botón
                            &quot;Personalizar por WhatsApp&quot; para ser atendido por un asesor de sucursal.
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-[190px_1fr]">
                            <div className="flex h-12 items-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                                <span className="px-3 text-sm font-bold text-zinc-700">Cantidad:</span>
                                <button
                                    type="button"
                                    aria-label="Restar cantidad"
                                    onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                                    className="grid h-full w-10 place-items-center border-l border-zinc-200 text-zinc-700"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="grid h-full min-w-12 place-items-center border-l border-zinc-200 text-base font-bold">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Sumar cantidad"
                                    onClick={() => setQuantity((current) => current + 1)}
                                    className="grid h-full w-10 place-items-center border-l border-zinc-200 text-zinc-700"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d12d3d] px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-[#b72432]"
                                onClick={() => alert("Producto añadido al carrito")}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Añadir al carrito
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                openWhatsApp(
                                    `Hola, quiero cotizar ${product.nombre}. Cantidad: ${quantity}. Base: ${selectedBaseTela || "sin seleccionar"}. Frente: ${selectedFrenteTela || "sin seleccionar"}.`,
                                )
                            }
                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#20b857] px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-[#149447]"
                        >
                            <WhatsAppIcon className="h-5 w-5" />
                            Personalizar por WhatsApp
                        </button>
                    </div>
                </section>

                <ProductRail
                    title="Artículos relacionados"
                    products={relatedProducts.slice(0, 3)}
                    region={region}
                    hasValidPostalCode={hasValidPostalCode}
                />
                <ProductRail
                    title="Complementa con"
                    products={relatedProducts.slice(3, 6)}
                    region={region}
                    hasValidPostalCode={hasValidPostalCode}
                />

                <ReviewsSection product={product} />
            </main>

        </div>
    );
}

function VariantPicker({
    number,
    title,
    variants,
    selected,
    onSelect,
}: {
    number: number;
    title: string;
    variants: ProductVariant[];
    selected: string;
    onSelect: (variant: ProductVariant) => void;
}) {
    return (
        <div className="mt-5">
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-600">
                {number}. {title}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {variants.map((variant) => (
                    <button
                        type="button"
                        key={variant.id}
                        onClick={() => onSelect(variant)}
                        className={`flex h-14 items-center gap-2 rounded-lg border px-3 text-left text-xs font-bold transition ${selected === variant.tela
                            ? "border-[#d12d3d] bg-[#fde8eb] text-[#d12d3d] ring-2 ring-[#f8c9cf]"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                            }`}
                    >
                        <span
                            className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                            style={{ backgroundColor: variant.color_hex }}
                        />
                        <span className="line-clamp-2">{variant.tela}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ProductRail({
    title,
    products,
    region,
    hasValidPostalCode,
}: {
    title: string;
    products: RelatedProduct[];
    region: "chiapas" | "tabasco" | "tapachula" | null;
    hasValidPostalCode: boolean;
}) {
    if (products.length === 0) return null;

    return (
        <section className="mx-auto mt-14 max-w-4xl rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 text-2xl font-black text-zinc-900">{title}</h2>
            <div className="grid gap-5 sm:grid-cols-3">
                {products.map((product) => {
                    const prices = region ? getActivePrices(product, region) : null;

                    return (
                        <article
                            key={product.id}
                            className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
                        >
                            <div className="relative flex h-36 items-center justify-center bg-[#f5f5f6] p-4">
                                {product.badge_oferta && (
                                    <span className="absolute left-4 top-3 rounded-full bg-[#fde8eb] px-3 py-1 text-[10px] font-black text-[#d12d3d]">
                                        {product.badge_oferta}
                                    </span>
                                )}
                                {product.imagenUrl ? (
                                    <img
                                        src={product.imagenUrl}
                                        alt={product.nombre}
                                        className="h-full w-full object-contain"
                                    />
                                ) : product.categoria.includes("TV") ? (
                                    <Tv className="h-14 w-14 text-zinc-300" />
                                ) : (
                                    <Armchair className="h-14 w-14 text-zinc-300" />
                                )}
                            </div>
                            <div className="p-4">
                                <span className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                                    {product.categoria}
                                </span>
                                <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-extrabold text-zinc-800">
                                    {product.nombre}
                                </h3>
                                {hasValidPostalCode && prices ? (
                                    <>
                                        {prices.lista > prices.oferta && (
                                            <div className="mt-2 text-xs font-semibold text-zinc-400 line-through">
                                                {formatCurrency(prices.lista)}
                                            </div>
                                        )}
                                        <div className="text-2xl font-black text-[#d12d3d]">
                                            {formatCurrency(prices.oferta)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-2 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-[11px] font-semibold text-zinc-500">
                                        Ingresa Código Postal para ver precio
                                    </div>
                                )}
                                <Link
                                    href={`/producto/${product.id}?categoria=${encodeURIComponent(product.categoria)}`}
                                    className="mt-4 block rounded-lg bg-[#d12d3d] px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-[#b72432]"
                                >
                                    Ver producto
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function ReviewsSection({ product }: { product: ProductDetail }) {
    const distribution = [5, 4, 3].map((score) => {
        const total = product.comentarios.length || 1;
        const count = product.comentarios.filter(
            (comment) => Math.round(comment.puntuacion || 5) === score,
        ).length;
        return { score, percentage: Math.round((count / total) * 100) };
    });

    return (
        <section className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-3">
                <h2 className="text-sm font-black text-zinc-800">Opiniones</h2>
                <Minus className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-[220px_1fr]">
                <div className="text-center">
                    <div className="text-5xl font-black text-zinc-700">{product.calificacion.toFixed(1)}</div>
                    <div className="mt-1 flex justify-center text-[#ff9900]">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={`h-4 w-4 ${index < Math.round(product.calificacion)
                                    ? "fill-current"
                                    : "fill-zinc-200 text-zinc-200"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                        Basado en {product.comentarios.length} reseñas
                    </p>
                    <div className="mt-4 space-y-2 text-left text-xs font-bold text-zinc-600">
                        {distribution.map((row) => (
                            <div key={row.score} className="grid grid-cols-[70px_1fr_36px] items-center gap-2">
                                <span>{row.score} estrellas</span>
                                <span className="h-2 overflow-hidden rounded-full bg-zinc-100">
                                    <span
                                        className="block h-full rounded-full bg-[#f3b22d]"
                                        style={{ width: `${row.percentage}%` }}
                                    />
                                </span>
                                <span>{row.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-h-56 space-y-4 overflow-y-auto pr-2">
                    {product.comentarios.length > 0 ? (
                        product.comentarios.map((comment) => (
                            <article key={comment.id} className="border-b border-zinc-100 pb-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-extrabold text-zinc-800">{comment.autor}</h3>
                                        {comment.titulo && (
                                            <p className="mt-1 text-xs font-bold text-zinc-700">{comment.titulo}</p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 text-[#ff9900]">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className={`h-3.5 w-3.5 ${index < (comment.puntuacion || 5)
                                                    ? "fill-current"
                                                    : "fill-zinc-200 text-zinc-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {comment.comentario || "Súper linda y cómoda"}
                                </p>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-zinc-200 px-5 py-8 text-center text-sm text-zinc-500">
                            Aún no hay opiniones para este producto.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function openWhatsApp(message: string) {
    const phoneNumber = "529632280432";
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}
