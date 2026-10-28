import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export interface PlanInput {
  name: string;
  slug: string;
  audience: "profissional" | "proprietario";
  description: string | null;
  price: number;
  billing_interval: "month" | "year" | "once";
  duration_days: number;
  trial_days: number;
  max_listings: number | null;
  max_featured: number;
  features: string | null;
  highlighted: number;
  active: number;
  display_order: number;
}

function toInt(value: unknown, fallback = 0): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function parsePlanBody(body: Record<string, unknown>): { data: PlanInput } | { error: string } {
  const name = String(body.name ?? "").trim();
  if (!name) return { error: "Informe o nome do plano" };

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) return { error: "Preço inválido" };
  if (price > 0 && price < 1) return { error: "O Stripe exige preço mínimo de R$ 1,00 (ou 0 para plano grátis)" };

  const interval =
    body.billing_interval === "year" ? "year" : body.billing_interval === "once" ? "once" : "month";
  const durationDays = Math.min(3650, toInt(body.duration_days));
  if (interval === "once" && durationDays < 1) return { error: "Informe por quantos dias vale o anúncio avulso" };
  const maxListingsRaw = body.max_listings;
  const maxListings =
    maxListingsRaw === null || maxListingsRaw === "" || maxListingsRaw === undefined ? null : toInt(maxListingsRaw);

  const features = Array.isArray(body.features)
    ? body.features.map(f => String(f).trim()).filter(Boolean).join("\n")
    : String(body.features ?? "").split("\n").map(f => f.trim()).filter(Boolean).join("\n");

  return {
    data: {
      name,
      slug: slugify(String(body.slug ?? "") || name),
      audience: body.audience === "proprietario" ? "proprietario" : "profissional",
      description: String(body.description ?? "").trim() || null,
      price: Math.round(price * 100) / 100,
      billing_interval: interval,
      duration_days: interval === "once" ? durationDays : 0,
      // Teste grátis só existe em assinatura
      trial_days: interval === "once" ? 0 : Math.min(730, toInt(body.trial_days)),
      max_listings: maxListings,
      max_featured: toInt(body.max_featured),
      features: features || null,
      highlighted: body.highlighted ? 1 : 0,
      active: body.active === false || body.active === 0 ? 0 : 1,
      display_order: toInt(body.display_order),
    },
  };
}

export function planError(e: unknown, fallback: string) {
  if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão para gerenciar planos" }, { status: 403 });
  console.error(e);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
