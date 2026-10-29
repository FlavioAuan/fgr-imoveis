"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Mail, MessageCircle, Pencil, Phone, Trash2, X } from "lucide-react";
import {
  CONTACT_CHANNELS, CONTACT_OUTCOMES, CONTACT_TARGETS, MARKET_STATUSES,
  categoryColor, labelOf, marketStreetViewUrl, statusInfo, whatsappLink,
  type ContactChannel, type ContactOutcome, type ContactTarget,
  type MarketAgency, type MarketContact, type MarketListing,
} from "@/lib/market";
import { formatCurrency, cn } from "@/lib/utils";

const inputCls =
  "w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";
const labelCls = "text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5";
const smallBtn =
  "inline-flex items-center gap-1.5 border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors";

interface Props {
  listing: MarketListing;
  agency: MarketAgency | undefined;
  canDelete: boolean;
  onClose: () => void;
  onListingChange: (listing: MarketListing) => void;
  onAgencyChange: (agency: MarketAgency) => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function MarketListingPanel({ listing, agency, canDelete, onClose, onListingChange, onAgencyChange }: Props) {
  const [contacts, setContacts] = useState<MarketContact[] | null>(null);

  // Controle do imóvel
  const [status, setStatus] = useState(listing.status);
  const [nextFollowup, setNextFollowup] = useState(listing.nextFollowup ?? "");
  const [ownerName, setOwnerName] = useState(listing.ownerName ?? "");
  const [ownerPhone, setOwnerPhone] = useState(listing.ownerPhone ?? "");
  const [ownerEmail, setOwnerEmail] = useState(listing.ownerEmail ?? "");
  const [notes, setNotes] = useState(listing.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Novo contato
  const [target, setTarget] = useState<ContactTarget>("imobiliaria");
  const [channel, setChannel] = useState<ContactChannel>("whatsapp");
  const [outcome, setOutcome] = useState<ContactOutcome>("sem_resposta");
  const [contactNotes, setContactNotes] = useState("");
  const [contactFollowup, setContactFollowup] = useState("");
  const [registering, setRegistering] = useState(false);

  const [error, setError] = useState("");
  const [editingAgency, setEditingAgency] = useState(false);

  useEffect(() => {
    let active = true;
    setContacts(null);
    fetch(`/api/mercado/${listing.id}`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => { if (active) setContacts(json?.contacts ?? []); })
      .catch(() => { if (active) setContacts([]); });
    return () => { active = false; };
  }, [listing.id]);

  // Quando o registro de um contato muda o status, o formulário acompanha
  useEffect(() => {
    setStatus(listing.status);
    setNextFollowup(listing.nextFollowup ?? "");
  }, [listing.status, listing.nextFollowup]);

  const message = `Olá! Vi o anúncio ${listing.title ? `"${listing.title}"` : "do imóvel"} (${listing.url}) e gostaria de conversar sobre ele.`;

  async function saveControl() {
    setSaving(true); setSaved(false); setError("");
    try {
      const res = await fetch(`/api/mercado/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, nextFollowup: nextFollowup || null, ownerName, ownerPhone, ownerEmail, notes }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar"); return; }
      onListingChange(json.listing);
      setSaved(true);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function registerContact(e: React.FormEvent) {
    e.preventDefault();
    setRegistering(true); setError("");
    try {
      const res = await fetch(`/api/mercado/${listing.id}/contatos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, channel, outcome, notes: contactNotes, nextFollowup: contactFollowup || null }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao registrar o contato"); return; }
      if (json.contact) setContacts(prev => [json.contact, ...(prev ?? [])]);
      onListingChange(json.listing);
      setContactNotes(""); setContactFollowup(""); setOutcome("sem_resposta");
    } catch {
      setError("Erro de conexão");
    } finally {
      setRegistering(false);
    }
  }

  async function deleteContact(id: number) {
    setError("");
    const res = await fetch(`/api/mercado/contatos/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error || "Erro ao excluir o contato"); return; }
    setContacts(prev => (prev ?? []).filter(c => c.id !== id));
    onListingChange(json.listing);
  }

  const st = statusInfo(listing.status);

  return (
    <div className="fixed inset-0 z-[1100] flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="font-bold text-neutral-900">Imóvel do mercado</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Imóvel */}
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: categoryColor(listing.category) }} />
              {listing.category} · {agency?.name}
              <span className={cn("ml-auto px-2 py-0.5 text-[11px] normal-case tracking-normal", st.cls)}>{st.label}</span>
            </p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{formatCurrency(listing.price)}</p>
            <p className="text-sm text-neutral-700">
              {listing.neighborhood || "Bairro não informado"}
              {listing.area ? ` · ${listing.area.toLocaleString("pt-BR")} m²` : ""}
              {listing.bedrooms ? ` · ${listing.bedrooms} quarto${listing.bedrooms > 1 ? "s" : ""}` : ""}
            </p>
            {listing.title && <p className="mt-1 text-xs text-neutral-500">{listing.title}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={listing.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-700 transition-colors">
                Ver anúncio <ExternalLink size={13} />
              </a>
              <a href={marketStreetViewUrl(listing)} target="_blank" rel="noopener noreferrer" className={smallBtn}>
                {listing.lat != null ? "Street View" : "Ver no mapa"} <ExternalLink size={13} />
              </a>
            </div>
            {listing.geo === "bairro" && (
              <p className="mt-2 text-xs text-neutral-400">Localização aproximada pelo bairro: o endereço exato fica com a imobiliária.</p>
            )}
          </div>

          {/* Imobiliária */}
          <section className="border-t border-neutral-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">Imobiliária</h3>
              {agency && !editingAgency && (
                <button type="button" onClick={() => setEditingAgency(true)} className={smallBtn}>
                  <Pencil size={12} /> Editar contato
                </button>
              )}
            </div>
            {agency && (editingAgency ? (
              <AgencyForm agency={agency} onCancel={() => setEditingAgency(false)} onSaved={a => { onAgencyChange(a); setEditingAgency(false); }} />
            ) : (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-neutral-900">{agency.name}{agency.contactName ? ` · ${agency.contactName}` : ""}</p>
                {agency.website && (
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="block text-neutral-600 underline underline-offset-2 break-all">
                    {agency.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <ContactButtons phone={agency.phone} whatsapp={agency.whatsapp} email={agency.email} message={message} />
                {!agency.phone && !agency.whatsapp && !agency.email && (
                  <p className="text-xs text-neutral-400">Sem telefone ou e-mail cadastrado. Use “Editar contato” para salvar.</p>
                )}
                {agency.notes && <p className="text-xs text-neutral-500 whitespace-pre-line">{agency.notes}</p>}
              </div>
            ))}
          </section>

          {/* Controle e proprietário */}
          <section className="border-t border-neutral-200 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Controle do imóvel</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="mk-status">Status</label>
                <select id="mk-status" value={status} onChange={e => setStatus(e.target.value as typeof status)} className={inputCls}>
                  {MARKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="mk-followup">Próximo retorno</label>
                <input id="mk-followup" type="date" value={nextFollowup} onChange={e => setNextFollowup(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <p className={labelCls}>Proprietário</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Nome" className={cn(inputCls, "sm:col-span-2")} aria-label="Nome do proprietário" />
                <input value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} placeholder="Telefone / WhatsApp" className={inputCls} aria-label="Telefone do proprietário" />
                <input value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="E-mail" type="email" className={inputCls} aria-label="E-mail do proprietário" />
              </div>
              {(listing.ownerPhone || listing.ownerEmail) && (
                <div className="mt-2">
                  <ContactButtons phone={listing.ownerPhone} whatsapp={listing.ownerPhone} email={listing.ownerEmail} message={message} />
                </div>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="mk-notes">Anotações internas</label>
              <textarea id="mk-notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: proprietário aceita exclusividade, prefere contato à tarde..." className={cn(inputCls, "resize-none")} />
            </div>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-sm text-green-600 font-medium">Salvo!</span>}
              <button type="button" onClick={saveControl} disabled={saving} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </section>

          {/* Registrar contato */}
          <section className="border-t border-neutral-200 pt-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">Registrar contato</h3>
            <form onSubmit={registerContact} className="space-y-3 bg-neutral-50 border border-neutral-200 p-4">
              <div className="flex gap-1" role="group" aria-label="Com quem">
                {CONTACT_TARGETS.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    aria-pressed={target === t.value}
                    onClick={() => setTarget(t.value)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                      target === t.value ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="mk-channel">Canal</label>
                  <select id="mk-channel" value={channel} onChange={e => setChannel(e.target.value as ContactChannel)} className={inputCls}>
                    {CONTACT_CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="mk-outcome">Resultado</label>
                  <select id="mk-outcome" value={outcome} onChange={e => setOutcome(e.target.value as ContactOutcome)} className={inputCls}>
                    {CONTACT_OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <textarea rows={2} value={contactNotes} onChange={e => setContactNotes(e.target.value)} placeholder="O que foi conversado" className={cn(inputCls, "resize-none")} aria-label="Observação do contato" />
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <label className={labelCls} htmlFor="mk-cfollow">Retornar em</label>
                  <input id="mk-cfollow" type="date" value={contactFollowup} onChange={e => setContactFollowup(e.target.value)} className={inputCls} />
                </div>
                <button type="submit" disabled={registering} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50">
                  {registering && <Loader2 size={14} className="animate-spin" />}
                  Registrar contato
                </button>
              </div>
            </form>
          </section>

          {/* Histórico */}
          <section className="border-t border-neutral-200 pt-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-3">
              Histórico de contatos {contacts && contacts.length > 0 && <span className="text-neutral-400 font-medium">({contacts.length})</span>}
            </h3>
            {contacts === null ? (
              <p className="text-sm text-neutral-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Carregando...</p>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-neutral-400">Nenhum contato registrado ainda.</p>
            ) : (
              <ol className="space-y-3">
                {contacts.map(c => (
                  <li key={c.id} className="border-l-2 border-neutral-900 pl-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900">
                        {labelOf(CONTACT_TARGETS, c.target)} · {labelOf(CONTACT_CHANNELS, c.channel)} ·{" "}
                        <span className="text-neutral-600">{labelOf(CONTACT_OUTCOMES, c.outcome)}</span>
                      </p>
                      {canDelete && (
                        <button type="button" onClick={() => deleteContact(c.id)} aria-label="Excluir contato" title="Excluir contato" className="text-neutral-300 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{formatDateTime(c.createdAt)}{c.userName ? ` · ${c.userName}` : ""}</p>
                    {c.notes && <p className="mt-1 text-sm text-neutral-700 whitespace-pre-line">{c.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {error && (
          <div className="px-6 py-3 border-t border-neutral-200">
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactButtons({ phone, whatsapp, email, message }: { phone: string | null; whatsapp: string | null; email: string | null; message: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {whatsapp && (
        <a href={whatsappLink(whatsapp, message)} target="_blank" rel="noopener noreferrer" className={smallBtn}>
          <MessageCircle size={13} /> WhatsApp
        </a>
      )}
      {phone && (
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={smallBtn}>
          <Phone size={13} /> {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}?subject=${encodeURIComponent("Imóvel anunciado")}&body=${encodeURIComponent(message)}`} className={smallBtn}>
          <Mail size={13} /> {email}
        </a>
      )}
    </div>
  );
}

