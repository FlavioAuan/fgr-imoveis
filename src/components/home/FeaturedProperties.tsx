import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { getFeaturedProperties } from "@/data/properties";

export function FeaturedProperties() {
  const featured = getFeaturedProperties();

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-3">
              Selecionados para você
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
              Imóveis em destaque
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md">
              Confira algumas das melhores oportunidades selecionadas pela FGR
              Imóveis.
            </p>
          </div>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Ver todos os imóveis
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* CTA mobile */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white font-medium px-8 py-4 text-sm hover:bg-neutral-700 transition-colors"
          >
            Ver todos os imóveis
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
