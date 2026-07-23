"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, User, ShoppingCart, MapPin, Menu, X } from "lucide-react";
import {
    CATEGORY_COLOR_CLASSES,
    CATEGORY_NAV_ITEMS,
    categoryFromPathname,
    normalizeCategoryToNavKey,
} from "@/lib/categoryNavigation";
import { normalizePostalCode, type Region } from "@/lib/location";
import { useLocation } from "@/components/providers/LocationProvider";

const POSTAL_MODAL_DISMISSED_KEY = "ahorramas_postal_modal_dismissed";

function formatRegionLabel(region: Region): string {
    if (region === "chiapas") return "Chiapas";
    if (region === "tabasco") return "Tabasco";
    return "Tapachula";
}

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchQueryInUrl = searchParams.get("q") || "";
    const [query, setQuery] = useState(searchQueryInUrl);
    const [isNavbarSearching, setIsNavbarSearching] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [postalModalOpen, setPostalModalOpen] = useState(false);
    const [postalModalDismissedForSession, setPostalModalDismissedForSession] = useState(() => {
        if (typeof window === "undefined") return true; // Always dismissed on server to prevent hydration mismatch
        return window.sessionStorage.getItem(POSTAL_MODAL_DISMISSED_KEY) === "1";
    });

    const {
        postalCode,
        region,
        hasValidPostalCode,
        ambiguousRegions,
        setPostalCode,
        clearPostalCode,
    } = useLocation();

    const [postalCodeInput, setPostalCodeInput] = useState(postalCode);
    const [postalCodeMessage, setPostalCodeMessage] = useState("");
    const [pendingAmbiguousRegions, setPendingAmbiguousRegions] = useState<Region[]>([]);

    const queryCategory = searchParams.get("categoria") || searchParams.get("cat");
    const activeCategory =
        normalizeCategoryToNavKey(queryCategory) || categoryFromPathname(pathname);

    function getLinkClass(href: string, key?: keyof typeof CATEGORY_COLOR_CLASSES) {
        if (key && activeCategory === key) {
            return `${CATEGORY_COLOR_CLASSES[key].active} transition`;
        }

        if (href === "/" && pathname === "/" && !activeCategory) {
            return "text-[#CE2C3C] hover:text-[#CE2C3C] transition";
        }

        if (key) {
            return `text-[#626264] ${CATEGORY_COLOR_CLASSES[key].hover} transition`;
        }

        return "text-[#626264] hover:text-[#CE2C3C] transition";
    }

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanQuery = (isNavbarSearching ? query : searchQueryInUrl).trim();
        if (cleanQuery) router.push(`/buscar?q=${encodeURIComponent(cleanQuery)}`);
    }

    useEffect(() => {
        if (!isNavbarSearching) return;

        const handler = setTimeout(() => {
            const cleanQuery = query.trim();

            if (!cleanQuery) {
                if (pathname === "/buscar" && searchQueryInUrl) {
                    router.replace("/buscar", { scroll: false });
                }
                return;
            }

            if (pathname === "/buscar" && searchQueryInUrl === cleanQuery) {
                return;
            }

            router.replace(`/buscar?q=${encodeURIComponent(cleanQuery)}`, { scroll: false });
        }, 280);

        return () => clearTimeout(handler);
    }, [isNavbarSearching, pathname, query, router, searchQueryInUrl]);

    function handleNavbarQueryChange(value: string) {
        setIsNavbarSearching(true);
        setQuery(value);
    }

    function stopNavbarSearchSync() {
        setIsNavbarSearching(false);
        setQuery(searchQueryInUrl);
    }

    function clearPostalModalDismissal() {
        if (typeof window === "undefined") return;
        window.sessionStorage.removeItem(POSTAL_MODAL_DISMISSED_KEY);
    }

    function dismissPostalModalForSession() {
        if (typeof window === "undefined") return;
        window.sessionStorage.setItem(POSTAL_MODAL_DISMISSED_KEY, "1");
    }

    function openPostalModal() {
        setPostalCodeInput(postalCode || "");
        setPostalCodeMessage("");
        setPendingAmbiguousRegions([]);
        setPostalModalDismissedForSession(false);
        clearPostalModalDismissal();
        setPostalModalOpen(true);
    }

    function closePostalModal() {
        setPostalModalOpen(false);

        if (!hasValidPostalCode) {
            setPostalModalDismissedForSession(true);
            dismissPostalModalForSession();
        }
    }

    function handlePostalCodeSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const result = setPostalCode(postalCodeInput);

        if (!result.ok) {
            setPostalCodeMessage(result.message || "No se pudo guardar el Código Postal.");
            setPendingAmbiguousRegions(result.ambiguousRegions || []);
            return;
        }

        setPostalCodeInput(normalizePostalCode(postalCodeInput));
        setPostalCodeMessage("Código Postal guardado correctamente.");
        setPendingAmbiguousRegions([]);
        setPostalModalOpen(false);
        setPostalModalDismissedForSession(false);
        clearPostalModalDismissal();
    }

    function handleAmbiguousRegionSelect(selectedRegion: Region) {
        const result = setPostalCode(postalCodeInput, selectedRegion);

        if (!result.ok) {
            setPostalCodeMessage(result.message || "No se pudo guardar la zona.");
            return;
        }

        setPostalCodeMessage(`Zona confirmada: ${formatRegionLabel(selectedRegion)}.`);
        setPendingAmbiguousRegions([]);
        setPostalModalOpen(false);
        setPostalModalDismissedForSession(false);
        clearPostalModalDismissal();
    }

    function handlePostalCodeClear() {
        clearPostalCode();
        setPostalCodeInput("");
        setPostalCodeMessage("Código Postal eliminado.");
        setPendingAmbiguousRegions([]);
        setPostalModalDismissedForSession(false);
        clearPostalModalDismissal();
    }

    const regionsToResolve =
        pendingAmbiguousRegions.length > 0 ? pendingAmbiguousRegions : ambiguousRegions;
    const shouldAutoOpenPostalModal = !hasValidPostalCode && !postalModalDismissedForSession;
    const isPostalModalVisible = postalModalOpen || shouldAutoOpenPostalModal;

    return (
        <nav className="bg-[#F4F4F5] border-b border-[#E4E4E7] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1 text-[#626264] hover:text-[#CE2C3C] transition md:hidden focus:outline-none"
                        aria-label="Abrir menú"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <div className="hidden md:flex items-center flex-col gap-2 w-auto object-contain ">
                        <Link href="/">
                            <img src="/images/logo.png" alt="Mueblerías Ahorramás" className="md:h-12 w-auto object-contain" />
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-[#626264]">
                            <MapPin className="w-4 h-4 text-zinc-800" />
                            {hasValidPostalCode ? (
                                <span>
                                    Código Postal: <strong className="text-[#CE2C3C]">{postalCode}</strong>
                                </span>
                            ) : (
                                <span>Enviar a:</span>
                            )}
                            <button
                                type="button"
                                onClick={openPostalModal}
                                className="text-[11px] font-bold underline text-[#CE2C3C] hover:text-[#A8202D]"
                            >
                                {hasValidPostalCode ? "Cambiar C.P." : "Ingresar Código Postal"}
                            </button>
                            {hasValidPostalCode && (
                                <button
                                    type="button"
                                    onClick={handlePostalCodeClear}
                                    className="text-[10px] font-bold text-zinc-500 underline hover:text-[#CE2C3C]"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        {hasValidPostalCode && region && (
                            <p className="text-[10px] font-semibold text-zinc-600">
                                Zona activa: <span className="text-[#CE2C3C]">{formatRegionLabel(region)}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex-col gap-2 w-auto justify-items-center">
                        <form onSubmit={handleSearch} className="hidden md:flex max-w-lg relative items-center w-full">
                            <input
                                type="text"
                                value={isNavbarSearching ? query : searchQueryInUrl}
                                onFocus={() => setIsNavbarSearching(true)}
                                onBlur={stopNavbarSearchSync}
                                onChange={(event) => handleNavbarQueryChange(event.target.value)}
                                placeholder="Busca salas, recámaras, comedores, colchones ..."
                                className="w-full bg-[#FAFAFA] border border-zinc-300 rounded-full py-2.5 px-5 pr-12 text-sm text-[#1A1A1A] placeholder-zinc-500 outline-none focus:border-[#CE2C3C] focus:bg-white transition shadow-inner"
                            />
                            <Search className="w-5 h-5 text-zinc-600 absolute right-4 cursor-pointer" />
                        </form>
                        <div className="hidden md:flex items-center pt-2 gap-4 lg:gap-5 text-[13px] font-semibold text-[#626264] overflow-x-auto text-center">
                            {CATEGORY_NAV_ITEMS.map((item) => (
                                <Link key={item.label} href={item.href} className={getLinkClass(item.href, item.key)}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex-row md:flex flex-col  items-center gap-3">
                        <div className="sm:hidden md:flex items-center gap-3">
                            <button className="flex lg:flex-row sm:flex-col items-center gap-1 sm:text-sm font-semibold text-[#626264] hover:text-[#CE2C3C] transition">
                                <ShoppingCart className="w-4 h-4  text-zinc-800" />
                                <span className="text-[10px] sm:text-xs">Carrito</span>
                            </button>
                            <button className="flex lg:flex-row sm:flex-col items-center gap-1 sm:text-sm font-semibold text-[#626264] hover:text-[#CE2C3C] transition">
                                <User className="w-4 h-4 text-zinc-800" />
                                <span className="text-[10px] sm:text-xs">Cuenta</span>
                            </button>
                        </div>
                        <button className="sm:hidden md:flex bg-[#CE2C3C] text-white px-3 py-1.5 rounded-full text-sm font-bold hover:bg-[#A8202D] transition shadow-sm">
                            Contáctanos
                        </button>
                    </div>

                    <div className="flex gap-2 w-full justify-items-center md:hidden ">
                        <form onSubmit={handleSearch} className="max-w-lg relative items-center w-full flex">
                            <input
                                type="text"
                                value={isNavbarSearching ? query : searchQueryInUrl}
                                onFocus={() => setIsNavbarSearching(true)}
                                onBlur={stopNavbarSearchSync}
                                onChange={(event) => handleNavbarQueryChange(event.target.value)}
                                placeholder="Busca salas, recámaras, comedores..."
                                className="w-full bg-white border border-zinc-300 rounded-full py-2 px-4 pr-10 text-sm outline-none focus:border-[#CE2C3C] transition shadow-sm"
                            />
                            <Search className="w-4 h-4 text-[#626264] absolute right-3" />
                        </form>

                        <div className="flex items-center gap-1 text-[11px] text-[#626264] mt-1">
                            <span>📍</span>
                            <button
                                type="button"
                                onClick={openPostalModal}
                                className="rounded-md bg-[#CE2C3C] px-2 py-1 text-[10px] font-bold text-white"
                            >
                                {hasValidPostalCode ? postalCode : "Ingresar Código Postal"}
                            </button>
                        </div>
                        {hasValidPostalCode && region && (
                            <p className="text-[10px] font-semibold text-zinc-600 mt-1">
                                {formatRegionLabel(region)}
                            </p>
                        )}
                        <div className="flex items-center gap-3 ">
                            <button className="flex-col items-center  gap-1 text-sm font-semibold text-[#626264] hover:text-[#CE2C3C] transition">
                                <ShoppingCart className="w-4 h-4 text-zinc-800 justify-self-center" />
                                <span className="text-xs">Carrito</span>
                            </button>
                            <button className="flex-col items-center gap-1 text-sm font-semibold text-[#626264] hover:text-[#CE2C3C] transition">
                                <User className="w-4 h-4 text-zinc-800 justify-self-center" />
                                <span className="text-xs">Cuenta</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`fixed inset-y-0 left-0 bg-white w-64 border-r border-[#E4E4E7] shadow-lg transform transition-transform duration-300 ease-in-out z-50 p-6 flex flex-col gap-6 md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
                    <Link href="/" className="flex align-center justify-center flex-1">
                        <img src="/images/logo.png" alt="Mueblerías Ahorramás" className="h-8 md:h-12 w-auto object-contain" />
                    </Link>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-[#626264] hover:text-[#CE2C3C]">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex flex-col gap-4 text-sm font-semibold text-[#626264]">
                    {CATEGORY_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={getLinkClass(item.href, item.key)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="border-t border-[#E4E4E7] pt-4 mt-auto">
                    <button className="w-full bg-[#CE2C3C] text-white py-2 rounded-md text-xs font-bold hover:bg-[#A8202D] transition shadow-sm mb-3">
                        Contáctanos
                    </button>
                </div>
            </div>

            {isPostalModalVisible && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/35 px-4" role="dialog" aria-modal="true" aria-label="Seleccion de codigo postal">
                    <div className="w-full max-w-md rounded-3xl bg-[#f1f1f2] p-6 shadow-xl border border-zinc-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-2xl font-extrabold text-zinc-900">Selecciona tu Región de Envío</h3>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Manejamos diferentes costos de cobertura para Chiapas y Tabasco.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closePostalModal}
                                className="rounded-md p-1 text-zinc-500 hover:text-[#CE2C3C]"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handlePostalCodeSubmit} className="mt-5 space-y-3">
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                value={postalCodeInput}
                                onChange={(event) => {
                                    setPostalCodeInput(normalizePostalCode(event.target.value));
                                    if (postalCodeMessage) setPostalCodeMessage("");
                                }}
                                placeholder="Ingresa tu Código Postal (Ej.29000 o 86000)"
                                className="w-full rounded-xl border border-zinc-300 bg-[#f7f7f7] px-4 py-3 text-base text-zinc-700 outline-none focus:border-[#CE2C3C]"
                                aria-label="Código Postal"
                            />

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-[#CE2C3C] px-4 py-3 text-base font-bold text-white hover:bg-[#A8202D]"
                            >
                                Aplicar Código Postal
                            </button>
                        </form>

                        {postalCodeMessage && (
                            <p className="mt-3 text-xs text-zinc-600">{postalCodeMessage}</p>
                        )}

                        {hasValidPostalCode && region && (
                            <p className="mt-2 text-xs font-semibold text-zinc-700">
                                Zona activa: <span className="text-[#CE2C3C]">{formatRegionLabel(region)}</span>
                            </p>
                        )}

                        {regionsToResolve.length > 1 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                                <span className="font-semibold">Selecciona zona:</span>
                                {regionsToResolve.map((regionOption) => (
                                    <button
                                        key={regionOption}
                                        type="button"
                                        onClick={() => handleAmbiguousRegionSelect(regionOption)}
                                        className="rounded-lg border border-zinc-300 bg-white px-3 py-1 font-bold hover:border-[#CE2C3C] hover:text-[#CE2C3C]"
                                    >
                                        {formatRegionLabel(regionOption)}
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </nav>
    );
}