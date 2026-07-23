"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo } from "react";

type Product = {
    id: string;
    nombre: string;
    categoria: string;
    badge_oferta?: string;
    tipo_oferta?: string;
    foto_icono?: string;
    imagenUrl?: string | null;
};

export default function SearchRealtimeClient({
    products,
    initialQuery,
}: {
    products: Product[];
    initialQuery: string;
}) {
    const normalizedQuery = initialQuery.trim().toLowerCase();
    const filteredProducts = useMemo(() => {
        if (!normalizedQuery) return [];

        return products.filter((product) => {
            return (
                product.nombre.toLowerCase().includes(normalizedQuery) ||
                product.categoria.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [normalizedQuery, products]);
    const isSingleResult = filteredProducts.length === 1;

    return (
        <main className="max-w-7xl mx-auto px-6 mt-12 mb-20 min-h-[400px]">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold flex items-center gap-2">
                    <Search className="w-6 h-6 text-[#CE2C3C]" />
                    Resultados de busqueda
                </h1>

                {normalizedQuery ? (
                    <p className="text-sm text-[#626264] mt-3">
                        {filteredProducts.length} productos encontrados para{" "}
                        <span className="font-bold text-[#CE2C3C]">&quot;{initialQuery}&quot;</span>
                    </p>
                ) : (
                    <p className="text-sm text-[#626264] mt-3">
                        Escribe algo en el buscador para encontrar muebles.
                    </p>
                )}
            </div>

            {!normalizedQuery ? (
                <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 text-center text-zinc-500">
                    No hay una busqueda activa.
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white border border-[#E4E4E7] rounded-xl p-10 text-center text-zinc-500">
                    No se encontraron muebles que coincidan con tu busqueda.
                </div>
            ) : (
                <div className={isSingleResult
                    ? "grid grid-cols-1 gap-4 justify-items-center"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center"}>
                    {filteredProducts.map((item) => (
                        <article
                            key={`search-${item.id}`}
                            className={isSingleResult
                                ? "w-full max-w-[320px] lg:max-w-[520px] bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]"
                                : "w-full max-w-[320px] bg-white border border-[#E4E4E7] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#CE2C3C]"}
                        >
                            <div className={isSingleResult
                                ? "bg-[#F4F4F5] h-40 lg:h-56 flex items-center justify-center relative overflow-hidden"
                                : "bg-[#F4F4F5] h-40 flex items-center justify-center relative overflow-hidden"}>
                                {item.badge_oferta && (
                                    <span className="absolute top-2 left-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                                        {item.badge_oferta}
                                    </span>
                                )}

                                {item.imagenUrl ? (
                                    <img
                                        src={item.imagenUrl}
                                        alt={item.nombre}
                                        className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                    />
                                ) : (
                                    <span className="text-5xl opacity-80">{item.foto_icono}</span>
                                )}
                            </div>

                            <div className="p-4">
                                <span className="text-[10px] font-bold text-[#626264] tracking-wider uppercase">
                                    {item.categoria}
                                </span>

                                <h2 className="font-bold text-sm text-[#1A1A1A] mt-1 mb-4 h-10 line-clamp-2">
                                    {item.nombre}
                                </h2>

                                <Link
                                    href={`/producto/${item.id}?categoria=${encodeURIComponent(item.categoria)}`}
                                    className="block w-full bg-[#CE2C3C] text-white text-xs font-bold py-2.5 rounded-md text-center hover:bg-[#A8202D] transition"
                                >
                                    Ver producto
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
