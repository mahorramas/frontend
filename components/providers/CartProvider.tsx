"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Region } from "@/lib/location";

export interface CartItem {
    key: string;
    productId: string;
    nombre: string;
    codigoProducto: string;
    categoria: string;
    imagen: string | null;
    cantidad: number;
    precioLista: number;
    precioOferta: number;
    region: Region;
    baseTela: string;
    frenteTela: string;
}

export interface NewCartItem {
    productId: string;
    nombre: string;
    codigoProducto: string;
    categoria: string;
    imagen: string | null;
    precioLista: number;
    precioOferta: number;
    region: Region;
    baseTela: string;
    frenteTela: string;
    cantidad?: number;
}

type CartContextValue = {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: NewCartItem) => void;
    removeItem: (key: string) => void;
    updateQuantity: (key: string, cantidad: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
};

const CART_STORAGE_KEY = "ahorramas_cart";

const CartContext = createContext<CartContextValue | null>(null);

function buildItemKey(item: {
    productId: string;
    baseTela: string;
    frenteTela: string;
    region: Region;
}) {
    return [item.productId, item.baseTela || "base-default", item.frenteTela || "frente-default", item.region]
        .join("::");
}

function readStoredCart(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const storedItems = readStoredCart();
            if (storedItems.length > 0) {
                setItems(storedItems);
            }
        } catch {
            // Sin acciones necesarias si localStorage no está disponible.
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated || typeof window === "undefined") return;

        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Sin acciones necesarias si localStorage no está disponible.
        }
    }, [items, isHydrated]);

    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    const addItem = useCallback((item: NewCartItem) => {
        const key = buildItemKey(item);
        const cantidad = Math.max(item.cantidad ?? 1, 1);

        setItems((current) => {
            const existingIndex = current.findIndex((cartItem) => cartItem.key === key);

            if (existingIndex >= 0) {
                const updated = [...current];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    cantidad: updated[existingIndex].cantidad + cantidad,
                };
                return updated;
            }

            return [
                ...current,
                {
                    key,
                    productId: item.productId,
                    nombre: item.nombre,
                    codigoProducto: item.codigoProducto,
                    categoria: item.categoria,
                    imagen: item.imagen,
                    cantidad,
                    precioLista: item.precioLista,
                    precioOferta: item.precioOferta,
                    region: item.region,
                    baseTela: item.baseTela,
                    frenteTela: item.frenteTela,
                },
            ];
        });
    }, []);

    const removeItem = useCallback((key: string) => {
        setItems((current) => current.filter((item) => item.key !== key));
    }, []);

    const updateQuantity = useCallback((key: string, cantidad: number) => {
        const nextCantidad = Math.max(cantidad, 1);
        setItems((current) =>
            current.map((item) =>
                item.key === key ? { ...item, cantidad: nextCantidad } : item,
            ),
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = useMemo(
        () => items.reduce((total, item) => total + item.cantidad, 0),
        [items],
    );

    const subtotal = useMemo(
        () => items.reduce((total, item) => total + item.cantidad * item.precioOferta, 0),
        [items],
    );

    const value = useMemo(
        () => ({
            items,
            isOpen,
            openCart,
            closeCart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            subtotal,
        }),
        [items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart debe usarse dentro de CartProvider");
    }

    return context;
}