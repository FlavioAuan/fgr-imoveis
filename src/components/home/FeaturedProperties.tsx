import { query } from "@/lib/db";
import { mapDBToProperty } from "@/lib/propertyMapper";
import { PUBLIC_LISTING_SQL } from "@/lib/plans";
import type { MapListing } from "@/components/map/mapConfig";
import type { PropertyType } from "@/types/property";
import { HomeListings } from "./HomeListings";

export async function FeaturedProperties() {
  const [rows, mapRows, missing] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT p.*,
        (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image
       FROM properties p
       WHERE p.featured=1 AND p.status='disponivel' AND ${PUBLIC_LISTING_SQL}
       ORDER BY p.created_at DESC
       LIMIT 8`
    ),
    query<Record<string, unknown>>(
      `SELECT p.id, p.slug, p.title, p.property_type, p.transaction_type, p.price, p.bedrooms, p.area,
        p.neighborhood, p.city, p.latitude, p.longitude,
        COALESCE(ad.company_name, ad.name) AS advertiser,
        (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image
       FROM properties p LEFT JOIN advertisers ad ON ad.id=p.advertiser_id
       WHERE p.status='disponivel' AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND ${PUBLIC_LISTING_SQL}
       ORDER BY p.featured DESC, p.created_at DESC
       LIMIT 2000`
    ),
    query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM properties p
       WHERE p.status='disponivel' AND (p.latitude IS NULL OR p.longitude IS NULL) AND ${PUBLIC_LISTING_SQL}`
    ),
  ]);

  const mapListings: MapListing[] = mapRows.map(r => ({
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    type: String(r.property_type) as PropertyType,
    transaction: r.transaction_type === "aluguel" ? "aluguel" : "venda",
    price: Number(r.price),
    bedrooms: Number(r.bedrooms ?? 0),
    area: Number(r.area ?? 0),
    neighborhood: String(r.neighborhood ?? ""),
    city: String(r.city ?? ""),
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    cover: r.cover_image ? String(r.cover_image) : null,
    advertiser: r.advertiser ? String(r.advertiser) : null,
  }));

  return (
    <HomeListings
      featured={rows.map(row => mapDBToProperty(row))}
      mapListings={mapListings}
      withoutLocation={Number(missing[0]?.total ?? 0)}
    />
  );
}
