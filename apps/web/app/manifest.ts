import type { MetadataRoute } from "next";

/**
 * PWA web manifest. Makes PlanPal installable / "PWA-ready".
 * A service worker and real icon assets are intentionally deferred to a later pass.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlanPal — nutrition plan companion",
    short_name: "PlanPal",
    description:
      "Follow your professional nutrition plan with less stress: approved swaps, meal ideas and shopping lists.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef2fb",
    theme_color: "#2f6bff",
    orientation: "portrait",
  };
}
