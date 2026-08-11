import { Property } from "@/types/property";

export function mapDBToProperty(
  row: Record<string, unknown>,
  imageUrls: string[] = [],
  featureNames: string[] = []
): Property {
  const images =
    imageUrls.length > 0
      ? imageUrls
      : row.cover_image
      ? [String(row.cover_image)]
      : [];

  return {
    id: String(row.id),
    slug: String(row.slug),
    code: String(row.code),
    title: String(row.title),
    description: String(row.description ?? ""),
    type: String(row.property_type) as Property["type"],
    transaction: String(row.transaction_type) as "venda" | "aluguel",
    status: String(row.status) as Property["status"],
    price: Number(row.price),
    condoFee: row.condominium_fee != null ? Number(row.condominium_fee) : undefined,
    iptu: row.iptu != null ? Number(row.iptu) : undefined,
    location: {
      address: String(row.address ?? ""),
      neighborhood: String(row.neighborhood ?? ""),
      city: String(row.city),
      state: String(row.state),
      zipCode: row.zipcode ? String(row.zipcode) : undefined,
      coordinates:
        row.latitude != null && row.longitude != null
          ? { lat: Number(row.latitude), lng: Number(row.longitude) }
          : undefined,
    },
    area: Number(row.area ?? 0),
    bedrooms: Number(row.bedrooms ?? 0),
    suites: Number(row.suites ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    parkingSpaces: Number(row.parking_spaces ?? 0),
    features: featureNames,
    images,
    featured: Boolean(Number(row.featured)),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}
