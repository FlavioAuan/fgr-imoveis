"use client";

import dynamic from "next/dynamic";

// O mapa usa o Leaflet, que só funciona no navegador
export const ListingsMapClient = dynamic(() => import("./ListingsMap").then(m => m.ListingsMap), {
  ssr: false,
  loading: () => <div className="h-[min(640px,70vh)] min-h-[420px] rounded-[28px] bg-neutral-100 animate-pulse" />,
});
