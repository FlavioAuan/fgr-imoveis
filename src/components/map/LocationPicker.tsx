"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import { Loader2, LocateFixed, Trash2 } from "lucide-react";
import { CITY_CENTER, TILE_ATTRIBUTION, TILE_URL } from "./mapConfig";

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  /** Endereço, bairro e cidade do formulário, para localizar automaticamente */
  addressQuery: string;
}

/** Mapa para marcar onde fica o imóvel: clique no mapa ou localize pelo endereço. */
export default function LocationPicker({ lat, lng, onChange, addressQuery }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [ready, setReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(el.current, { scrollWheelZoom: false }).setView(
        lat != null && lng != null ? [lat, lng] : CITY_CENTER,
        lat != null ? 16 : 13
      );
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      map.attributionControl.setPrefix(false);
      map.on("click", e => {
        map.scrollWheelZoom.enable();
        onChangeRef.current(Number(e.latlng.lat.toFixed(7)), Number(e.latlng.lng.toFixed(7)));
      });
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostra o ponto escolhido
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;
    markerRef.current?.remove();
    markerRef.current = null;
    if (lat != null && lng != null) {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 10, color: "#ffffff", weight: 3, fillColor: "#171717", fillOpacity: 1,
      }).addTo(map);
    }
  }, [ready, lat, lng]);

  async function locateByAddress() {
    if (!addressQuery.trim()) {
      setMessage("Preencha endereço, bairro e cidade primeiro.");
      return;
    }
    setSearching(true);
    setMessage("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(addressQuery)}`;
      const results: { lat: string; lon: string }[] = await fetch(url).then(r => r.json());
      if (!results.length) {
        setMessage("Endereço não encontrado. Clique no mapa para marcar o local.");
        return;
      }
      const nextLat = Number(Number(results[0].lat).toFixed(7));
      const nextLng = Number(Number(results[0].lon).toFixed(7));
      onChange(nextLat, nextLng);
      mapRef.current?.setView([nextLat, nextLng], 17);
      setMessage("Confira o ponto no mapa e clique em outro lugar se precisar ajustar.");
    } catch {
      setMessage("Não foi possível buscar o endereço agora. Clique no mapa para marcar o local.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={locateByAddress}
          disabled={searching}
          className="inline-flex items-center gap-2 border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-900 disabled:opacity-50"
        >
          {searching ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
          Localizar pelo endereço
        </button>
        {lat != null && lng != null && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:text-red-600"
          >
            <Trash2 size={15} />
            Remover ponto
          </button>
        )}
        <span className="text-xs text-neutral-500">
          {lat != null && lng != null ? `Ponto marcado: ${lat}, ${lng}` : "Clique no mapa para marcar onde fica o imóvel."}
        </span>
      </div>
      {message && <p className="text-xs text-neutral-600">{message}</p>}
      <div className="relative isolate">
        <div ref={el} className="h-72 w-full border border-neutral-300" />
      </div>
      <p className="text-xs text-neutral-400">
        Sem ponto marcado, o imóvel aparece na lista, mas não no mapa. Se preferir não mostrar o número, marque um ponto na mesma rua.
      </p>
    </div>
  );
}
