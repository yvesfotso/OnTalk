import type { MetadataRoute } from "next";

import { APP } from "@/lib/constants/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.name} — Learn English`,
    short_name: APP.name,
    description: APP.description,
    start_url: "/app/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f2530f",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-512.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
