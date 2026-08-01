/**
 * Sanitizes a redirect query parameter value so it can only be used
 * for same-origin relative navigation.
 *
 * Attackers can craft links with a `redirect` value such as
 * `https://evil.example`, `//evil.example`, or `/\evil.example` that,
 * if trusted, would bounce users through this domain to an arbitrary
 * external site (open redirect). Passing unsanitized values to
 * `router.push` can also execute `javascript:` URLs (see Next.js
 * useRouter docs).
 *
 * This implementation uses a strict **allowlist** approach:
 *
 * 1. The value must be a plain, unencoded internal path. Any
 *    percent-encoded characters are rejected outright, which prevents
 *    double-decode bypasses such as `/%2f%2fevil.example` (decodes to
 *    `///evil.example`) or `/%5cevil.example` (decodes to
 *    `/\evil.example`).
 * 2. The value must begin with exactly one `/` and must not contain
 *    `//`, `\`, `:`, `?`, `#`, or control characters. This rules out
 *    protocol-relative URLs, scheme prefixes (`javascript:`,
 *    `https:`), query/fragment injection, and backslash variants that
 *    browsers normalize to `//`.
 * 3. The value must match one of the known internal path prefixes
 *    (home, product pages, account, search, categories, login).
 *
 * Anything that fails validation falls back to the provided fallback
 * path (defaults to `/`).
 */

const INTERNAL_PATH_PREFIXES = [
  "/producto/",
  "/cuenta",
  "/buscar",
  "/salas",
  "/recamaras",
  "/comedores",
  "/colchones",
  "/tv",
  "/otros",
  "/auth/login",
] as const;

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

function isAllowedInternalPath(value: string): boolean {
  // The root path `/` is only allowed as an exact match, not as a
  // prefix (otherwise `/unknown/path` would pass the allowlist).
  if (value === "/") {
    return true;
  }

  return INTERNAL_PATH_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function sanitizeRedirectPath(
  value: string | null,
  fallback = "/",
): string {
  if (!value) {
    return fallback;
  }

  // Reject any percent-encoded characters. This prevents double-decode
  // bypasses where `%2f` (encoded `/`) or `%5c` (encoded `\`) could be
  // used to smuggle `//` or `/\` past the checks below.
  if (value.includes("%")) {
    return fallback;
  }

  // Must be a single-slash relative path (not `//` protocol-relative).
  const isSingleSlashRelativePath =
    value.startsWith("/") && !value.startsWith("//");

  // Some browsers normalize `/\evil.example` to `//evil.example`.
  const isBackslashVariant = value.startsWith("/\\");

  // Reject scheme prefixes (`javascript:`, `https:`, `data:`, etc.),
  // query strings, and fragments.
  const containsSchemeOrQueryOrFragment = /[:?#]/.test(value);

  const containsControlCharacters = CONTROL_CHARACTERS.test(value);

  if (
    !isSingleSlashRelativePath ||
    isBackslashVariant ||
    containsSchemeOrQueryOrFragment ||
    containsControlCharacters
  ) {
    return fallback;
  }

  // Allowlist: the path must match a known internal route prefix.
  if (!isAllowedInternalPath(value)) {
    return fallback;
  }

  return value;
}