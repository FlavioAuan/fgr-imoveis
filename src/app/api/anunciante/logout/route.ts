import { NextResponse } from "next/server";
import { ADVERTISER_COOKIE } from "@/lib/advertiserAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADVERTISER_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
