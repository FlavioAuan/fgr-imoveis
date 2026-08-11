"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

interface User { name: string; email: string; role: string; }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); else router.push("/admin/login"); })
      .catch(() => router.push("/admin/login"));
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!user) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar user={user} />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col">
            <AdminSidebar user={user} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-4 bg-neutral-950 border-b border-neutral-800 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm">FGR Admin</span>
        </div>

        <main className={cn("flex-1 overflow-y-auto p-6 lg:p-8")}>
          {children}
        </main>
      </div>
    </div>
  );
}
