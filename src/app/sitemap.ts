import { MetadataRoute } from "next";
import { getAllProperties } from "@/data/properties";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const properties = getAllProperties();
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/imoveis`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/venda-seu-imovel`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/imoveis/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
