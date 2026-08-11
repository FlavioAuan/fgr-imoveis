import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Car, Maximize2, MapPin } from "lucide-react";
import { Property, propertyTypeLabels } from "@/types/property";
import { formatCurrency, formatArea } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const isRental = property.transaction === "aluguel";

  return (
    <Link
      href={`/imoveis/${property.slug}`}
      className={cn(
        "group block bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 tracking-wide",
              isRental
                ? "bg-neutral-700 text-white"
                : "bg-neutral-900 text-white"
            )}
          >
            {isRental ? "ALUGUEL" : "VENDA"}
          </span>
          {property.featured && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-white text-neutral-900 tracking-wide">
              DESTAQUE
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs text-neutral-300 bg-neutral-900/60 backdrop-blur-sm px-2 py-1">
            {property.code}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 border border-t-0 border-neutral-100">
        <p className="text-xs text-neutral-400 font-medium tracking-widest uppercase mb-2">
          {propertyTypeLabels[property.type]}
        </p>
        <h3 className="text-neutral-900 font-semibold text-base leading-snug mb-3 line-clamp-2 group-hover:text-neutral-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-neutral-500 text-sm mb-4">
          <MapPin size={14} className="shrink-0" />
          <span className="line-clamp-1">
            {property.location.neighborhood}, {property.location.city}
          </span>
        </div>

        {/* Specs */}
        {(property.bedrooms > 0 || property.area > 0) && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500 mb-4 border-t border-neutral-50 pt-4">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble size={15} />
                {property.bedrooms} {property.bedrooms === 1 ? "quarto" : "quartos"}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath size={15} />
                {property.bathrooms} {property.bathrooms === 1 ? "banheiro" : "banheiros"}
              </span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1.5">
                <Car size={15} />
                {property.parkingSpaces} {property.parkingSpaces === 1 ? "vaga" : "vagas"}
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1.5">
                <Maximize2 size={15} />
                {formatArea(property.area)}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">
              {isRental ? "Aluguel mensal" : "Preço de venda"}
            </p>
            <p className="text-lg font-bold text-neutral-900">
              {formatCurrency(property.price)}
              {isRental && <span className="text-sm font-normal text-neutral-500">/mês</span>}
            </p>
          </div>
          <span className="text-xs font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 group-hover:border-neutral-400 group-hover:text-neutral-400 transition-colors">
            Ver imóvel
          </span>
        </div>
      </div>
    </Link>
  );
}
