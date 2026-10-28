"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatBRL, formatDate, statusBadge } from "@/components/marketplace/AdvertiserContext";

interface Advertiser {
  id: number;
  name: string;
  company_name: string | null;
  kind: "imobiliaria" | "corretor" | "proprietario";
  document: string | null;
  creci: string | null;
  phone: string | null;
  email: string;
  active: number;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: number;
  created_at: string;
  plan_name: string | null;
  listings: number;
  leads: number;
}

interface Summary { live: number; pastDue: number; mrr: number; revenueMonth: number }

const KIND: Record<string, string> = { imobiliaria: "Imobiliária", corretor: "Corretor", proprietario: "Proprietário" };

export default function AnunciantesPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/advertisers")
      .then(r => r.json())
      .then(d => {
        setAdvertisers(Array.isArray(d.advertisers) ? d.advertisers : []);
        setSummary(d.summary ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return advertisers;
    return advertisers.filter(a =>
      [a.name, a.company_name, a.email, a.phone, a.creci].some(v => v?.toLowerCase().includes(q))
    );
  }, [advertisers, search]);

  async function toggleActive(a: Advertiser) {
    const next = !Number(a.active);
    if (!next && !window.confirm(`Bloquear ${a.company_name || a.name}? Os anúncios saem do site e o acesso ao painel é bloqueado. A cobrança no Stripe não é cancelada.`)) return;
    await fetch(`/api/advertisers/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    load();
  }

  const cards = summary ? [
    { label: "Assinantes ativos", value: String(summary.live) },
    { label: "Receita recorrente (mês)", value: formatBRL(summary.mrr) },
    { label: "Recebido este mês", value: formatBRL(summary.revenueMonth) },
    { label: "Pagamento pendente", value: String(summary.pastDue) },
  ] : [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Anunciantes</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Imobiliárias, corretores e proprietários que anunciam no portal</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500">{c.label}</p>
              <p className="text-xl font-bold text-neutral-900 mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail, CRECI..."
          className="w-full border border-neutral-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 bg-white" />
      </div>

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Anunciante</th>
              <th className="px-4 py-3 font-medium">Plano</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Renova em</th>
              <th className="px-4 py-3 font-medium text-right">Anúncios</th>
              <th className="px-4 py-3 font-medium text-right">Leads</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-400">Nenhum anunciante {search ? "encontrado" : "cadastrado ainda"}.</td></tr>
            ) : filtered.map(a => {
              const badge = statusBadge(a.subscription_status);
              return (
                <tr key={a.id} className={Number(a.active) ? "" : "opacity-60"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{a.company_name || a.name}</p>
                    <p className="text-xs text-neutral-500">
                      {KIND[a.kind]}{a.creci && ` · CRECI ${a.creci}`} · {a.email}{a.phone && ` · ${a.phone}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">{a.plan_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                    {Number(a.cancel_at_period_end) === 1 && <p className="text-xs text-neutral-400 mt-0.5">cancelamento agendado</p>}
                  </td>
                  <td className="px-4 py-3">{formatDate(a.current_period_end)}</td>
                  <td className="px-4 py-3 text-right">{a.listings}</td>
                  <td className="px-4 py-3 text-right">{a.leads}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(a)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${Number(a.active)
                        ? "border-neutral-300 text-neutral-600 hover:border-red-400 hover:text-red-600"
                        : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"}`}>
                      {Number(a.active) ? "Bloquear" : "Desbloquear"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
