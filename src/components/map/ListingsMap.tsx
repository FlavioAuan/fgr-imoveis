"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { BedDouble, Maximize, Maximize2, Minus, Plus, Search, X } from "lucide-react";
import { propertyTypeLabels, type PropertyType } from "@/types/property";
import { formatCurrency, cn } from "@/lib/utils";
import { CITY_CENTER, MapListing, streetViewUrl, TILE_ATTRIBUTION, TILE_URL, TYPE_COLORS } from "./mapConfig";

const priceRanges = [
  { value: "", label: "Qualquer valor" },
  { value: "0-300000", label: "Até R$ 300 mil" },
  { value: "300000-500000", label: "R$ 300 a 500 mil" },
  { value: "500000-1000000", label: "R$ 500 mil a 1 mi" },
  { value: "1000000-999999999", label: "Acima de R$ 1 mi" },
];

const selectCls =
  "rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 focus:outline-none focus:border-neutral-900";

interface Props {
  listings: MapListing[];
  /** Imóveis publicados sem ponto no mapa (só para o resumo) */
  withoutLocation?: number;
}

export function ListingsMap({ listings, withoutLocation = 0 }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  const [types, setTypes] = useState<PropertyType[]>([]);
  const [transaction, setTransaction] = useState<"" | "venda" | "aluguel">("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const typeCounts = useMemo(() => {
    const counts = new Map<PropertyType, number>();
    for (const l of listings) counts.set(l.type, (counts.get(l.type) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [listings]);

  const filtered = useMemo(() => {
    const [min, max] = priceRange ? priceRange.split("-").map(Number) : [0, Infinity];
    const q = search.trim().toLowerCase();
    return listings.filter(l =>
      (types.length === 0 || types.includes(l.type)) &&
      (!transaction || l.transaction === transaction) &&
      l.price >= min && l.price <= max &&
      l.bedrooms >= bedrooms &&
      (!q || l.neighborhood.toLowerCase().includes(q) || l.title.toLowerCase().includes(q))
    );
  }, [listings, types, transaction, priceRange, bedrooms, search]);

  const selected = filtered.find(l => l.id === selectedId) ?? null;

  // Cria o mapa uma vez (Leaflet só roda no navegador)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false, attributionControl: true })
        .setView(CITY_CENTER, 13);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      map.attributionControl.setPrefix(false);
      // A roda do mouse só dá zoom depois de clicar no mapa, para não prender a rolagem da página
      map.on("click", () => map.scrollWheelZoom.enable());
      map.on("mouseout", () => map.scrollWheelZoom.disable());
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  function fitAll(items = filtered) {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (items.length === 0) map.setView(CITY_CENTER, 13);
    else if (items.length === 1) map.setView([items[0].lat, items[0].lng], 16);
    else map.fitBounds(L.latLngBounds(items.map(l => [l.lat, l.lng] as [number, number])), { padding: [48, 48], maxZoom: 16 });
  }

  // Redesenha os pinos quando os filtros ou a seleção mudam
  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    for (const l of filtered) {
      const isSel = l.id === selectedId;
      L.circleMarker([l.lat, l.lng], {
        radius: isSel ? 11 : 8,
        color: isSel ? "#171717" : "#ffffff",
        weight: isSel ? 3 : 2,
        fillColor: TYPE_COLORS[l.type] ?? "#525252",
        fillOpacity: 1,
      })
        .bindTooltip(`${propertyTypeLabels[l.type]} · ${formatCurrency(l.price)}`, { direction: "top", offset: [0, -6] })
        .on("click", () => setSelectedId(l.id))
        .addTo(layer);
    }
  }, [ready, filtered, selectedId]);

  // Enquadra os pontos ao abrir e a cada mudança de filtro
  useEffect(() => {
    if (ready) fitAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, types, transaction, priceRange, bedrooms, search]);

  function toggleType(t: PropertyType) {
    setTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  }

  function clearFilters() {
    setTypes([]); setTransaction(""); setPriceRange(""); setBedrooms(0); setSearch("");
  }

  const hasFilters = types.length > 0 || transaction || priceRange || bedrooms > 0 || search;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-3xl bg-white p-4 sm:p-5 ring-1 ring-neutral-200/70 space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de imóvel">
          {typeCounts.map(([t, n]) => {
            const on = types.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleType(t)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-900"
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: TYPE_COLORS[t] }} />
                {propertyTypeLabels[t]}
                <span className={cn("text-xs", on ? "text-white/70" : "text-neutral-400")}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full bg-neutral-100 p-1">
            {([["", "Todos"], ["venda", "Comprar"], ["aluguel", "Alugar"]] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setTransaction(v)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  transaction === v ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className={selectCls} aria-label="Valor">
            {priceRanges.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={bedrooms} onChange={e => setBedrooms(Number(e.target.value))} className={selectCls} aria-label="Quartos">
            <option value={0}>Quartos</option>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+ quartos</option>)}
          </select>
          <label className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Bairro ou palavra"
              className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </label>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-neutral-900 underline underline-offset-2 px-2">
              Limpar
            </button>
          )}
        </div>
        <p className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-900">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "imóvel no mapa" : "imóveis no mapa"}
          {withoutLocation > 0 && ` · ${withoutLocation} sem localização aparecem só na lista`}
        </p>
      </div>

      {/* Mapa */}
      <div className="relative isolate overflow-hidden rounded-[28px] ring-1 ring-neutral-200/70 bg-neutral-100">
        <div ref={mapEl} className="h-[min(640px,70vh)] min-h-[420px] w-full [&_.leaflet-tile-pane]:saturate-[.75]" />

        <div className="absolute right-4 top-4 z-[500] flex flex-col gap-2">
          {[
            { label: "Aproximar", icon: Plus, onClick: () => mapRef.current?.zoomIn() },
            { label: "Afastar", icon: Minus, onClick: () => mapRef.current?.zoomOut() },
            { label: "Enquadrar todos", icon: Maximize, onClick: () => fitAll() },
          ].map(btn => (
            <button
              key={btn.label}
              type="button"
              aria-label={btn.label}
              title={btn.label}
              onClick={btn.onClick}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md ring-1 ring-neutral-200 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <btn.icon size={17} />
            </button>
          ))}
        </div>

        {selected && (
          <div className="absolute bottom-4 left-4 z-[500] w-[min(340px,calc(100%-2rem))] overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)]">
            {selected.cover && (
              <div className="aspect-[16/9] bg-neutral-100 bg-cover bg-center" style={{ backgroundImage: `url('${selected.cover}')` }} role="img" aria-label={selected.title} />
            )}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <X size={16} />
            </button>
            <div className="p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLORS[selected.type] }} />
                {propertyTypeLabels[selected.type]} · {selected.transaction === "aluguel" ? "Aluguel" : "Venda"}
              </p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                {formatCurrency(selected.price)}
                {selected.transaction === "aluguel" && <span className="text-base font-normal text-neutral-500">/mês</span>}
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-800 line-clamp-1">{selected.title}</p>
              <p className="text-sm text-neutral-500">{[selected.neighborhood, selected.city].filter(Boolean).join(", ")}</p>
              <div className="mt-2 flex gap-4 text-sm text-neutral-600">
                {selected.bedrooms > 0 && <span className="flex items-center gap-1.5"><BedDouble size={15} />{selected.bedrooms} quarto{selected.bedrooms > 1 ? "s" : ""}</span>}
                {selected.area > 0 && <span className="flex items-center gap-1.5"><Maximize2 size={14} />{selected.area} m²</span>}
              </div>
              {selected.advertiser && <p className="mt-2 text-xs text-neutral-400">Anunciado por {selected.advertiser}</p>}
              <div className="mt-4 flex gap-2">
                <Link href={`/imoveis/${selected.slug}`} className="btn btn-dark flex-1 px-4 py-2.5">Ver imóvel</Link>
                <a href={streetViewUrl(selected.lat, selected.lng)} target="_blank" rel="noopener noreferrer" className="btn btn-outline px-4 py-2.5">
                  Street View
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
        {typeCounts.map(([t]) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COLORS[t] }} />
            {propertyTypeLabels[t]}
          </span>
        ))}
        <span>Clique em um ponto para ver o imóvel. Clique no mapa para usar a roda do mouse no zoom.</span>
      </div>
    </div>
  );
}
