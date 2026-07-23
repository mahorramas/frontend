"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    deleteCookie,
    getRegionsForPostalCode,
    isPostalCodeFormatValid,
    normalizePostalCode,
    POSTAL_CODE_COOKIE_KEY,
    POSTAL_CODE_REGION_COOKIE_KEY,
    POSTAL_CODE_REGION_STORAGE_KEY,
    POSTAL_CODE_STORAGE_KEY,
    readCookie,
    resolveRegionByPostalCode,
    setCookie,
    type Region,
} from "@/lib/location";

type LocationContextValue = {
    postalCode: string;
    region: Region | null;
    hasValidPostalCode: boolean;
    ambiguousRegions: Region[];
    setPostalCode: (value: string, preferredRegion?: Region | null) => { ok: boolean; message?: string; ambiguousRegions?: Region[] };
    setPreferredRegion: (region: Region) => { ok: boolean; message?: string };
    clearPostalCode: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [preferredRegion, setPreferredRegionState] = useState<Region | null>(() => {
        if (typeof window === "undefined") return null;

        const fromStorage = window.localStorage.getItem(POSTAL_CODE_REGION_STORAGE_KEY);
        const fromCookie = readCookie(POSTAL_CODE_REGION_COOKIE_KEY);
        const candidate = (fromStorage || fromCookie || "") as Region;

        if (candidate === "chiapas" || candidate === "tabasco" || candidate === "tapachula") {
            return candidate;
        }

        return null;
    });

    const [postalCode, setPostalCodeState] = useState<string>(() => {
        if (typeof window === "undefined") return "";

        const fromStorage = window.localStorage.getItem(POSTAL_CODE_STORAGE_KEY);
        const fromCookie = readCookie(POSTAL_CODE_COOKIE_KEY);
        const initial = normalizePostalCode(fromStorage || fromCookie || "");

        if (!initial || !isPostalCodeFormatValid(initial)) {
            return "";
        }

        const resolvedRegion = resolveRegionByPostalCode(initial, preferredRegion);

        if (!resolvedRegion) {
            return "";
        }

        return initial;
    });

    const region: Region | null = useMemo(() => {
        if (!postalCode) return null;
        return resolveRegionByPostalCode(postalCode, preferredRegion);
    }, [postalCode, preferredRegion]);

    const ambiguousRegions = useMemo(() => {
        if (!postalCode) return [];
        const candidates = getRegionsForPostalCode(postalCode);
        return candidates.length > 1 ? candidates : [];
    }, [postalCode]);

    const setPostalCode = useCallback((value: string, preferredRegionOverride?: Region | null) => {
        const normalized = normalizePostalCode(value);

        if (!isPostalCodeFormatValid(normalized)) {
            return { ok: false, message: "Ingresa un Código Postal de 5 dígitos." };
        }

        const regions = getRegionsForPostalCode(normalized);

        if (regions.length === 0) {
            return { ok: false, message: "No contamos con cobertura para ese Código Postal." };
        }

        const preferred = preferredRegionOverride ?? preferredRegion;
        const resolvedRegion = resolveRegionByPostalCode(normalized, preferred);

        if (!resolvedRegion) {
            return {
                ok: false,
                message: "Este Código Postal existe en mas de una zona. Selecciona estado.",
                ambiguousRegions: regions,
            };
        }

        setPostalCodeState(normalized);
        setPreferredRegionState(resolvedRegion);
        window.localStorage.setItem(POSTAL_CODE_STORAGE_KEY, normalized);
        window.localStorage.setItem(POSTAL_CODE_REGION_STORAGE_KEY, resolvedRegion);
        setCookie(POSTAL_CODE_COOKIE_KEY, normalized);
        setCookie(POSTAL_CODE_REGION_COOKIE_KEY, resolvedRegion);

        return { ok: true };
    }, [preferredRegion]);

    const setPreferredRegion = useCallback((nextRegion: Region) => {
        if (!postalCode) {
            return { ok: false, message: "Primero ingresa un Código Postal." };
        }

        const regions = getRegionsForPostalCode(postalCode);

        if (!regions.includes(nextRegion)) {
            return { ok: false, message: "La zona no coincide con ese Código Postal." };
        }

        setPreferredRegionState(nextRegion);
        window.localStorage.setItem(POSTAL_CODE_REGION_STORAGE_KEY, nextRegion);
        setCookie(POSTAL_CODE_REGION_COOKIE_KEY, nextRegion);

        return { ok: true };
    }, [postalCode]);

    const clearPostalCode = useCallback(() => {
        setPostalCodeState("");
        setPreferredRegionState(null);
        window.localStorage.removeItem(POSTAL_CODE_STORAGE_KEY);
        window.localStorage.removeItem(POSTAL_CODE_REGION_STORAGE_KEY);
        deleteCookie(POSTAL_CODE_COOKIE_KEY);
        deleteCookie(POSTAL_CODE_REGION_COOKIE_KEY);
    }, []);

    const value = useMemo(
        () => ({
            postalCode,
            region,
            hasValidPostalCode: Boolean(postalCode && region),
            ambiguousRegions,
            setPostalCode,
            setPreferredRegion,
            clearPostalCode,
        }),
        [postalCode, region, ambiguousRegions, setPostalCode, setPreferredRegion, clearPostalCode],
    );

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
    const context = useContext(LocationContext);

    if (!context) {
        throw new Error("useLocation debe usarse dentro de LocationProvider");
    }

    return context;
}
