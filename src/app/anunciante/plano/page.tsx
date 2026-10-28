"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { PlanCards } from "@/components/marketplace/PlanCards";
import { formatBRL, formatDate, statusBadge, useAdvertiser } from "@/components/marketplace/AdvertiserContext";
import type { Plan } from "@/lib/planTypes";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS: Record<string, string> = {
  paid: "Pago", open: "Em aberto", void: "Cancelada", uncollectible: "Não paga", draft: "Rascunho",
};

function PlanoContent() {
  const { data, reload } = useAdvertiser();
  const router = useRouter();
  const params = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stripeConfigured, setStripeConfigured] = useState(true);
  const [busy, setBusy] = useState<number | "portal" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const confirmed = useRef(false);

  const { account, plan, payments } = data;
  const badge = statusBadge(account.subscription_status);
  const hasManagedSubscription = account.hasSubscription && !["canceled", "incomplete_expired"].includes(account.subscription_status ?? "");

  useEffect(() => {
    fetch("/api/plans").then(r => r.json()).then(d => {
      setPlans(d.plans ?? []);
      setStripeConfigured(Boolean(d.stripeConfigured));
    });
  }, []);

  // Volta do Stripe Checkout
  useEffect(() => {
    const checkout = params.get("checkout");
    if (checkout === "cancelado") setMessage({ type: "error", text: "Pagamento cancelado. Nenhuma cobrança foi feita." });
    if (checkout !== "sucesso" || confirmed.current) return;
    confirmed.current = true;
    const sessionId = params.get("session_id");
    fetch("/api/anunciante/checkout/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).finally(async () => {
      await reload();
      setMessage({ type: "ok", text: "Assinatura confirmada! Seus anúncios já podem aparecer no site." });
      router.replace("/anunciante/plano");
    });
  }, [params, reload, router]);

  async function subscribe(planId: number) {
    setBusy(planId);
    setMessage(null);
    try {
      const res = await fetch("/api/anunciante/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await res.json();
      if (result.url) { window.location.href = result.url; return; }
      if (result.activated) {
        await reload();
        setMessage({ type: "ok", text: "Plano ativado." });
      } else {
        setMessage({ type: "error", text: result.error || "Não foi possível iniciar o pagamento" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexão" });
    }
    setBusy(null);
  }

  async function openPortal() {
    setBusy("portal");
    try {
      const res = await fetch("/api/anunciante/portal", { method: "POST" });
      const result = await res.json();
      if (result.url) { window.location.href = result.url; return; }
      setMessage({ type: "error", text: result.error || "Não foi possível abrir o portal" });
    } catch {
      setMessage({ type: "error", text: "Erro de conexão" });
    }
    setBusy(null);
  }

  const preselected = Number(params.get("plano")) || null;

  return (
    <div className="space-y-8">
      {message && (
        <div className={cn(
          "flex items-center gap-2 rounded-2xl border px-5 py-4 text-sm",
          message.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
        )}>
          {message.type === "ok" && <CheckCircle2 size={18} />}
          {message.text}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-neutral-500">Plano atual</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">
            {plan ? plan.name : "Nenhum"}{" "}
            <span className={cn("ml-1 align-middle rounded-full px-2.5 py-0.5 text-xs font-semibold", badge.cls)}>{badge.label}</span>
          </p>
          {account.current_period_end && (
            <p className="mt-1 text-sm text-neutral-500">
              {account.cancel_at_period_end
                ? `Cancelado. Os anúncios saem do ar em ${formatDate(account.current_period_end)}.`
                : `Próxima cobrança em ${formatDate(account.current_period_end)}.`}
            </p>
          )}
        </div>
        {account.hasBillingAccount && (
          <button onClick={openPortal} disabled={busy !== null} className="btn btn-outline">
            {busy === "portal" ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            Gerenciar assinatura
          </button>
        )}
      </div>

      {hasManagedSubscription && (
        <p className="text-sm text-neutral-500">
          Para trocar de plano, atualizar o cartão, baixar notas ou cancelar, use <strong>Gerenciar assinatura</strong>.
        </p>
      )}

      {!stripeConfigured && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Pagamentos online ainda não estão ativos. Fale com a FGR Imóveis para assinar.
        </p>
      )}

      <div>
        <h2 className="text-lg font-bold text-neutral-900 mb-5">{plan ? "Planos disponíveis" : "Escolha seu plano"}</h2>
        <PlanCards
          plans={plans}
          currentPlanId={data.live ? account.plan_id : null}
          action={(p, isCurrent) =>
            isCurrent ? (
              <span className="btn w-full bg-neutral-100 text-neutral-500 cursor-default">Seu plano atual</span>
            ) : (
              <button
                onClick={() => (hasManagedSubscription ? openPortal() : subscribe(p.id))}
                disabled={busy !== null || (!stripeConfigured && p.price > 0 && !hasManagedSubscription)}
                className={cn("btn w-full", p.highlighted || p.id === preselected ? "btn-dark" : "btn-outline")}
              >
                {busy === p.id && <Loader2 size={16} className="animate-spin" />}
                {hasManagedSubscription ? "Trocar para este plano" : p.price === 0 ? "Ativar grátis" : p.trialDays > 0 ? "Começar teste grátis" : "Assinar com cartão"}
              </button>
            )
          }
        />
        <p className="mt-4 text-xs text-neutral-400 text-center">Pagamento processado pelo Stripe. A FGR Imóveis não vê nem guarda os dados do seu cartão.</p>
      </div>

      {payments.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <h2 className="px-6 py-4 font-bold text-neutral-900 border-b border-neutral-100">Pagamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-500">
                <tr><th className="px-6 py-3 font-medium">Data</th><th className="px-6 py-3 font-medium">Plano</th><th className="px-6 py-3 font-medium">Valor</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="px-6 py-3">{formatDate(pay.paid_at ?? pay.created_at)}</td>
                    <td className="px-6 py-3">{pay.plan_name ?? "—"}</td>
                    <td className="px-6 py-3">{formatBRL(pay.amount)}</td>
                    <td className="px-6 py-3">{PAYMENT_STATUS[pay.status] ?? pay.status}</td>
                    <td className="px-6 py-3 text-right">
                      {pay.invoice_url && (
                        <a href={pay.invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-900 underline underline-offset-2">
                          Fatura <ExternalLink size={13} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnunciantePlanoPage() {
  return (
    <Suspense>
      <PlanoContent />
    </Suspense>
  );
}
