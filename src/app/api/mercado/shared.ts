import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import type { MarketAgency, MarketContact, MarketListing, MarketStatus } from "@/lib/market";

export const LISTING_SELECT = `SELECT id, agency_id, category, raw_type, neighborhood, price, area, bedrooms, url, title,
  latitude, longitude, geo_precision, status, owner_name, owner_phone, owner_email, notes,
  DATE_FORMAT(next_followup_at, '%Y-%m-%d') AS next_followup, last_contact_at, contacts_count
  FROM market_listings`;

type Row = Record<string, unknown>;
const str = (v: unknown) => (v == null || v === "" ? null : String(v));
const num = (v: unknown) => (v == null ? null : Number(v));

export function mapListing(r: Row): MarketListing {
  return {
    id: Number(r.id),
    agencyId: Number(r.agency_id),
    category: String(r.category),
    rawType: str(r.raw_type),
    neighborhood: str(r.neighborhood),
    price: Number(r.price),
    area: num(r.area),
    bedrooms: num(r.bedrooms),
    url: String(r.url),
    title: str(r.title),
    lat: num(r.latitude),
    lng: num(r.longitude),
    geo: (str(r.geo_precision) as MarketListing["geo"]) ?? null,
    status: String(r.status) as MarketStatus,
    ownerName: str(r.owner_name),
    ownerPhone: str(r.owner_phone),
    ownerEmail: str(r.owner_email),
    notes: str(r.notes),
    nextFollowup: str(r.next_followup),
    lastContact: r.last_contact_at ? new Date(r.last_contact_at as string).toISOString() : null,
    contacts: Number(r.contacts_count ?? 0),
  };
}

export function mapAgency(r: Row): MarketAgency {
  return {
    id: Number(r.id),
    name: String(r.name),
    website: str(r.website),
    phone: str(r.phone),
    whatsapp: str(r.whatsapp),
    email: str(r.email),
    contactName: str(r.contact_name),
    notes: str(r.notes),
  };
}

export function mapContact(r: Row): MarketContact {
  return {
    id: Number(r.id),
    listingId: Number(r.listing_id),
    target: r.target as MarketContact["target"],
    channel: r.channel as MarketContact["channel"],
    outcome: r.outcome as MarketContact["outcome"],
    notes: str(r.notes),
    userName: str(r.user_name),
    createdAt: new Date(r.created_at as string).toISOString(),
  };
}

export async function getListing(id: number) {
  const row = await queryOne<Row>(`${LISTING_SELECT} WHERE id=?`, [id]);
  return row ? mapListing(row) : null;
}

/** Texto curto ou null, cortado no tamanho da coluna. */
export function cleanText(v: unknown, max: number) {
  if (v == null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export function errorResponse(e: unknown, fallback = "Erro ao processar") {
  if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  console.error(e);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export const STAFF = ["super_admin", "admin", "corretor"] as Array<"super_admin" | "admin" | "corretor">;
