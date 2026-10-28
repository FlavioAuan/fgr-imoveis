import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { queryOne } from "./db";
import type { PlanRow } from "./plans";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fgr_secret_fallback"
);

/** Cookie separado do painel admin: anunciantes nunca acessam /admin. */
export const ADVERTISER_COOKIE = "fgr_adv_token";
const AUDIENCE = "advertiser";
const MAX_AGE = 60 * 60 * 24 * 7;

export const ADVERTISER_KINDS = ["imobiliaria", "corretor", "proprietario"] as const;
export type AdvertiserKind = (typeof ADVERTISER_KINDS)[number];

export interface AdvertiserSession {
  id: number;
  name: string;
  email: string;
}

export async function signAdvertiserToken(payload: AdvertiserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export function setAdvertiserCookie(res: NextResponse, token: string) {
  res.cookies.set(ADVERTISER_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: MAX_AGE, path: "/",
  });
}

export async function getAdvertiserSession(): Promise<AdvertiserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADVERTISER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { audience: AUDIENCE });
    return { id: Number(payload.id), name: String(payload.name), email: String(payload.email) };
  } catch {
    return null;
  }
}

export interface AdvertiserAccount {
  id: number;
  name: string;
  company_name: string | null;
  kind: AdvertiserKind;
  document: string | null;
  creci: string | null;
  phone: string | null;
  email: string;
  active: number;
  plan_id: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: number;
}

const ACCOUNT_FIELDS =
  "id,name,company_name,kind,document,creci,phone,email,active,plan_id,stripe_customer_id," +
  "stripe_subscription_id,subscription_status,current_period_end,cancel_at_period_end";

/** Sessão + conta ativa no banco. Lança UNAUTHORIZED se não houver anunciante válido. */
export async function requireAdvertiser(): Promise<AdvertiserAccount> {
  const session = await getAdvertiserSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const account = await queryOne<AdvertiserAccount>(
    `SELECT ${ACCOUNT_FIELDS} FROM advertisers WHERE id=? LIMIT 1`,
    [session.id]
  );
  if (!account || !Number(account.active)) throw new Error("UNAUTHORIZED");
  return account;
}

export async function getAdvertiserPlan(account: AdvertiserAccount) {
  if (!account.plan_id) return null;
  return queryOne<PlanRow>("SELECT * FROM plans WHERE id=? LIMIT 1", [account.plan_id]);
}

export function advertiserError(e: unknown, fallback: string) {
  if (e instanceof Error && e.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Faça login para continuar" }, { status: 401 });
  }
  console.error(e);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
