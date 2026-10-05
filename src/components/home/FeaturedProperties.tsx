import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { query } from "@/lib/db";
import { mapDBToProperty } from "@/lib/propertyMapper";

export async function FeaturedProperties() {
  const rows = await query<Record<string, unknown>>(
    `SELECT p.*,
      (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image
     FROM properties p
     WHERE p.featured=1 AND p.status='disponivel'
     ORDER BY p.created_at DESC
     LIMIT 8`
  );

  const featured = rows.map((row) => mapDBToProperty(row));

  return (
    <section className="py-20 lg:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="eyebrow bg-white mb-4">Escolhidos a dedo</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
              Imóveis em destaque
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md">
              Uma seleção dos imóveis que mais chamaram a nossa atenção. Visitamos cada um deles antes de indicar para você.
            </p>
          </div>
          <Link
            href="/imoveis"
            className="btn btn-outline hidden sm:inline-flex whitespace-nowrap"
          >
            Ver todos os imóveis
            <ArrowRight size={16} />
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-neutral-400 text-sm">Em breve, novos imóveis em destaque por aqui.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/imoveis"
            className="btn btn-dark"
          >
            Ver todos os imóveis
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
