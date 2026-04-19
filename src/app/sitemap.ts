import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://divoly.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://divoly.com/explore", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://divoly.com/contribute", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://divoly.com/login", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://divoly.com/register", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
