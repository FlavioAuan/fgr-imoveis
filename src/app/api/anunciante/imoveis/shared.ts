import { queryOne, QueryParam } from "@/lib/db";
import type { AdvertiserAccount } from "@/lib/advertiserAuth";
import { getAdvertiserPlan } from "@/lib/advertiserAuth";
import { isLiveAccount } from "@/lib/plans";

const TRANSACTIONS = ["venda", "aluguel"];
const TYPES = ["casa", "apartamento", "cobertura", "studio", "terreno", "comercial", "condominio"];
const STATUSES = ["disponivel", "vendido", "alugado", "reservado", "inativo"];

/** Campos que o anunciante pode editar (sem corretor da FGR nem SEO). */
export const ADVERTISER_FIELDS = [
  "title", "transaction_type", "property_type", "status", "featured", "price",
  "condominium_fee", "iptu", "area", "built_area", "bedrooms", "suites", "bathrooms", "parking_spaces",
  "description", "city", "state", "neighborhood", "address", "zipcode", "youtube_url", "virtual_tour_url",
] as const;

export type AdvertiserPropertyInput = Record<(typeof ADVERTISER_FIELDS)[number], QueryParam>;

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function text(value: unknown, max: number): string | null {
  const s = String(value ?? "").trim();
  return s ? s.slice(0, max) : null;
}

function url(value: unknown): string | null {
  const s = text(value, 500);
  return s && /^https?:\/\//i.test(s) ? s : null;
}

export function parseAdvertiserProperty(body: Record<string, unknown>): { data: AdvertiserPropertyInput } | { error: string } {
  const title = text(body.title, 250);
  const city = text(body.city, 100);
  if (!title) return { error: "Informe o título do anúncio" };
  if (!city) return { error: "Informe a cidade" };
  const price = num(body.price);
  if (!price) return { error: "Informe o preço" };

  const small = (v: unknown) => Math.min(50, Math.floor(num(v) ?? 0));

  return {
    data: {
      title,
      transaction_type: TRANSACTIONS.includes(String(body.transaction_type)) ? String(body.transaction_type) : "venda",
      property_type: TYPES.includes(String(body.property_type)) ? String(body.property_type) : "casa",
      status: STATUSES.includes(String(body.status)) ? String(body.status) : "disponivel",
      featured: body.featured ? 1 : 0,
      price,
      condominium_fee: num(body.condominium_fee),
      iptu: num(body.iptu),
      area: num(body.area),
      built_area: num(body.built_area),
      bedrooms: small(body.bedrooms),
      suites: small(body.suites),
      bathrooms: small(body.bathrooms),
      parking_spaces: small(body.parking_spaces),
      description: text(body.description, 5000),
      city,
      state: (text(body.state, 2) ?? "SP").toUpperCase(),
      neighborhood: text(body.neighborhood, 100),
      address: text(body.address, 250),
      zipcode: text(body.zipcode, 10),
      youtube_url: url(body.youtube_url),
      virtual_tour_url: url(body.virtual_tour_url),
    },
  };
}

/**
 * Confere os limites do plano antes de salvar.
 * `previous` é o anúncio atual (na edição), para não contar ele mesmo duas vezes.
 */
export async function checkPlanLimits(
  account: AdvertiserAccount,
  data: AdvertiserPropertyInput,
  previous?: { id: number; status: string; featured: number }
): Promise<string | null> {
  const plan = await getAdvertiserPlan(account);
  const live = isLiveAccount(account);

  const willBeActive = data.status !== "inativo";
  const wasActive = previous ? previous.status !== "inativo" : false;
  const willBeFeatured = Boolean(data.featured) && willBeActive;
  const wasFeatured = previous ? Boolean(Number(previous.featured)) && wasActive : false;

  if (willBeActive && !wasActive && (!plan || !live)) {
    return account.kind === "proprietario"
      ? "Pague o anúncio para publicar. Você pode salvar como Inativo enquanto isso."
      : "Assine um plano para publicar anúncios. Você pode salvar como Inativo enquanto isso.";
  }

  const excludeId = previous?.id ?? 0;
  const usage = await queryOne<{ listings: number; featured: number }>(
    `SELECT
      SUM(status<>'inativo') AS listings,
      SUM(featured=1 AND status<>'inativo') AS featured
     FROM properties WHERE advertiser_id=? AND id<>?`,
    [account.id, excludeId]
  );

  if (willBeActive && !wasActive && plan?.max_listings != null && Number(usage?.listings ?? 0) >= Number(plan.max_listings)) {
    const max = Number(plan.max_listings);
    return max === 1
      ? `${plan.name} permite 1 imóvel no ar. Inative o outro anúncio para publicar este.`
      : `Seu plano ${plan.name} permite ${max} anúncios ativos. Troque de plano ou inative outro anúncio.`;
  }
  if (willBeFeatured && !wasFeatured && Number(usage?.featured ?? 0) >= Number(plan?.max_featured ?? 0)) {
    return plan && Number(plan.max_featured) > 0
      ? `Seu plano ${plan.name} permite ${plan.max_featured} anúncios em destaque.`
      : "Seu plano não inclui anúncios em destaque.";
  }
  return null;
}

type OwnedRow = { id: number; status: string; featured: number };

/** Só devolve o imóvel se ele pertence ao anunciante. */
export async function getOwnedProperty(advertiserId: number, propertyId: number) {
  return queryOne<OwnedRow>(
    "SELECT id, status, featured FROM properties WHERE id=? AND advertiser_id=? LIMIT 1",
    [propertyId, advertiserId]
  );
}
