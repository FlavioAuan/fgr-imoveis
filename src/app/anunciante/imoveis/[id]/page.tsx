"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PropertyForm from "@/components/admin/PropertyForm";

function NewListingNotice() {
  const params = useSearchParams();
  if (params.get("novo") !== "1") return null;
  return (
    <div className="max-w-4xl mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
      Anúncio criado. Agora envie as fotos no fim da página. A primeira foto vira a capa.
    </div>
  );
}

export default function EditarAnuncioPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <>
      <Suspense><NewListingNotice /></Suspense>
      <PropertyForm id={id} mode="advertiser" />
    </>
  );
}
