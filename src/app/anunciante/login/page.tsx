"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputCls = "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/anunciante/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao entrar"); return; }
      const from = params.get("from");
      router.push(from && from.startsWith("/anunciante") ? from : "/anunciante");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-200 bg-white p-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-neutral-700 block mb-1.5">E-mail</label>
        <input type="email" required autoComplete="email" value={form.email}
          onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-700 block mb-1.5">Senha</label>
        <input type="password" required autoComplete="current-password" value={form.password}
          onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
      </div>
      {error && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-dark w-full">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function AnuncianteLoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-28 pb-16 px-4">
      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 text-center">Painel do anunciante</h1>
        <p className="text-sm text-neutral-500 text-center mt-2 mb-8">Entre para gerenciar seus anúncios e seu plano.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Ainda não anuncia? <Link href="/planos" className="font-semibold text-neutral-900 underline underline-offset-2">Conheça os planos</Link>
        </p>
      </div>
    </div>
  );
}
