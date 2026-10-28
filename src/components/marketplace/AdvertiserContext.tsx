"use client";

import { createContext, useContext } from "react";
import type { Plan } from "@/lib/planTypes";

export interface AdvertiserPayment {
  id: number;
  amount: number | string;
  currency: string;
  status: string;
  invoice_url: string | null;
  paid_at: string | null;
  created_at: string;
  plan_name: string | null;
}

export interface AdvertiserData {
  account: {
    id: number;
    name: string;
    company_name: string | null;
    kind: "imobiliaria" | "corretor" | "proprietario";
    document: string | null;
    creci: string | null;
    phone: string | null;
    email: string;
    plan_id: number | null;
    subscription_status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: number;
    hasBillingAccount: boolean;
    hasSubscription: boolean;
  };
  plan: Plan | null;
  live: boolean;
  usage: { listings: number; featured: number; leads: number };
  payments: AdvertiserPayment[];
}

export const AdvertiserContext = createContext<{ data: AdvertiserData; reload: () => Promise<void> } | null>(null);

export function useAdvertiser() {
  const ctx = useContext(AdvertiserContext);
  if (!ctx) throw new Error("useAdvertiser fora do painel do anunciante");
  return ctx;
}

export const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-emerald-100 text-emerald-700" },
  trialing: { label: "Em teste grátis", cls: "bg-sky-100 text-sky-700" },
  past_due: { label: "Pagamento pendente", cls: "bg-amber-100 text-amber-700" },
  unpaid: { label: "Não pago", cls: "bg-red-100 text-red-700" },
  incomplete: { label: "Pagamento incompleto", cls: "bg-amber-100 text-amber-700" },
  incomplete_expired: { label: "Expirado", cls: "bg-neutral-200 text-neutral-600" },
  canceled: { label: "Cancelado", cls: "bg-neutral-200 text-neutral-600" },
  paused: { label: "Pausado", cls: "bg-neutral-200 text-neutral-600" },
};

export function statusBadge(status: string | null | undefined) {
  return STATUS_LABELS[status ?? ""] ?? { label: "Sem plano", cls: "bg-neutral-100 text-neutral-500" };
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}

export function formatBRL(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}
