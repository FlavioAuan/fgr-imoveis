"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ImageIcon, MessageSquare, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { formatBRL, useAdvertiser } from "@/components/marketplace/AdvertiserContext";
import { cn } from "@/lib/utils";

interface Listing {
  id: number;
  code: string;
  slug: string;
  title: string;
  transaction_type: string;
  status: string;
  featured: number;
  price: number | string;
  city: string;
  neighborhood: string | null;
  cover_image: string | null;
  lead_count: number;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-emerald-100 text-emerald-700" },
  reservado: { label: "Reservado", cls: "bg-amber-100 text-amber-700" },
  vendido: { label: "Vendido", cls: "bg-neutral-200 text-neutral-600" },
  alugado: { label: "Alugado", cls: "bg-neutral-200 text-neutral-600" },
  inativo: { label: "Inativo", cls: "bg-neutral-100 text-neutral-500" },
};

export default function AnuncianteImoveisPage() {
  const { data, reload } = useAdvertiser();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/anunciante/imoveis")
      .then(r => r.json())
      .then(rows => setListings(Array.isArray(rows) ? rows : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function remove(listing: Listing) {
    if (!window.confirm(`Excluir o anúncio "${listing.title}"? As fotos também serão apagadas.`)) return;
    await fetch(`/api/anunciante/imoveis/${listing.id}`, { method: "DELETE" });
    load();
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {data.usage.listings} ativo{data.usage.listings !== 1 ? "s" : ""}
          {data.plan && ` de ${data.plan.maxListings ?? "ilimitados"}`}
          {!data.live && " · fora do site até a assinatura"}
        </p>
        <Link href="/anunciante/imoveis/novo" className="btn btn-dark px-5 py-2.5">
          <Plus size={16} /> Novo anúncio
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white border border-neutral-200 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center">
          <p className="text-neutral-500 text-sm">Você ainda não cadastrou imóveis.</p>
          <Link href="/anunciante/imoveis/novo" className="mt-3 inline-block text-sm font-semibold text-neutral-900 underline underline-offset-2">
            Cadastrar o primeiro
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => {
            const st = STATUS[l.status] ?? STATUS.inativo;
            return (
              <div key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="w-full sm:w-28 aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0">
                  {l.cover_image ? <img src={l.cover_image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="text-neutral-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                    {Number(l.featured) === 1 && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Star size={12} fill="currentColor" /> Destaque</span>}
                    <span className="text-xs text-neutral-400">{l.code}</span>
                  </div>
                  <p className="mt-1 font-semibold text-neutral-900 truncate">{l.title}</p>
                  <p className="text-sm text-neutral-500">
                    {formatBRL(l.price)}{l.transaction_type === "aluguel" && "/mês"} · {[l.neighborhood, l.city].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-neutral-500 mr-2"><MessageSquare size={14} /> {l.lead_count}</span>
                  {data.live && l.status === "disponivel" && (
                    <a href={`/imoveis/${l.slug}`} target="_blank" rel="noopener noreferrer" title="Ver no site" className="p-2 rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-900">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <Link href={`/anunciante/imoveis/${l.id}`} title="Editar" className="p-2 rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-900">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => remove(l)} title="Excluir" className="p-2 rounded-full border border-neutral-300 text-neutral-600 hover:border-red-500 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
