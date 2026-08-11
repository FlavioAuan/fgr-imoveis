"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, MessageSquare,
  Settings, LogOut, ChevronRight, Star, UserCog,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Imóveis", href: "/admin/imoveis", icon: Building2 },
  { label: "Leads", href: "/admin/leads", icon: MessageSquare },
  { label: "Corretores", href: "/admin/corretores", icon: Star },
  { label: "Usuários", href: "/admin/usuarios", icon: UserCog },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

interface Props {
  user: { name: string; role: string };
  onClose?: () => void;
}

export function AdminSidebar({ user, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 w-60">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-800">
        <Logo variant="light" height={40} />
        <p className="text-xs text-neutral-500 mt-2 tracking-wider">PAINEL ADMIN</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-none group",
              isActive(item.href, item.exact)
                ? "bg-white text-neutral-900"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <item.icon size={17} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive(item.href, item.exact) && <ChevronRight size={14} />}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-neutral-700 flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-red-400 transition-colors w-full py-1"
        >
          <LogOut size={14} />
          Sair do painel
        </button>
      </div>
    </aside>
  );
}
