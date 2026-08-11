import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const features = await query("SELECT * FROM features ORDER BY name ASC");
  return NextResponse.json(features);
}
