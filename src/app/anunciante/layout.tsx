"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CreditCard, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { AdvertiserContext, AdvertiserData, statusBadge } from "@/components/marketplace/AdvertiserContext";
import { cn } from "@/lib/utils";

const PUBLIC_PAGES = ["/anunciante/login", "/anunciante/cadastro"];

const tabs = [
  { label: "Painel", href: "/anunciante", icon: LayoutDashboard, exact: true },
  { label: "Meus anúncios", href: "/anunciante/imoveis", icon: Building2 },
  { label: "Contatos", href: "/anunciante/leads", icon: MessageSquare },
  { label: "Plano e pagamento", href: "/anunciante/plano", icon: CreditCard },
];

export default function AnuncianteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PAGES.includes(pathname);
  const [data, setData] = useState<AdvertiserData | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/anunciante/me", { cache: "no-store" });
    if (!res.ok) {
      router.replace(`/anunciante/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    setData(await res.json());
  }, [pathname, router]);

  useEffect(() => {
    if (!isPublic) reload();
  }, [isPublic, reload]);

  if (isPublic) return <>{children}</>;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const badge = statusBadge(data.account.subscription_status);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  async function logout() {
    await fetch("/api/anunciante/logout", { method: "POST" });
    router.push("/anunciante/login");
  }

  return (
    <AdvertiserContext.Provider value={{ data, reload }}>
      <div className="min-h-screen bg-neutral-50 pt-16 lg:pt-20">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Painel do anunciante</p>
                <h1 className="text-xl font-bold text-neutral-900 truncate">
                  {data.account.company_name || data.account.name}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", badge.cls)}>
                  {data.plan ? `${data.plan.name} · ${badge.label}` : badge.label}
                </span>
                <button onClick={logout} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-red-600">
                  <LogOut size={15} /> Sair
                </button>
              </div>
            </div>
            <nav className="mt-5 -mb-px flex gap-1 overflow-x-auto">
              {tabs.map(tab => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                    isActive(tab.href, tab.exact)
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </div>
    </AdvertiserContext.Provider>
  );
}
