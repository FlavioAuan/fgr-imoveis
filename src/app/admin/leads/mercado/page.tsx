"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarClock, ExternalLink, LayoutGrid, Map as MapIcon, Pencil, Search, X } from "lucide-react";
import { LeadsTabs } from "@/components/admin/LeadsTabs";
import { AgencyForm, MarketListingPanel } from "@/components/admin/market/MarketListingPanel";
import {
  MARKET_CATEGORIES, MARKET_STATUSES, PRICE_BANDS, categoryColor, statusInfo,
  type MarketAgency, type MarketListing, type MarketStatus,
} from "@/lib/market";
import { formatCurrency, cn } from "@/lib/utils";

// O mapa usa o Leaflet, que só funciona no navegador
const MarketMap = dynamic(() => import("@/components/admin/market/MarketMap").then(m => m.MarketMap), {
  ssr: false,
  loading: () => <div className="h-[min(620px,68vh)] min-h-[400px] bg-neutral-100 animate-pulse" />,
});

type SortKey = "price" | "area" | "m2" | "lastContact";
type StatusFilter = "" | MarketStatus | "retorno";
const VIEW_KEY = "fgr_admin_mercado_view";
const PAGE_SIZE = 100;

const inputCls =
  "border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";
const labelCls = "text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const readMoney = (s: string) => { const n = parseInt(s.replace(/\D/g, ""), 10); return Number.isNaN(n) ? null : n; };
const shortMoney = (v: number) =>
  v >= 1e6 ? `R$ ${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi` : `R$ ${Math.round(v / 1000).toLocaleString("pt-BR")} mil`;
