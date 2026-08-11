"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Eye, EyeOff } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: number;
  last_login: string | null;
  created_at: string;
}

interface NewUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const roleConfig: Record<string, { label: string; cls: string }> = {
  super_admin: { label: "Super Admin", cls: "bg-neutral-900 text-white" },
  admin:       { label: "Admin",       cls: "bg-neutral-700 text-white" },
  corretor:    { label: "Corretor",    cls: "bg-neutral-200 text-neutral-600" },
};

function formatDate(iso: string | null) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<NewUserForm>({
    name: "", email: "", password: "", role: "corretor",
  });

  const set = (key: keyof NewUserForm, value: string) =>
    setForm(p => ({ ...p, [key]: value }));

  function fetchUsers() {
    setLoading(true);
    fetch("/api/users")
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(); }, []);

  function openModal() {
    setForm({ name: "", email: "", password: "", role: "corretor" });
    setError("");
    setSuccess(false);
    setShowPass(false);
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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        fetchUsers();
        setTimeout(() => {
          closeModal();
        }, 1200);
      } else {
        const err = await res.json();
        setError(err.error || "Erro ao criar usuário");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuários</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          <Plus size={16} />
          Novo usuário
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                <div className="w-9 h-9 bg-neutral-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-neutral-200 w-1/4" />
                  <div className="h-3 bg-neutral-100 w-1/3" />
                </div>
                <div className="h-6 bg-neutral-100 w-20" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <p className="text-sm">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Usuário</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">E-mail</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Perfil</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Último acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map(user => {
                  const rc = roleConfig[user.role] ?? { label: user.role, cls: "bg-neutral-100 text-neutral-600" };
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-neutral-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-neutral-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${rc.cls}`}>
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${
                          user.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                        {formatDate(user.last_login)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New user modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Modal */}
          <div className="relative bg-white w-full max-w-md shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="font-bold text-neutral-900">Novo usuário</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
                  Usuário criado com sucesso!
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="usuario@empresa.com.br"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} required minLength={6}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Perfil</label>
                <select
                  value={form.role}
                  onChange={e => set("role", e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors bg-white appearance-none"
                >
                  <option value="corretor">Corretor</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
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
                  {saving ? "Criando..." : "Criar usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
