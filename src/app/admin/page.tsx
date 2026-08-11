"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MessageSquare, TrendingUp, Star, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  total_properties: number;
  for_sale: number;
  for_rent: number;
  total_leads: number;
  leads_this_month: number;
  featured_properties: number;
}

interface DashboardData {
  stats: Stats;
  leadsByMonth: { month: string; total: number }[];
  propertiesByType: { type: string; total: number }[];
  recentLeads: Array<{ id: number; name: string; phone: string; property_title: string; status: string; created_at: string }>;
  recentProperties: Array<{ id: number; code: string; title: string; price: number; transaction_type: string; status: string; cover_image: string }>;
}

const statusColors: Record<string, string> = {
  novo: "bg-blue-100 text-blue-700",
  em_atendimento: "bg-yellow-100 text-yellow-700",
  convertido: "bg-green-100 text-green-700",
  arquivado: "bg-neutral-100 text-neutral-500",
};

const statusLabels: Record<string, string> = {
  novo: "Novo", em_atendimento: "Em atendimento", convertido: "Convertido", arquivado: "Arquivado",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const s = data?.stats;

  const cards = [
    { label: "Total de imóveis", value: s?.total_properties ?? 0, icon: Building2, href: "/admin/imoveis", color: "bg-neutral-900 text-white" },
    { label: "Para venda", value: s?.for_sale ?? 0, icon: TrendingUp, href: "/admin/imoveis?tipo=venda", color: "bg-white text-neutral-900" },
    { label: "Para aluguel", value: s?.for_rent ?? 0, icon: Building2, href: "/admin/imoveis?tipo=aluguel", color: "bg-white text-neutral-900" },
    { label: "Em destaque", value: s?.featured_properties ?? 0, icon: Star, href: "/admin/imoveis?destaque=1", color: "bg-white text-neutral-900" },
    { label: "Total de leads", value: s?.total_leads ?? 0, icon: MessageSquare, href: "/admin/leads", color: "bg-white text-neutral-900" },
    { label: "Leads este mês", value: s?.leads_this_month ?? 0, icon: MessageSquare, href: "/admin/leads", color: "bg-emerald-50 text-emerald-800" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Visão geral da plataforma FGR Imóveis</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href}
            className={`${c.color} border border-neutral-100 p-5 hover:shadow-md transition-shadow group`}>
            <c.icon size={20} className="mb-3 opacity-70" />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs mt-1 opacity-70 leading-tight">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimos leads */}
        <div className="bg-white border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-neutral-900">Últimos leads</h2>
            <Link href="/admin/leads" className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentLeads.length === 0 && <p className="text-sm text-neutral-400">Nenhum lead ainda.</p>}
            {data?.recentLeads.map(l => (
              <div key={l.id} className="flex items-start justify-between gap-3 py-2 border-b border-neutral-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{l.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{l.property_title || "Contato geral"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 font-medium shrink-0 ${statusColors[l.status]}`}>
                  {statusLabels[l.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos imóveis */}
        <div className="bg-white border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-neutral-900">Últimos imóveis</h2>
            <Link href="/admin/imoveis" className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentProperties.length === 0 && <p className="text-sm text-neutral-400">Nenhum imóvel ainda.</p>}
            {data?.recentProperties.map(p => (
              <Link key={p.id} href={`/admin/imoveis/${p.id}`}
                className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 -mx-1 px-1 transition-colors">
                <div className="w-10 h-10 bg-neutral-100 shrink-0 overflow-hidden">
                  {p.cover_image && <img src={p.cover_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{p.title}</p>
                  <p className="text-xs text-neutral-400">{formatCurrency(p.price)}</p>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">{p.code}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Imóveis por tipo */}
      {data?.propertiesByType && data.propertiesByType.length > 0 && (
        <div className="bg-white border border-neutral-100 p-6">
          <h2 className="font-bold text-neutral-900 mb-5">Imóveis por categoria</h2>
          <div className="flex flex-wrap gap-3">
            {data.propertiesByType.map(t => (
              <div key={t.type} className="flex items-center gap-2 bg-neutral-50 border border-neutral-100 px-4 py-2">
                <span className="text-lg font-bold text-neutral-900">{t.total}</span>
                <span className="text-sm text-neutral-500 capitalize">{t.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
