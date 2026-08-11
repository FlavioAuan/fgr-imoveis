"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao entrar"); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo variant="light" height={52} linkToHome={false} />
          </div>
          <p className="text-neutral-400 text-sm">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-8 space-y-5">
          <div>
            <label className="text-xs font-semibold text-neutral-400 tracking-widest uppercase block mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors"
              placeholder="admin@fgrimoveis.com.br"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 tracking-widest uppercase block mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition-colors pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-neutral-900 font-semibold py-3.5 text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <Lock size={16} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-600 mt-6">
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}
