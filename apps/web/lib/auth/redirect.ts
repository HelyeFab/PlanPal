/**
 * Validate a post-sign-in `from` redirect target.
 *
 * Only internal, same-origin, locale-stripped paths are allowed (the i18n
 * router re-adds the active locale). Anything else — protocol-relative URLs,
 * absolute URLs, or unknown paths — falls back to the professional area. This
 * prevents open-redirect abuse via the `from` query parameter.
 */
const FALLBACK = "/professional";
const ALLOWED = new Set([FALLBACK]);

export function sanitizeInternalPath(from: string | null | undefined): string {
  if (!from) return FALLBACK;
  // Must be root-relative, not protocol-relative (`//host`) or an absolute URL.
  if (!from.startsWith("/") || from.startsWith("//")) return FALLBACK;
  if (from.includes("://") || from.includes("\\")) return FALLBACK;

  // Drop query/hash and any leading locale segment so it matches i18n navigation.
  const pathOnly = from.split(/[?#]/)[0] ?? "";
  const stripped = pathOnly.replace(/^\/(en|it)(?=\/|$)/, "") || "/";

  return ALLOWED.has(stripped) ? stripped : FALLBACK;
}
