import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import { getAllProperties } from "@/data/properties";
import { Property } from "@/types/property";

export const metadata: Metadata = {
  title: "Imóveis",
  description:
    "Encontre casas, apartamentos, terrenos e imóveis comerciais para compra ou aluguel. Imóveis selecionados pela FGR Imóveis.",
};

interface SearchParams {
  tipo?: string;
  categoria?: string;
  cidade?: string;
  quartos?: string;
  precoMin?: string;
  precoMax?: string;
  areaMin?: string;
  areaMax?: string;
  ordenar?: string;
}

function filterProperties(
  properties: Property[],
  params: SearchParams
): Property[] {
  let result = [...properties];

  if (params.tipo) {
    result = result.filter((p) => p.transaction === params.tipo);
  }

  if (params.categoria) {
    result = result.filter((p) => p.type === params.categoria);
  }

  if (params.cidade) {
    result = result.filter(
      (p) =>
        p.location.city.toLowerCase() === params.cidade!.toLowerCase()
    );
  }

  if (params.quartos) {
    const min = parseInt(params.quartos);
    result = result.filter((p) => p.bedrooms >= min);
  }

  if (params.precoMin) {
    const min = parseInt(params.precoMin);
    result = result.filter((p) => p.price >= min);
  }

  if (params.precoMax) {
    const max = parseInt(params.precoMax);
    result = result.filter((p) => p.price <= max);
  }

  if (params.areaMin) {
    const min = parseInt(params.areaMin);
    result = result.filter((p) => p.area >= min);
  }

  if (params.areaMax) {
    const max = parseInt(params.areaMax);
    result = result.filter((p) => p.area <= max);
  }

  // Sorting
  const sort = params.ordenar ?? "recentes";
  result.sort((a, b) => {
    if (sort === "menor-preco") return a.price - b.price;
    if (sort === "maior-preco") return b.price - a.price;
    if (sort === "maior-area") return b.area - a.area;
    // recentes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
}

export default async function ImoveisPage({
  searchParams,
}: PageProps<"/imoveis">) {
  const rawParams = await searchParams;
  const params: SearchParams = {
    tipo: typeof rawParams.tipo === "string" ? rawParams.tipo : undefined,
    categoria: typeof rawParams.categoria === "string" ? rawParams.categoria : undefined,
    cidade: typeof rawParams.cidade === "string" ? rawParams.cidade : undefined,
    quartos: typeof rawParams.quartos === "string" ? rawParams.quartos : undefined,
    precoMin: typeof rawParams.precoMin === "string" ? rawParams.precoMin : undefined,
    precoMax: typeof rawParams.precoMax === "string" ? rawParams.precoMax : undefined,
    areaMin: typeof rawParams.areaMin === "string" ? rawParams.areaMin : undefined,
    areaMax: typeof rawParams.areaMax === "string" ? rawParams.areaMax : undefined,
    ordenar: typeof rawParams.ordenar === "string" ? rawParams.ordenar : undefined,
  };
  const all = getAllProperties();
  const filtered = filterProperties(all, params);

  const transactionLabel =
    params.tipo === "aluguel"
      ? "Aluguel"
      : params.tipo === "venda"
      ? "Compra"
      : "Todos";

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 lg:pt-24">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
            {params.tipo
              ? `Imóveis para ${transactionLabel}`
              : "Todos os imóveis"}
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Explore nossa seleção de imóveis cuidadosamente escolhidos
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-10">
          {/* Filters sidebar */}
          <Suspense>
            <PropertyFilters count={filtered.length} />
          </Suspense>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Desktop count + sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-neutral-500">
                <span className="font-semibold text-neutral-900">
                  {filtered.length}
                </span>{" "}
                {filtered.length === 1
                  ? "imóvel encontrado"
                  : "imóveis encontrados"}
              </p>
            </div>

            {filtered.length === 0 ? (
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
                {filtered.map((property) => (
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
