import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Bath, Car, Maximize2, MapPin } from "lucide-react";
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
        "group block overflow-hidden rounded-3xl border border-neutral-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {/* Image */}
      <div className="relative m-2 aspect-[4/3] overflow-hidden rounded-[18px] bg-neutral-100">
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
              "rounded-full px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.15em] backdrop-blur-md",
              isRental
                ? "bg-neutral-700/80 text-white"
                : "bg-neutral-950/80 text-white"
            )}
          >
            {isRental ? "ALUGUEL" : "VENDA"}
          </span>
          {property.featured && (
            <span className="rounded-full px-2.5 py-1 bg-white/90 font-mono text-[10px] font-medium tracking-[0.15em] text-neutral-900 backdrop-blur-md">
              DESTAQUE
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <span className="rounded-full px-2.5 py-1 font-mono text-[10px] text-neutral-200 bg-neutral-950/50 backdrop-blur-md">
            {property.code}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-3">
        <p className="font-mono text-[10px] text-neutral-400 font-medium tracking-[0.2em] uppercase mb-2">
          {propertyTypeLabels[property.type]}
        </p>
        <h3 className="text-neutral-900 font-semibold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-neutral-600 transition-colors">
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
          <div className="flex flex-wrap gap-2 text-xs text-neutral-600 mb-5">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
                <BedDouble size={13} />
                {property.bedrooms} {property.bedrooms === 1 ? "quarto" : "quartos"}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
                <Bath size={13} />
                {property.bathrooms} {property.bathrooms === 1 ? "banheiro" : "banheiros"}
              </span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
                <Car size={13} />
                {property.parkingSpaces} {property.parkingSpaces === 1 ? "vaga" : "vagas"}
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
                <Maximize2 size={13} />
                {formatArea(property.area)}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1">
              {isRental ? "Aluguel mensal" : "Preço de venda"}
            </p>
            <p className="font-display text-xl font-bold tracking-tight text-neutral-900">
              {formatCurrency(property.price)}
              {isRental && <span className="text-sm font-normal text-neutral-500">/mês</span>}
            </p>
          </div>
          <span
            aria-label="Ver imóvel"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:-rotate-45"
          >
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
