"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/leads", label: "Leads do site" },
  { href: "/admin/leads/mercado", label: "Imóveis do mercado" },
];

// Abas da área de Leads: contatos que chegam pelo site e prospecção nas imobiliárias da cidade
export function LeadsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 border-b border-neutral-200">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
            pathname === tab.href ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
