import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale negotiation + redirects (e.g. `/` -> `/it`).
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`; next-intl's
 * `createMiddleware` handler is the proxy handler. See ADR-007 / ADR-008.
 */
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, the PWA manifest, and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|manifest.webmanifest|.*\\..*).*)"],
};
