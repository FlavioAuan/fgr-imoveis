"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/config";

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
  property_id: number;
  property_title: string;
  property_code: string;
  property_slug: string;
}

export default function AnuncianteLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/anunciante/leads")
      .then(r => r.json())
      .then(rows => setLeads(Array.isArray(rows) ? rows : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white border border-neutral-200 animate-pulse" />)}</div>;
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center text-sm text-neutral-500">
        Nenhum contato ainda. Eles aparecem aqui quando alguém pede informações em um dos seus anúncios.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map(lead => (
        <div key={lead.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-neutral-900">{lead.name}</p>
              <Link href={`/anunciante/imoveis/${lead.property_id}`} className="text-sm text-neutral-500 hover:text-neutral-900">
                {lead.property_title} · {lead.property_code}
              </Link>
            </div>
            <span className="text-xs text-neutral-400">{new Date(lead.created_at).toLocaleString("pt-BR")}</span>
          </div>
          {lead.message && <p className="mt-3 text-sm text-neutral-600 whitespace-pre-line">{lead.message}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {lead.phone && (
              <>
                <a
                  href={getWhatsAppUrl(`Olá, ${lead.name}! Recebi seu contato sobre o imóvel ${lead.property_title} (${lead.property_code}).`, lead.phone)}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-dark px-4 py-2"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a href={`tel:${lead.phone}`} className="btn btn-outline px-4 py-2"><Phone size={15} /> {lead.phone}</a>
              </>
            )}
            {lead.email && <a href={`mailto:${lead.email}`} className="btn btn-outline px-4 py-2"><Mail size={15} /> {lead.email}</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
