import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { LISTING_SELECT, STAFF, errorResponse, mapAgency, mapListing } from "./shared";

// Todos os anúncios do mercado (a tela filtra no navegador, como no levantamento original)
export async function GET() {
  try {
    await requireAuth(STAFF);
    const [agencies, listings] = await Promise.all([
      query<Record<string, unknown>>("SELECT * FROM market_agencies ORDER BY name"),
      query<Record<string, unknown>>(`${LISTING_SELECT} ORDER BY price`),
    ]);
    return NextResponse.json({ agencies: agencies.map(mapAgency), listings: listings.map(mapListing) });
  } catch (e) {
    return errorResponse(e, "Erro ao carregar os imóveis do mercado");
  }
}