export function AgencyForm({ agency, onCancel, onSaved }: { agency: MarketAgency; onCancel: () => void; onSaved: (a: MarketAgency) => void }) {
  const [form, setForm] = useState({
    contactName: agency.contactName ?? "", phone: agency.phone ?? "", whatsapp: agency.whatsapp ?? "",
    email: agency.email ?? "", website: agency.website ?? "", notes: agency.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save() {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/mercado/imobiliarias/${agency.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar"); return; }
      onSaved(json.agency);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <input value={form.contactName} onChange={set("contactName")} placeholder="Pessoa de contato" className={inputCls} aria-label="Pessoa de contato" />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.phone} onChange={set("phone")} placeholder="Telefone" className={inputCls} aria-label="Telefone" />
        <input value={form.whatsapp} onChange={set("whatsapp")} placeholder="WhatsApp" className={inputCls} aria-label="WhatsApp" />
      </div>
      <input value={form.email} onChange={set("email")} placeholder="E-mail" type="email" className={inputCls} aria-label="E-mail" />
      <input value={form.website} onChange={set("website")} placeholder="Site" className={inputCls} aria-label="Site" />
      <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Observações (horário, comissão, parceria...)" className={cn(inputCls, "resize-none")} aria-label="Observações" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors">Cancelar</button>
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50">
          {saving && <Loader2 size={14} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </div>
  );
}
