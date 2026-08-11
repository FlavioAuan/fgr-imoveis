"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Phone, Mail, Award } from "lucide-react";

interface Agent {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  creci: string | null;
  bio: string | null;
  photo: string | null;
  active: number;
}

interface AgentForm {
  name: string;
  phone: string;
  email: string;
  creci: string;
  bio: string;
}

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

export default function CorretoresPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<AgentForm>({
    name: "", phone: "", email: "", creci: "", bio: "",
  });

  const set = (key: keyof AgentForm, value: string) =>
    setForm(p => ({ ...p, [key]: value }));

  function fetchAgents() {
    setLoading(true);
    fetch("/api/agents")
      .then(r => r.json())
      .then(data => setAgents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAgents(); }, []);

  function openModal() {
    setForm({ name: "", phone: "", email: "", creci: "", bio: "" });
    setError("");
    setSuccess(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          creci: form.creci || null,
          bio: form.bio || null,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        fetchAgents();
        setTimeout(() => closeModal(), 1200);
      } else {
        const err = await res.json();
        setError(err.error || "Erro ao criar corretor");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Corretores</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {agents.length} corretor{agents.length !== 1 ? "es" : ""} cadastrado{agents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          <Plus size={16} />
          Novo corretor
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-200 p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 w-2/3" />
                  <div className="h-3 bg-neutral-100 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white border border-neutral-200 flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-neutral-400 text-sm">Nenhum corretor cadastrado.</p>
          <button
            onClick={openModal}
            className="text-sm text-neutral-900 underline underline-offset-2"
          >
            Cadastrar primeiro corretor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white border border-neutral-200 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {agent.photo ? (
                  <img src={agent.photo} alt={agent.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{agent.name}</p>
                  {agent.creci && (
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Award size={11} />
                      CRECI {agent.creci}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900 transition-colors">
                    <Phone size={12} className="shrink-0" />
                    {agent.phone}
                  </a>
                )}
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900 transition-colors truncate">
                    <Mail size={12} className="shrink-0" />
                    {agent.email}
                  </a>
                )}
              </div>

              {agent.bio && (
                <p className="text-xs text-neutral-500 line-clamp-2 border-t border-neutral-100 pt-2">
                  {agent.bio}
                </p>
              )}

              <div className="mt-auto pt-1">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${
                  agent.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {agent.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900">Novo corretor</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
                  Corretor cadastrado com sucesso!
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Nome completo"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">CRECI</label>
                  <input
                    type="text"
                    value={form.creci}
                    onChange={e => set("creci", e.target.value)}
                    placeholder="Ex: 12345-F"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="corretor@empresa.com.br"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Breve descrição sobre o corretor..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-700 border border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
