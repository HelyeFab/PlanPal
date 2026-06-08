import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile the workspace types package so we can import its TS source directly.
  transpilePackages: ["@planpal/shared"],
};

// Points next-intl at the per-request config (i18n/request.ts).
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
