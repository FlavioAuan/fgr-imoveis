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
        "group block overflow-hidden rounded-3xl bg-white p-2 ring-1 ring-neutral-200/70 transition-shadow duration-300 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
            {isRental ? "Aluguel" : "Venda"}
          </span>
          {property.featured && (
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
              Destaque
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-neutral-400">
          <span className="font-medium">{propertyTypeLabels[property.type]}</span>
          <span>Cód. {property.code}</span>
        </div>
        <h3 className="text-neutral-900 font-bold text-base leading-snug mb-2 line-clamp-2">
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
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600 mb-4">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <BedDouble size={15} className="text-neutral-400" />
                {property.bedrooms} {property.bedrooms === 1 ? "quarto" : "quartos"}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5" title="Banheiros">
                <Bath size={15} className="text-neutral-400" aria-hidden />
                {property.bathrooms}
                <span className="sr-only"> banheiros</span>
              </span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1.5" title="Vagas de garagem">
                <Car size={15} className="text-neutral-400" aria-hidden />
                {property.parkingSpaces}
                <span className="sr-only"> vagas</span>
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1.5">
                <Maximize2 size={15} className="text-neutral-400" />
                {formatArea(property.area)}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          <p className="text-lg font-bold text-neutral-900">
            {formatCurrency(property.price)}
            {isRental && <span className="text-sm font-normal text-neutral-500">/mês</span>}
          </p>
          <span className="text-sm font-semibold text-neutral-900 group-hover:underline underline-offset-4">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}
