import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/properties",
        "/bills",
        "/income",
        "/documents",
        "/import",
        "/bank-import",
        "/rent-tracker",
        "/tenants",
        "/compare",
        "/map",
      ],
    },
    sitemap: "https://prop-management-one.vercel.app/sitemap.xml",
  };
}
