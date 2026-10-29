"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { Maximize, Minus, Plus } from "lucide-react";
import { CITY_CENTER, TILE_ATTRIBUTION, TILE_URL } from "@/components/map/mapConfig";
import { categoryColor, statusInfo, type MarketListing } from "@/lib/market";
import { formatCurrency } from "@/lib/utils";

interface Props {
  listings: MarketListing[];
  colorBy: "tipo" | "status";
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** Muda quando os filtros mudam, para reenquadrar os pontos */
  fitKey: string;
}

export function MarketMap({ listings, colorBy, selectedId, onSelect, fitKey }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  const located = listings.filter(l => l.lat != null && l.lng != null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      leafletRef.current = L;
      // Canvas: milhares de pontos sem travar a tela
      const map = L.map(mapEl.current, { zoomControl: false, scrollWheelZoom: false, preferCanvas: true }).setView(CITY_CENTER, 13);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      map.attributionControl.setPrefix(false);
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

  function fitAll() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    if (located.length === 0) map.setView(CITY_CENTER, 13);
    else if (located.length === 1) map.setView([located[0].lat!, located[0].lng!], 16);
    else map.fitBounds(L.latLngBounds(located.map(l => [l.lat!, l.lng!] as [number, number])), { padding: [40, 40], maxZoom: 16 });
  }

  useEffect(() => {
    const L = leafletRef.current;
    const layer = layerRef.current;
    if (!ready || !L || !layer) return;
    layer.clearLayers();
    // Pontos aproximados (pelo bairro) ficam por baixo e mais claros
    const ordered = [...located].sort((a, b) => Number(a.geo === "exata") - Number(b.geo === "exata"));
    let selected: MarketListing | null = null;
    for (const l of ordered) {
      if (l.id === selectedId) { selected = l; continue; }
      L.circleMarker([l.lat!, l.lng!], {
        radius: 6,
        color: "#ffffff",
        weight: 1.5,
        fillColor: colorBy === "status" ? statusInfo(l.status).color : categoryColor(l.category),
        fillOpacity: l.geo === "exata" ? 1 : 0.55,
      })
        .bindTooltip(`${l.category} · ${formatCurrency(l.price)}`, { direction: "top", offset: [0, -4] })
        .on("click", () => onSelect(l.id))
        .addTo(layer);
    }
    if (selected) {
      L.circleMarker([selected.lat!, selected.lng!], {
        radius: 10, color: "#171717", weight: 3, fillOpacity: 1,
        fillColor: colorBy === "status" ? statusInfo(selected.status).color : categoryColor(selected.category),
      }).addTo(layer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, listings, colorBy, selectedId]);

  useEffect(() => {
    if (ready) fitAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  return (
    <div className="relative isolate overflow-hidden border border-neutral-200 bg-neutral-100">
      <div ref={mapEl} className="h-[min(620px,68vh)] min-h-[400px] w-full [&_.leaflet-tile-pane]:saturate-[.75]" />
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1.5">
        {[
          { label: "Aproximar", icon: Plus, onClick: () => mapRef.current?.zoomIn() },
          { label: "Afastar", icon: Minus, onClick: () => mapRef.current?.zoomOut() },
          { label: "Enquadrar todos", icon: Maximize, onClick: fitAll },
        ].map(btn => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.label}
            title={btn.label}
            onClick={btn.onClick}
            className="flex h-9 w-9 items-center justify-center bg-white text-neutral-800 shadow ring-1 ring-neutral-200 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <btn.icon size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}
