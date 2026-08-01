"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useLocation } from "@/components/providers/LocationProvider";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2,
    }).format(value);
}

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, clearCart, totalItems, subtotal } = useCart();
    const { region } = useLocation();

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeCart();
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeCart]);

    const whatsappMessage = useMemo(() => {
        const lines = items.map(
            (item) =>
                `• ${item.nombre}${item.baseTela ? ` (Base: ${item.baseTela})` : ""}${item.frenteTela ? ` (Frente: ${item.frenteTela})` : ""} x${item.cantidad} = ${formatCurrency(item.precioOferta * item.cantidad)}`,
        );
        return encodeURIComponent(
            `Hola, quiero completar mi compra de los siguientes productos:\n\n${lines.join("\n")}\n\nSubtotal: ${formatCurrency(subtotal)}`,
        );
    }, [items, subtotal]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/40"
                onClick={closeCart}
                aria-hidden="true"
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Carrito de compras"
                className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl"
            >
                <header className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-[#d12d3d]" />
                        <h2 className="text-lg font-black text-zinc-900">
                            Mi Carrito ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={closeCart}
                        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-[#d12d3d]"
                        aria-label="Cerrar carrito"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-zinc-100">
                            <ShoppingCart className="h-9 w-9 text-zinc-400" />
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-zinc-800">Tu carrito está vacío</p>
                            <p className="mt-1 text-sm text-zinc-500">
                                Agrega productos para empezar a armar tu pedido.
                            </p>
                        </div>
                        <Link
                            href="/"
                            onClick={closeCart}
                            className="mt-2 rounded-lg bg-[#d12d3d] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#b72432]"
                        >
                            Explorar catálogo
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto px-5">
                            {items.map((item) => (
                                <li key={item.key} className="flex gap-4 py-5">
                                    <Link
                                        href={`/producto/${item.productId}?categoria=${encodeURIComponent(item.categoria)}`}
                                        onClick={closeCart}
                                        className="block h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-[#f5f5f6]"
                                    >
                                        {item.imagen ? (
                                            <img
                                                src={item.imagen}
                                                alt={item.nombre}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="grid h-full w-full place-items-center text-[10px] font-black text-zinc-400">
                                                SIN IMAGEN
                                            </span>
                                        )}
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-400">
                                                    {item.categoria}
                                                </p>
                                                <Link
                                                    href={`/producto/${item.productId}?categoria=${encodeURIComponent(item.categoria)}`}
                                                    onClick={closeCart}
                                                    className="line-clamp-2 text-sm font-extrabold text-zinc-800 transition hover:text-[#d12d3d]"
                                                >
                                                    {item.nombre}
                                                </Link>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.key)}
                                                className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-[#d12d3d]"
                                                aria-label={`Eliminar ${item.nombre}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {(item.baseTela || item.frenteTela) && (
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {item.baseTela && <span>Base: <strong>{item.baseTela}</strong></span>}
                                                {item.baseTela && item.frenteTela && " · "}
                                                {item.frenteTela && <span>Frente: <strong>{item.frenteTela}</strong></span>}
                                            </p>
                                        )}

                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <div className="flex h-8 items-center overflow-hidden rounded-md border border-zinc-200">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.key, item.cantidad - 1)}
                                                    className="grid h-full w-8 place-items-center text-zinc-600 transition hover:bg-zinc-100"
                                                    aria-label="Restar cantidad"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="grid h-full min-w-8 place-items-center border-x border-zinc-200 text-sm font-bold">
                                                    {item.cantidad}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.key, item.cantidad + 1)}
                                                    className="grid h-full w-8 place-items-center text-zinc-600 transition hover:bg-zinc-100"
                                                    aria-label="Sumar cantidad"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                {item.precioLista > item.precioOferta && (
                                                    <div className="text-xs font-semibold text-zinc-400 line-through">
                                                        {formatCurrency(item.precioLista * item.cantidad)}
                                                    </div>
                                                )}
                                                <div className="text-base font-black text-[#d12d3d]">
                                                    {formatCurrency(item.precioOferta * item.cantidad)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <footer className="border-t border-zinc-200 bg-zinc-50 px-5 py-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-zinc-600">
                                <span>Subtotal ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})</span>
                                <span className="text-xl font-black text-zinc-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">
                                {region
                                    ? `Precios calculados para tu zona: ${region === "chiapas" ? "Chiapas" : region === "tabasco" ? "Tabasco" : "Tapachula"}.`
                                    : "Ingresa tu Código Postal para ver precios de tu zona en el carrito."}
                            </p>

                            <button
                                type="button"
                                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#20b857] px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-[#149447]"
                                onClick={() => {
                                    window.open(
                                        `https://api.whatsapp.com/send?phone=529632280432&text=${whatsappMessage}`,
                                        "_blank",
                                    );
                                }}
                            >
                                Completar pedido por WhatsApp
                            </button>

                            <button
                                type="button"
                                onClick={clearCart}
                                className="mt-2 w-full py-2 text-center text-xs font-bold text-zinc-500 transition hover:text-[#d12d3d]"
                            >
                                Vaciar carrito
                            </button>
                        </footer>
                    </>
                )}
            </aside>
        </>
    );
}