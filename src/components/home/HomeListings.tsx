"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Map as MapIcon } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import type { Property } from "@/types/property";
import type { MapListing } from "@/components/map/mapConfig";
import { cn } from "@/lib/utils";

import { ListingsMapClient as ListingsMap } from "@/components/map/ListingsMapClient";

type View = "lista" | "mapa";
const STORAGE_KEY = "fgr_home_view";

interface Props {
  featured: Property[];
  mapListings: MapListing[];
  withoutLocation: number;
}

export function HomeListings({ featured, mapListings, withoutLocation }: Props) {
  const [view, setView] = useState<View>("lista");

  // Lembra a última visualização escolhida neste navegador
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "mapa") setView("mapa");
    } catch {}
  }, []);

  // "#mapa" no endereço abre o mapa e rola até esta seção
  useEffect(() => {
    function openMapFromHash() {
      if (window.location.hash !== "#mapa") return;
      setView("mapa");
      requestAnimationFrame(() => document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" }));
    }
    openMapFromHash();
    window.addEventListener("hashchange", openMapFromHash);
    return () => window.removeEventListener("hashchange", openMapFromHash);
  }, []);

  function choose(next: View) {
    setView(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }

  return (
    <section id="imoveis" className="py-20 lg:py-24 bg-neutral-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="eyebrow bg-white mb-4">{view === "mapa" ? "Todos os anúncios" : "Destaques do portal"}</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900">
              {view === "mapa" ? "Imóveis no mapa" : "Imóveis em destaque"}
            </h2>
            <p className="text-neutral-500 mt-3 max-w-md">
              {view === "mapa"
                ? "Veja onde fica cada imóvel anunciado, com as ruas e os bairros da cidade."
                : "Anúncios em destaque de imobiliárias, corretores e proprietários da região."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full bg-white p-1 ring-1 ring-neutral-200" role="tablist" aria-label="Visualização dos imóveis">
              {([
                { value: "lista", label: "Lista", icon: LayoutGrid },
                { value: "mapa", label: "Mapa", icon: MapIcon },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={view === opt.value}
                  onClick={() => choose(opt.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    view === opt.value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
            <Link href="/imoveis" className="btn btn-outline hidden sm:inline-flex whitespace-nowrap">
              Ver todos os imóveis
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {view === "mapa" ? (
          <ListingsMap listings={mapListings} withoutLocation={withoutLocation} />
        ) : featured.length === 0 ? (
          <p className="text-neutral-400 text-sm">Em breve, novos imóveis em destaque por aqui.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link href="/imoveis" className="btn btn-dark">
            Ver todos os imóveis
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
