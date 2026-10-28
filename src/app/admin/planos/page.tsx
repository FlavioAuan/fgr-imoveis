"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import type { Plan } from "@/lib/planTypes";
import { formatPlanPrice } from "@/lib/planTypes";

interface PlanForm {
  name: string;
  description: string;
  price: string;
  billing_interval: "month" | "year";
  trial_days: string;
  max_listings: string;
  max_featured: string;
  features: string;
  highlighted: boolean;
  active: boolean;
  display_order: string;
}

const emptyForm: PlanForm = {
  name: "", description: "", price: "", billing_interval: "month", trial_days: "0",
  max_listings: "", max_featured: "0", features: "", highlighted: false, active: true, display_order: "0",
};

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const set = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => setForm(p => ({ ...p, [key]: value }));

  function fetchPlans() {
    setLoading(true);
    fetch("/api/plans?all=1")
      .then(r => r.json())
      .then(d => {
        setPlans(Array.isArray(d.plans) ? d.plans : []);
        setStripeConfigured(Boolean(d.stripeConfigured));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPlans(); }, []);

  function openNew() {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: String(plans.length + 1) });
    setError("");
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      price: String(plan.price),
      billing_interval: plan.billingInterval,
      trial_days: String(plan.trialDays),
      max_listings: plan.maxListings == null ? "" : String(plan.maxListings),
      max_featured: String(plan.maxFeatured),
      features: plan.features.join("\n"),
      highlighted: plan.highlighted,
      active: plan.active,
      display_order: String(plan.displayOrder),
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/plans/${editingId}` : "/api/plans", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price.replace(",", ".")),
          max_listings: form.max_listings === "" ? null : Number(form.max_listings),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao salvar plano"); return; }
      setNotice([data.stripeWarning, data.notice].filter(Boolean).join(" ") || "Plano salvo.");
      setModalOpen(false);
      fetchPlans();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(plan: Plan) {
    const msg = plan.subscribers
      ? `"${plan.name}" tem ${plan.subscribers} assinante(s). Ele será desativado (some da página de planos), mas quem já assina continua até cancelar. Continuar?`
      : `Excluir o plano "${plan.name}"?`;
    if (!window.confirm(msg)) return;
    const res = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
    const data = await res.json();
    setNotice(res.ok ? (data.deactivated ? "Plano desativado." : "Plano excluído.") : data.error || "Erro ao excluir");
    fetchPlans();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Planos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Planos que imobiliárias e corretores assinam para anunciar no portal</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors">
          <Plus size={16} /> Novo plano
        </button>
      </div>

      {!stripeConfigured && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            Stripe não configurado. Os planos podem ser criados, mas os clientes só conseguem pagar depois de definir
            <code className="mx-1 bg-amber-100 px-1">STRIPE_SECRET_KEY</code> e
            <code className="mx-1 bg-amber-100 px-1">STRIPE_WEBHOOK_SECRET</code> no servidor.
          </span>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} />{notice}</span>
          <button onClick={() => setNotice("")}><X size={16} /></button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 bg-white border border-neutral-200 animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-neutral-200 flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-neutral-400 text-sm">Nenhum plano cadastrado.</p>
          <button onClick={openNew} className="text-sm text-neutral-900 underline underline-offset-2">Criar o primeiro plano</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white border p-5 flex flex-col gap-3 ${plan.active ? "border-neutral-200" : "border-dashed border-neutral-300 opacity-70"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    {plan.name}
                    {plan.highlighted && <Star size={13} className="text-yellow-500" fill="currentColor" />}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 mt-1">
                    {plan.price === 0 ? "Grátis" : formatPlanPrice(plan.price, plan.billingInterval)}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${plan.active ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"}`}>
                  {plan.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <ul className="text-xs text-neutral-600 space-y-1">
                <li>{plan.maxListings == null ? "Anúncios ilimitados" : `${plan.maxListings} anúncios ativos`}</li>
                <li>{plan.maxFeatured} em destaque</li>
                {plan.trialDays > 0 && <li>{plan.trialDays} dias de teste grátis</li>}
              </ul>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5">{plan.subscribers ?? 0} assinante{plan.subscribers === 1 ? "" : "s"}</span>
                {plan.price > 0 && (
                  <span className={`px-2 py-0.5 ${plan.stripeSynced ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                    {plan.stripeSynced ? "No Stripe" : "Ainda não está no Stripe"}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button onClick={() => handleDelete(plan)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:border-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={12} /> {plan.subscribers ? "Desativar" : "Excluir"}
                </button>
                <button onClick={() => openEdit(plan)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:border-neutral-900 hover:text-neutral-900 transition-colors">
                  <Pencil size={12} /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-xl shadow-xl max-h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white">
              <h2 className="font-bold text-neutral-900">{editingId ? "Editar plano" : "Novo plano"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-900"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

              <Field label="Nome *">
                <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Imobiliária" className={inputCls} />
              </Field>
              <Field label="Descrição curta">
                <input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Para quem é este plano" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço (R$) *" hint="0 = plano grátis">
                  <input required inputMode="decimal" value={form.price} onChange={e => set("price", e.target.value)} placeholder="199,00" className={inputCls} />
                </Field>
                <Field label="Cobrança">
                  <select value={form.billing_interval} onChange={e => set("billing_interval", e.target.value as "month" | "year")} className={inputCls}>
                    <option value="month">Mensal</option>
                    <option value="year">Anual</option>
                  </select>
                </Field>
                <Field label="Anúncios ativos" hint="Vazio = ilimitado">
                  <input type="number" min={0} value={form.max_listings} onChange={e => set("max_listings", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Anúncios em destaque">
                  <input type="number" min={0} value={form.max_featured} onChange={e => set("max_featured", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Dias de teste grátis">
                  <input type="number" min={0} max={730} value={form.trial_days} onChange={e => set("trial_days", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Ordem na página">
                  <input type="number" min={0} value={form.display_order} onChange={e => set("display_order", e.target.value)} className={inputCls} />
                </Field>
              </div>

              <Field label="Benefícios" hint="Um por linha. O limite de anúncios já aparece automaticamente.">
                <textarea rows={4} value={form.features} onChange={e => set("features", e.target.value)} className={`${inputCls} resize-none`}
                  placeholder={"Leads direto no painel\nRelatório mensal"} />
              </Field>

              <div className="space-y-2">
                <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer select-none">
                  <input type="checkbox" checked={form.highlighted} onChange={e => set("highlighted", e.target.checked)} className="w-4 h-4 accent-neutral-900" />
                  Destacar como &quot;Mais escolhido&quot;
                </label>
                <label className="flex items-center gap-2.5 text-sm text-neutral-700 cursor-pointer select-none">
                  <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="w-4 h-4 accent-neutral-900" />
                  Plano ativo (aparece para os clientes)
                </label>
              </div>

              {editingId && (
                <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 px-3 py-2">
                  Mudar preço ou cobrança cria um novo preço no Stripe. Quem já assina continua no valor antigo.
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 disabled:opacity-50">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar plano"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
