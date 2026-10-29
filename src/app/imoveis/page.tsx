import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { query } from "@/lib/db";
import { QueryParam } from "@/lib/db";
import { mapDBToProperty } from "@/lib/propertyMapper";
import { PUBLIC_LISTING_SQL } from "@/lib/plans";
import { ListingsMapClient } from "@/components/map/ListingsMapClient";
import type { MapListing } from "@/components/map/mapConfig";
import type { PropertyType } from "@/types/property";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Imóveis",
  description:
    "Casas, apartamentos, terrenos e imóveis comerciais para comprar ou alugar em São João da Boa Vista e região, anunciados por imobiliárias, corretores e proprietários.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ImoveisPage({ searchParams }: Props) {
  const raw = await searchParams;

  const conditions = ["p.status = 'disponivel'", PUBLIC_LISTING_SQL];
  const params: QueryParam[] = [];

  const tipo      = typeof raw.tipo      === "string" ? raw.tipo      : null;
  const categoria = typeof raw.categoria === "string" ? raw.categoria : null;
  const cidade    = typeof raw.cidade    === "string" ? raw.cidade    : null;
  const quartos   = typeof raw.quartos   === "string" ? raw.quartos   : null;
  const precoMin  = typeof raw.precoMin  === "string" ? raw.precoMin  : null;
  const precoMax  = typeof raw.precoMax  === "string" ? raw.precoMax  : null;
  const areaMin   = typeof raw.areaMin   === "string" ? raw.areaMin   : null;
  const areaMax   = typeof raw.areaMax   === "string" ? raw.areaMax   : null;
  const ordenar   = typeof raw.ordenar   === "string" ? raw.ordenar   : "recentes";
  const isMap     = raw.vista === "mapa";

  if (tipo)      { conditions.push("p.transaction_type=?"); params.push(tipo); }
  if (categoria) { conditions.push("p.property_type=?");   params.push(categoria); }
  if (cidade)    { conditions.push("p.city=?");            params.push(cidade); }
  if (quartos)   { conditions.push("p.bedrooms>=?");       params.push(Number(quartos)); }
  if (precoMin)  { conditions.push("p.price>=?");          params.push(Number(precoMin)); }
  if (precoMax)  { conditions.push("p.price<=?");          params.push(Number(precoMax)); }
  if (areaMin)   { conditions.push("p.area>=?");           params.push(Number(areaMin)); }
  if (areaMax)   { conditions.push("p.area<=?");           params.push(Number(areaMax)); }

  const orderMap: Record<string, string> = {
    recentes: "p.created_at DESC",
    "menor-preco": "p.price ASC",
    "maior-preco": "p.price DESC",
    "maior-area": "p.area DESC",
  };
  const order = orderMap[ordenar] ?? "p.created_at DESC";

  const rows = await query<Record<string, unknown>>(
    `SELECT p.*, COALESCE(ad.company_name, ad.name) AS advertiser,
      (SELECT image_path FROM property_images WHERE property_id=p.id AND is_cover=1 LIMIT 1) AS cover_image
     FROM properties p
     LEFT JOIN advertisers ad ON ad.id = p.advertiser_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY ${order}`,
    params
  );

  const properties = rows.map((row) => mapDBToProperty(row));

  const located = rows.filter((r) => r.latitude != null && r.longitude != null);
  const mapListings: MapListing[] = located.map((r) => ({
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

  // Links do seletor Lista | Mapa mantendo os filtros atuais
  function viewHref(view: "lista" | "mapa") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(raw)) {
      if (key !== "vista" && typeof value === "string" && value) params.set(key, value);
    }
    if (view === "mapa") params.set("vista", "mapa");
    const qs = params.toString();
    return qs ? `/imoveis?${qs}` : "/imoveis";
  }

  const viewToggle = (
    <div className="flex rounded-full bg-white p-1 ring-1 ring-neutral-200" role="tablist" aria-label="Visualização dos imóveis">
      {([
        { value: "lista", label: "Lista", icon: LayoutGrid, active: !isMap },
        { value: "mapa", label: "Mapa", icon: MapIcon, active: isMap },
      ] as const).map((opt) => (
        <Link
          key={opt.value}
          href={viewHref(opt.value)}
          role="tab"
          aria-selected={opt.active}
          scroll={false}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
            opt.active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
          )}
        >
          <opt.icon size={16} />
          {opt.label}
        </Link>
      ))}
    </div>
  );

  const transactionLabel =
    tipo === "aluguel" ? "Aluguel" : tipo === "venda" ? "Compra" : "Todos";

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 lg:pt-24">
      <div className="bg-white border-b border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
            {tipo ? `Imóveis para ${transactionLabel}` : "Todos os imóveis"}
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Anúncios de imobiliárias, corretores e proprietários da região
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-10">
          <Suspense>
            <PropertyFilters count={properties.length} />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="hidden lg:block text-sm text-neutral-500">
                <span className="font-semibold text-neutral-900">{properties.length}</span>{" "}
                {properties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
              </p>
              {viewToggle}
            </div>

            {isMap && properties.length > 0 ? (
              <ListingsMapClient
                key={JSON.stringify(raw)}
                listings={mapListings}
                withoutLocation={properties.length - mapListings.length}
                hideFilters
              />
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🏠</p>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Nenhum imóvel encontrado
                </h2>
                <p className="text-neutral-500">
                  Tente ajustar os filtros para encontrar mais opções.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
