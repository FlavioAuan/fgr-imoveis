"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputCls = "w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

const kinds = [
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "corretor", label: "Corretor autônomo" },
  { value: "proprietario", label: "Proprietário" },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get("plano");
  const [form, setForm] = useState({
    kind: "imobiliaria", name: "", company_name: "", document: "", creci: "",
    phone: "", email: "", password: "", acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) => setForm(p => ({ ...p, [key]: value }));
  const isCompany = form.kind === "imobiliaria";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/anunciante/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erro ao criar conta"); return; }
      router.push(planId ? `/anunciante/plano?plano=${planId}` : "/anunciante/plano");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-neutral-200 bg-white p-8 space-y-5">
      <Field label="Você é">
        <div className="grid grid-cols-3 gap-2">
          {kinds.map(k => (
            <button
              key={k.value} type="button" onClick={() => set("kind", k.value)}
              className={`rounded-xl border px-2 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                form.kind === k.value ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome *">
          <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} autoComplete="name" />
        </Field>
        {isCompany && (
          <Field label="Nome da imobiliária">
            <input value={form.company_name} onChange={e => set("company_name", e.target.value)} className={inputCls} autoComplete="organization" />
          </Field>
        )}
        <Field label={isCompany ? "CNPJ" : "CPF"}>
          <input value={form.document} onChange={e => set("document", e.target.value)} className={inputCls} inputMode="numeric" />
        </Field>
        {form.kind !== "proprietario" && (
          <Field label="CRECI">
            <input value={form.creci} onChange={e => set("creci", e.target.value)} className={inputCls} placeholder="Ex: 12345-J" />
          </Field>
        )}
        <Field label="WhatsApp">
          <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} placeholder="(19) 99999-9999" autoComplete="tel" />
        </Field>
      </div>

      <Field label="E-mail *">
        <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} autoComplete="email" />
      </Field>
      <Field label="Senha *" hint="Mínimo de 8 caracteres">
        <input type="password" required minLength={8} value={form.password} onChange={e => set("password", e.target.value)} className={inputCls} autoComplete="new-password" />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-neutral-600 cursor-pointer select-none">
        <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms", e.target.checked)} className="mt-0.5 w-4 h-4 accent-neutral-900" />
        Declaro que tenho autorização para anunciar os imóveis que cadastrar e aceito os termos de uso do portal.
      </label>

      {error && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-dark w-full">
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Criando conta..." : "Criar conta e escolher plano"}
      </button>
    </form>
  );
}

export default function AnuncianteCadastroPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-28 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 text-center">Crie sua conta de anunciante</h1>
        <p className="text-sm text-neutral-500 text-center mt-2 mb-8">Leva um minuto. Depois você escolhe o plano e paga com cartão.</p>
        <Suspense>
          <SignupForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta? <Link href="/anunciante/login" className="font-semibold text-neutral-900 underline underline-offset-2">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
