import { NextRequest, NextResponse } from "next/server";
import { advertiserError, requireAdvertiser } from "@/lib/advertiserAuth";
import { savePropertyImages } from "@/lib/propertyImages";
import { getOwnedProperty } from "../../shared";

type RouteContext = { params: Promise<{ id: string }> };

// POST — envia fotos para um anúncio do anunciante
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const account = await requireAdvertiser();
    const propertyId = Number((await params).id);
    if (!(await getOwnedProperty(account.id, propertyId))) {
      return NextResponse.json({ error: "Anúncio não encontrado" }, { status: 404 });
    }
    const files = (await req.formData()).getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) return NextResponse.json({ error: "Nenhum arquivo" }, { status: 400 });

    const result = await savePropertyImages(propertyId, files);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true, paths: result.saved });
  } catch (e) {
    return advertiserError(e, "Erro no envio das fotos");
  }
}