const pricePerM2 = (l: MarketListing) => (l.area && l.area > 15 ? l.price / l.area : null);
const today = () => new Date().toLocaleDateString("en-CA");
const isFollowupDue = (l: MarketListing) =>
  !!l.nextFollowup && l.nextFollowup <= today() && l.status !== "captado" && l.status !== "descartado";

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default function MarketLeadsPage() {
  const [agencies, setAgencies] = useState<MarketAgency[]>([]);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  const [cats, setCats] = useState<string[]>([]);
  const [pmin, setPmin] = useState<number | null>(null);
  const [pmax, setPmax] = useState<number | null>(null);
  const [agencyId, setAgencyId] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");

  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [colorBy, setColorBy] = useState<"tipo" | "status">("tipo");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "price", dir: 1 });
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [mapSelected, setMapSelected] = useState<number | null>(null);
  const [panelId, setPanelId] = useState<number | null>(null);
  const [editingAgency, setEditingAgency] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/mercado")
      .then(async r => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Erro ao carregar");
        setAgencies(json.agencies);
        setListings(json.listings);
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(me => setCanDelete(me?.role === "super_admin" || me?.role === "admin"))
      .catch(() => {});
    try { if (localStorage.getItem(VIEW_KEY) === "mapa") setView("mapa"); } catch {}
  }, []);

  function chooseView(v: "lista" | "mapa") {
    setView(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  }

  const agencyById = useMemo(() => new Map(agencies.map(a => [a.id, a])), [agencies]);
  const searchIndex = useMemo(
    () => new Map(listings.map(l => [l.id, normalize([l.neighborhood, l.title, l.rawType, agencyById.get(l.agencyId)?.name, l.ownerName].join(" "))])),
    [listings, agencyById]
  );

  // Filtros sem o tipo e sem o status: base das contagens dos botões
  const baseFiltered = useMemo(() => {
    const q = normalize(search.trim());
    return listings.filter(l =>
      (pmin == null || l.price >= pmin) && (pmax == null || l.price <= pmax) &&
      (!agencyId || l.agencyId === agencyId) && (!bedrooms || (l.bedrooms ?? 0) >= bedrooms) &&
      (!q || searchIndex.get(l.id)!.includes(q))
    );
  }, [listings, pmin, pmax, agencyId, bedrooms, search, searchIndex]);

  const matchesStatus = (l: MarketListing) =>
    !statusFilter || (statusFilter === "retorno" ? isFollowupDue(l) : l.status === statusFilter);

  const filtered = useMemo(
    () => baseFiltered.filter(l => (!cats.length || cats.includes(l.category)) && matchesStatus(l)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseFiltered, cats, statusFilter]
  );

  const sorted = useMemo(() => {
    const value = (l: MarketListing) =>
      sort.key === "price" ? l.price : sort.key === "area" ? l.area : sort.key === "m2" ? pricePerM2(l) : l.lastContact ? Date.parse(l.lastContact) : null;
    return [...filtered].sort((a, b) => {
      const va = value(a), vb = value(b);
      if (va == null && vb == null) return a.price - b.price;
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va - vb) * sort.dir || a.price - b.price;
    });
  }, [filtered, sort]);

  const stats = useMemo(() => {
    const prices = filtered.map(l => l.price);
    const m2 = filtered.filter(l => ["Casa", "Apartamento", "Casa em condomínio"].includes(l.category)).map(pricePerM2).filter((v): v is number => v != null);
    return {
      median: median(prices),
      min: prices.length ? Math.min(...prices) : null,
      max: prices.length ? Math.max(...prices) : null,
      m2: m2.length > 5 ? median(m2) : null,
      onMap: filtered.filter(l => l.lat != null).length,
    };
  }, [filtered]);

  const fitKey = JSON.stringify([cats, pmin, pmax, agencyId, bedrooms, search, statusFilter]);
  useEffect(() => { setLimit(PAGE_SIZE); setMapSelected(null); }, [fitKey]);

  const hasFilters = cats.length > 0 || pmin != null || pmax != null || agencyId > 0 || bedrooms > 0 || search !== "" || statusFilter !== "";
  function clearFilters() {
    setCats([]); setPmin(null); setPmax(null); setAgencyId(0); setBedrooms(0); setSearch(""); setStatusFilter("");
  }

  function updateListing(updated: MarketListing) {
    setListings(prev => prev.map(l => (l.id === updated.id ? updated : l)));
  }
  function updateAgency(updated: MarketAgency) {
    setAgencies(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  }

  function toggleSort(key: SortKey) {
    setSort(prev => ({ key, dir: prev.key === key ? (prev.dir === 1 ? -1 : 1) : key === "lastContact" ? -1 : 1 }));
  }

  const panelListing = panelId != null ? listings.find(l => l.id === panelId) ?? null : null;
  const mapListing = mapSelected != null ? filtered.find(l => l.id === mapSelected) ?? null : null;
  const statusCounts = (s: StatusFilter) =>
    baseFiltered.filter(l => (!cats.length || cats.includes(l.category)) && (s === "" || (s === "retorno" ? isFollowupDue(l) : l.status === s))).length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <LeadsTabs />
        <div className="h-40 bg-white border border-neutral-200 animate-pulse" />
        <div className="h-96 bg-white border border-neutral-200 animate-pulse" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 max-w-7xl">
        <LeadsTabs />
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {loadError}. Verifique se a migração <code>2026-10-29-imoveis-mercado.sql</code> foi executada no banco.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <LeadsTabs />

      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">Imóveis do mercado</h1>
            <span className="bg-neutral-200 text-neutral-700 text-xs font-bold px-2.5 py-1">{listings.length.toLocaleString("pt-BR")}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
            Anúncios à venda de {agencies.length} imobiliárias de São João da Boa Vista, coletados em 27 e 28/10/2026.
            Entre em contato com a imobiliária ou o proprietário e registre cada conversa no imóvel.
          </p>
        </div>
        <div className="flex rounded-none bg-white p-1 border border-neutral-200 self-start lg:self-auto" role="tablist" aria-label="Visualização">
          {([
            { value: "lista", label: "Lista", icon: LayoutGrid },
            { value: "mapa", label: "Mapa", icon: MapIcon },
          ] as const).map(opt => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={view === opt.value}
              onClick={() => chooseView(opt.value)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors",
                view === opt.value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <opt.icon size={16} /> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funil de contatos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {([
          { value: "", label: "Todos", color: "#171717" },
          ...MARKET_STATUSES.map(s => ({ value: s.value, label: s.label, color: s.color })),
          { value: "retorno", label: "Retorno pendente", color: "#dc2626" },
        ] as { value: StatusFilter; label: string; color: string }[]).map(s => (
          <button
            key={s.value || "todos"}
            type="button"
            aria-pressed={statusFilter === s.value}
            onClick={() => setStatusFilter(statusFilter === s.value && s.value !== "" ? "" : s.value)}
            className={cn(
              "text-left border bg-white px-3 py-2.5 transition-colors",
              statusFilter === s.value ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              {s.value === "retorno" ? <CalendarClock size={12} style={{ color: s.color }} /> : <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />}
              {s.label}
            </span>
            <span className="block text-xl font-bold text-neutral-900 tabular-nums">{statusCounts(s.value).toLocaleString("pt-BR")}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white border border-neutral-200 p-4 space-y-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tipo de imóvel">
          {MARKET_CATEGORIES.filter(c => listings.some(l => l.category === c.value)).map(c => {
            const on = cats.includes(c.value);
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                onClick={() => setCats(prev => (on ? prev.filter(x => x !== c.value) : [...prev, c.value]))}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors",
                  on ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: c.color }} />
                {c.value}
                <span className={cn("text-xs tabular-nums", on ? "text-white/70" : "text-neutral-400")}>
                  {baseFiltered.filter(l => l.category === c.value && matchesStatus(l)).length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className={labelCls} htmlFor="mk-pmin">Valor mínimo</label>
            <input id="mk-pmin" inputMode="numeric" placeholder="R$ 0" value={pmin != null ? pmin.toLocaleString("pt-BR") : ""} onChange={e => setPmin(readMoney(e.target.value))} className={cn(inputCls, "w-36 tabular-nums")} />
          </div>
          <div>
            <label className={labelCls} htmlFor="mk-pmax">Valor máximo</label>
            <input id="mk-pmax" inputMode="numeric" placeholder="sem limite" value={pmax != null ? pmax.toLocaleString("pt-BR") : ""} onChange={e => setPmax(readMoney(e.target.value))} className={cn(inputCls, "w-36 tabular-nums")} />
          </div>
          <div>
            <label className={labelCls} htmlFor="mk-agency">Imobiliária</label>
            <select id="mk-agency" value={agencyId} onChange={e => setAgencyId(Number(e.target.value))} className={inputCls}>
              <option value={0}>Todas</option>
              {agencies.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({listings.filter(l => l.agencyId === a.id).length})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="mk-bed">Quartos</label>
            <select id="mk-bed" value={bedrooms} onChange={e => setBedrooms(Number(e.target.value))} className={inputCls}>
              <option value={0}>Qualquer</option>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className={labelCls} htmlFor="mk-search">Bairro ou palavra</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input id="mk-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="ex.: Jardim Aurora" className={cn(inputCls, "w-full pl-9")} />
            </div>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-neutral-900 underline underline-offset-2 py-2">
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Faixas de valor">
          {PRICE_BANDS.map(b => {
            const on = pmin === b.min && pmax === b.max;
            return (
              <button
                key={b.label}
                type="button"
                aria-pressed={on}
                onClick={() => { if (on) { setPmin(null); setPmax(null); } else { setPmin(b.min); setPmax(b.max); } }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  on ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-500 tabular-nums border-t border-neutral-100 pt-3">
          <span><b className="text-neutral-900">{filtered.length.toLocaleString("pt-BR")}</b> imóveis</span>
          {stats.median != null && <span>mediana <b className="text-neutral-900">{formatCurrency(stats.median)}</b></span>}
          {stats.min != null && stats.max != null && <span>de <b className="text-neutral-900">{shortMoney(stats.min)}</b> a <b className="text-neutral-900">{shortMoney(stats.max)}</b></span>}
          {stats.m2 != null && <span>R$/m² mediano (casas e aptos) <b className="text-neutral-900">{formatCurrency(stats.m2)}</b></span>}
          <span>{stats.onMap.toLocaleString("pt-BR")} no mapa</span>
        </p>
      </div>

      {/* Mapa */}
      {view === "mapa" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              {(colorBy === "tipo"
                ? MARKET_CATEGORIES.filter(c => listings.some(l => l.category === c.value)).map(c => ({ label: c.value, color: c.color }))
                : MARKET_STATUSES.map(s => ({ label: s.label, color: s.color }))
              ).map(item => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              Cor por
              {(["tipo", "status"] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={colorBy === c}
                  onClick={() => setColorBy(c)}
                  className={cn("px-2.5 py-1 font-semibold", colorBy === c ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-600")}
                >
                  {c === "tipo" ? "Tipo" : "Status do contato"}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <MarketMap listings={filtered} colorBy={colorBy} selectedId={mapSelected} onSelect={setMapSelected} fitKey={fitKey} />
            {mapListing && (
              <div className="absolute bottom-3 left-3 z-[500] w-[min(340px,calc(100%-1.5rem))] bg-white border border-neutral-200 shadow-xl p-4">
                <button type="button" onClick={() => setMapSelected(null)} aria-label="Fechar" className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-neutral-900">
                  <X size={16} />
                </button>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 pr-6">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColor(mapListing.category) }} />
                  {mapListing.category} · {agencyById.get(mapListing.agencyId)?.name}
                </p>
                <p className="mt-1 text-xl font-bold text-neutral-900">{formatCurrency(mapListing.price)}</p>
                <p className="text-sm text-neutral-700">
                  {mapListing.neighborhood || "Bairro não informado"}
                  {mapListing.area ? ` · ${mapListing.area.toLocaleString("pt-BR")} m²` : ""}
                  {mapListing.bedrooms ? ` · ${mapListing.bedrooms} quarto${mapListing.bedrooms > 1 ? "s" : ""}` : ""}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  <StatusBadge status={mapListing.status} />
                  {mapListing.contacts > 0 && <span className="ml-2">{mapListing.contacts} contato{mapListing.contacts > 1 ? "s" : ""}</span>}
                </p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setPanelId(mapListing.id)} className="flex-1 bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors">
                    Controlar contato
                  </button>
                  <a href={mapListing.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Anúncio <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            Ponto cheio: localização publicada pela imobiliária. Ponto claro: localizado pelo bairro (aproximado).
            Clique no mapa para usar a roda do mouse no zoom.
            {filtered.length - stats.onMap > 0 && ` ${filtered.length - stats.onMap} imóveis sem localização aparecem só na lista.`}
          </p>
        </section>
      )}

      {/* Lista */}
      {view === "lista" && (
        <section className="space-y-3">
          <div className="bg-white border border-neutral-200 overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Imóvel</th>
                  <SortHeader label="Valor" k="price" sort={sort} onSort={toggleSort} />
                  <SortHeader label="Área" k="area" sort={sort} onSort={toggleSort} />
                  <SortHeader label="R$/m²" k="m2" sort={sort} onSort={toggleSort} />
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Quartos</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Imobiliária</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <SortHeader label="Último contato" k="lastContact" sort={sort} onSort={toggleSort} />
                  <th className="text-right px-4 py-3 font-semibold text-neutral-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-neutral-400">
                      Nenhum imóvel com esses filtros. Aumente a faixa de valor ou limpe os filtros.
                    </td>
                  </tr>
                ) : sorted.slice(0, limit).map(l => {
                  const m2 = pricePerM2(l);
                  return (
                    <tr key={l.id} className="hover:bg-neutral-50 transition-colors cursor-pointer align-top" onClick={() => setPanelId(l.id)}>
                      <td className="px-4 py-3 max-w-[300px]">
                        <p className="flex items-center gap-2 font-semibold text-neutral-900">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: categoryColor(l.category) }} />
                          {l.category}
                        </p>
                        <p className="text-neutral-600">{l.neighborhood || "Bairro não informado"}</p>
                        {l.ownerName && <p className="text-xs text-neutral-500">Proprietário: {l.ownerName}</p>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-900 whitespace-nowrap tabular-nums">{formatCurrency(l.price)}</td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap tabular-nums">{l.area ? `${l.area.toLocaleString("pt-BR")} m²` : "—"}</td>
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap tabular-nums">{m2 ? formatCurrency(m2) : "—"}</td>
                      <td className="px-4 py-3 text-neutral-600 tabular-nums">{l.bedrooms || "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{agencyById.get(l.agencyId)?.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={l.status} />
                        {isFollowupDue(l) && (
                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <CalendarClock size={12} /> Retornar {formatDate(l.nextFollowup + "T12:00:00")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {l.lastContact ? <>{formatDate(l.lastContact)}<br />{l.contacts} contato{l.contacts > 1 ? "s" : ""}</> : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <span className="inline-flex items-center gap-1.5">
                          <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors">
                            Anúncio <ExternalLink size={12} />
                          </a>
                          <button type="button" onClick={() => setPanelId(l.id)} className="text-xs px-2.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
                            Contato
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length > limit && (
            <div className="text-center">
              <button type="button" onClick={() => setLimit(l => l + PAGE_SIZE)} className="px-5 py-2.5 text-sm font-medium border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors">
                Mostrar mais {Math.min(PAGE_SIZE, sorted.length - limit)} de {(sorted.length - limit).toLocaleString("pt-BR")}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Imobiliárias */}
      <section className="bg-white border border-neutral-200">
        <div className="px-4 py-3 border-b border-neutral-200">
          <h2 className="font-bold text-neutral-900">Imobiliárias pesquisadas</h2>
          <p className="text-xs text-neutral-500">Cadastre telefone, WhatsApp e e-mail para entrar em contato direto do imóvel.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Imobiliária</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Anúncios</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Contatados</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Captados</th>
                <th className="px-4 py-2.5 font-semibold text-neutral-600">Contato</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {agencies.map(a => {
                const own = listings.filter(l => l.agencyId === a.id);
                return editingAgency === a.id ? (
                  <tr key={a.id}>
                    <td colSpan={6} className="px-4 py-4">
                      <p className="font-semibold text-neutral-900 mb-2">{a.name}</p>
                      <div className="max-w-xl">
                        <AgencyForm agency={a} onCancel={() => setEditingAgency(null)} onSaved={u => { updateAgency(u); setEditingAgency(null); }} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={a.id}>
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => { setAgencyId(a.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="font-medium text-neutral-900 hover:underline text-left">
                        {a.name}
                      </button>
                      {a.website && (
                        <a href={a.website} target="_blank" rel="noopener noreferrer" className="block text-xs text-neutral-400 hover:text-neutral-700">
                          {a.website.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-neutral-700">{own.length.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2.5 tabular-nums text-neutral-700">{own.filter(l => l.status !== "novo").length}</td>
                    <td className="px-4 py-2.5 tabular-nums text-neutral-700">{own.filter(l => l.status === "captado").length}</td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">
                      {[a.contactName, a.whatsapp && `WhatsApp ${a.whatsapp}`, a.phone, a.email].filter(Boolean).join(" · ") || <span className="text-neutral-300">Não cadastrado</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" onClick={() => setEditingAgency(a.id)} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Pencil size={12} /> Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notas do levantamento */}
      <div className="grid gap-4 md:grid-cols-3 text-sm text-neutral-500">
        <div>
          <h3 className="font-semibold text-neutral-900 mb-1">Como os dados foram coletados</h3>
          <p>Lidos direto do site de cada imobiliária em 27 e 28/10/2026: só imóveis à venda, com preço publicado e em São João da Boa Vista.</p>
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 mb-1">Fique atento</h3>
          <p>O mesmo imóvel pode estar em mais de uma imobiliária, com preços diferentes. A área segue o que cada site informa. Confirme preço e disponibilidade no anúncio.</p>
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 mb-1">Street View</h3>
          <p>Quando o ponto é aproximado pelo bairro, o Street View mostra uma rua do bairro, não o imóvel. O endereço exato fica com a imobiliária.</p>
        </div>
      </div>

      {panelListing && (
        <MarketListingPanel
          key={panelListing.id}
          listing={panelListing}
          agency={agencyById.get(panelListing.agencyId)}
          canDelete={canDelete}
          onClose={() => setPanelId(null)}
          onListingChange={updateListing}
          onAgencyChange={updateAgency}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: MarketStatus }) {
  const s = statusInfo(status);
  return <span className={cn("inline-flex px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

function SortHeader({ label, k, sort, onSort }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void }) {
  const active = sort.key === k;
  return (
    <th className="text-left px-4 py-3 font-semibold text-neutral-600" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 hover:text-neutral-900", active && "text-neutral-900")}>
        {label} {active && (sort.dir === 1 ? "↑" : "↓")}
      </button>
    </th>
  );
}
