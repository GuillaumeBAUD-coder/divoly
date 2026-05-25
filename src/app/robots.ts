import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/login", "/register", "/account", "/history", "/saved", "/analytics"],
      },
    ],
    sitemap: "https://www.divoly.com/sitemap.xml",
    host: "https://www.divoly.com",
  };
}
