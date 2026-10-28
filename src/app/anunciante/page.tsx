"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, MessageSquare, Star } from "lucide-react";
import { formatDate, useAdvertiser } from "@/components/marketplace/AdvertiserContext";

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Building2; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-2 text-sm text-neutral-500"><Icon size={16} />{label}</div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default function AnunciantePainelPage() {
  const { data } = useAdvertiser();
  const { plan, usage, live, account } = data;

  const listingsLimit = plan?.maxListings == null ? "ilimitado" : String(plan.maxListings);

  return (
    <div className="space-y-6">
      {!live && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <AlertTriangle className="text-amber-600 shrink-0" size={22} />
          <div className="flex-1 text-sm text-amber-900">
            {account.subscription_status === "past_due" || account.subscription_status === "unpaid"
              ? "Seu pagamento não foi aprovado. Atualize o cartão para seus anúncios voltarem ao site."
              : account.subscription_status === "expired"
                ? "O prazo do seu anúncio acabou. Renove para ele voltar ao site."
                : account.kind === "proprietario"
                  ? "Seu anúncio só aparece no site depois do pagamento."
                  : "Você ainda não tem um plano ativo. Seus anúncios só aparecem no site depois da assinatura."}
          </div>
          <Link href="/anunciante/plano" className="btn btn-dark px-5 py-2.5">
            {account.subscription_status === "expired" ? "Renovar anúncio" : account.subscription_status ? "Resolver pagamento" : account.kind === "proprietario" ? "Pagar anúncio" : "Escolher plano"}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Building2} label="Anúncios ativos" value={`${usage.listings} / ${plan ? listingsLimit : "—"}`} />
        <Stat icon={Star} label="Em destaque" value={`${usage.featured} / ${plan ? plan.maxFeatured : "—"}`} />
        <Stat icon={MessageSquare} label="Contatos recebidos" value={String(usage.leads)} />
      </div>

      {plan && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          {account.kind === "proprietario" ? "Anúncio" : "Plano"} <strong className="text-neutral-900">{plan.name}</strong>
          {account.current_period_end && (
            <> · {!account.hasSubscription ? (live ? "no ar até" : "venceu em") : account.cancel_at_period_end ? "termina em" : "próxima cobrança em"} {formatDate(account.current_period_end)}</>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/anunciante/imoveis/novo" className="group rounded-2xl border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-colors">
          <h2 className="font-bold text-neutral-900">Cadastrar imóvel</h2>
          <p className="mt-1 text-sm text-neutral-500">Fotos, preço e descrição. Entra no ar assim que o pagamento estiver em dia.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">Novo anúncio <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></span>
        </Link>
        <Link href="/anunciante/leads" className="group rounded-2xl border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-colors">
          <h2 className="font-bold text-neutral-900">Ver contatos</h2>
          <p className="mt-1 text-sm text-neutral-500">Pessoas que pediram informações sobre os seus imóveis.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">Abrir contatos <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></span>
        </Link>
      </div>
    </div>
  );
}
