export type Region = "chiapas" | "tabasco" | "tapachula";

import chiapasPostalCodesRaw from "@/data/postal-codes/chiapas.json";
import tabascoPostalCodesRaw from "@/data/postal-codes/tabasco.json";
import tapachulaPostalCodesRaw from "@/data/postal-codes/tapachula.json";

export const POSTAL_CODE_STORAGE_KEY = "ahorramas.postalCode";
export const POSTAL_CODE_COOKIE_KEY = "ahorramas_postal_code";
export const POSTAL_CODE_REGION_STORAGE_KEY = "ahorramas.postalRegion";
export const POSTAL_CODE_REGION_COOKIE_KEY = "ahorramas_postal_region";

function createPostalCodeSet(values: string[]): Set<string> {
  return new Set(
    values.map(normalizePostalCode).filter(isPostalCodeFormatValid),
  );
}

const TAPACHULA_POSTAL_CODES = createPostalCodeSet(tapachulaPostalCodesRaw);
const TABASCO_POSTAL_CODES = createPostalCodeSet(tabascoPostalCodesRaw);
const CHIAPAS_POSTAL_CODES = createPostalCodeSet(chiapasPostalCodesRaw);

// Fallback temporal mientras se completa la carga de Códigos Postales reales.
const TABASCO_PREFIXES = ["86"];
const CHIAPAS_PREFIXES = ["29"];

export function normalizePostalCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function isPostalCodeFormatValid(value: string): boolean {
  return /^\d{5}$/.test(value);
}

export function getRegionsForPostalCode(postalCode: string): Region[] {
  const normalized = normalizePostalCode(postalCode);

  if (!isPostalCodeFormatValid(normalized)) {
    return [];
  }

  if (TAPACHULA_POSTAL_CODES.has(normalized)) {
    return ["tapachula"];
  }

  const exactRegions: Region[] = [];

  if (TABASCO_POSTAL_CODES.has(normalized)) {
    exactRegions.push("tabasco");
  }

  if (CHIAPAS_POSTAL_CODES.has(normalized)) {
    exactRegions.push("chiapas");
  }

  if (exactRegions.length > 0) {
    return exactRegions;
  }

  if (TABASCO_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return ["tabasco"];
  }

  if (CHIAPAS_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return ["chiapas"];
  }

  return [];
}

export function resolveRegionByPostalCode(
  postalCode: string,
  preferredRegion?: Region | null,
): Region | null {
  const regions = getRegionsForPostalCode(postalCode);

  if (regions.length === 0) {
    return null;
  }

  if (preferredRegion && regions.includes(preferredRegion)) {
    return preferredRegion;
  }

  if (regions.length === 1) {
    return regions[0];
  }

  return null;
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }

  return null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;

  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`;
}
