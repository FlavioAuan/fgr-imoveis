import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, Bath, Car, Maximize2, MapPin, ChevronLeft, Check } from "lucide-react";
import { query, queryOne } from "@/lib/db";
import { mapDBToProperty } from "@/lib/propertyMapper";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { PropertyContactForm } from "@/components/properties/PropertyContactForm";
import { formatCurrency, formatArea } from "@/lib/utils";
import { propertyTypeLabels, propertyTransactionLabels } from "@/types/property";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await queryOne<Record<string, unknown>>(
    "SELECT title, property_type, transaction_type, neighborhood, city, area, bedrooms, price FROM properties WHERE slug=? LIMIT 1",
    [slug]
  );
  if (!row) return { title: "Imóvel não encontrado" };

  const type  = (propertyTypeLabels as Record<string, string>)[String(row.property_type)] ?? String(row.property_type);
  const trans = (propertyTransactionLabels as Record<string, string>)[String(row.transaction_type)] ?? String(row.transaction_type);

  return {
    title: String(row.title),
    description: `${type} para ${trans} em ${row.neighborhood ?? ""}, ${row.city}. ${formatArea(Number(row.area))}${Number(row.bedrooms) > 0 ? `, ${row.bedrooms} quartos` : ""}. ${formatCurrency(Number(row.price))}.`,
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;

  const row = await queryOne<Record<string, unknown>>(
    `SELECT p.*, a.name AS agent_name, a.phone AS agent_phone, a.email AS agent_email
     FROM properties p
     LEFT JOIN agents a ON a.id = p.agent_id
     WHERE p.slug=? AND p.status='disponivel'
     LIMIT 1`,
    [slug]
  );

  if (!row) notFound();

  const [images, featureRows] = await Promise.all([
    query<{ image_path: string }>(
      "SELECT image_path FROM property_images WHERE property_id=? ORDER BY display_order ASC",
      [Number(row.id)]
    ),
    query<{ name: string }>(
      `SELECT f.name FROM features f
       INNER JOIN property_features pf ON pf.feature_id=f.id
       WHERE pf.property_id=?`,
      [Number(row.id)]
    ),
  ]);

  const property = mapDBToProperty(
    row,
    images.map((i) => i.image_path),
    featureRows.map((f) => f.name)
  );

  const isRental = property.transaction === "aluguel";

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-neutral-400">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/imoveis" className="hover:text-neutral-900 transition-colors">Imóveis</Link>
          <span>/</span>
          <span className="text-neutral-700 line-clamp-1">{property.title}</span>
        </nav>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-900 text-white tracking-wide">
                  {isRental ? "ALUGUEL" : "VENDA"}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 border border-neutral-200 text-neutral-600">
                  {propertyTypeLabels[property.type]}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 border border-neutral-200 text-neutral-500">
                  Cód: {property.code}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-neutral-500">
                <MapPin size={16} />
                <span>
                  {property.location.address} — {property.location.neighborhood},{" "}
                  {property.location.city} / {property.location.state}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-neutral-50 border border-neutral-100 p-5 mb-8">
              <p className="text-xs text-neutral-400 mb-1">
                {isRental ? "Aluguel mensal" : "Valor de venda"}
              </p>
              <p className="text-3xl font-bold text-neutral-900">
                {formatCurrency(property.price)}
                {isRental && <span className="text-lg font-normal text-neutral-500">/mês</span>}
              </p>
              {property.condoFee != null && property.condoFee > 0 && (
                <p className="text-sm text-neutral-500 mt-2">
                  Condomínio: {formatCurrency(property.condoFee)}/mês
                  {property.iptu != null && property.iptu > 0 && (
                    <span> • IPTU: {formatCurrency(property.iptu)}/ano</span>
                  )}
                </p>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {property.area > 0 && (
                <div className="text-center p-4 border border-neutral-100">
                  <Maximize2 size={20} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-lg font-bold text-neutral-900">{formatArea(property.area)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Área total</p>
                </div>
              )}
              {property.bedrooms > 0 && (
                <div className="text-center p-4 border border-neutral-100">
                  <BedDouble size={20} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-lg font-bold text-neutral-900">{property.bedrooms}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {property.bedrooms === 1 ? "Quarto" : "Quartos"}
                    {property.suites > 0 && ` (${property.suites} suítes)`}
                  </p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center p-4 border border-neutral-100">
                  <Bath size={20} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-lg font-bold text-neutral-900">{property.bathrooms}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {property.bathrooms === 1 ? "Banheiro" : "Banheiros"}
                  </p>
                </div>
              )}
              {property.parkingSpaces > 0 && (
                <div className="text-center p-4 border border-neutral-100">
                  <Car size={20} className="mx-auto text-neutral-400 mb-2" />
                  <p className="text-lg font-bold text-neutral-900">{property.parkingSpaces}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {property.parkingSpaces === 1 ? "Vaga" : "Vagas"}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Descrição</h2>
                <p className="text-neutral-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Características</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check size={15} className="text-neutral-900 shrink-0" />
                      <span className="text-sm text-neutral-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="border-t border-neutral-100 pt-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Localização</h2>
              <div className="bg-neutral-50 border border-neutral-100 p-5">
                <p className="text-sm text-neutral-600">
                  <strong>{property.location.address}</strong>
                  <br />
                  {property.location.neighborhood} — {property.location.city} / {property.location.state}
                  {property.location.zipCode && (
                    <><br />CEP: {property.location.zipCode}</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PropertyContactForm
                propertyTitle={property.title}
                propertyCode={property.code}
                propertyId={Number(row.id)}
                propertySlug={slug}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-100">
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Voltar para imóveis
          </Link>
        </div>
      </div>
    </div>
  );
}
