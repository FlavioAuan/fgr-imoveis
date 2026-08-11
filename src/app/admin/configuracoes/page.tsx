"use client";

import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";

interface Settings {
  id?: number;
  site_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  youtube: string;
  address: string;
  city: string;
  state: string;
  about_text: string;
  footer_text: string;
}

const defaultSettings: Settings = {
  site_name: "", phone: "", whatsapp: "", email: "",
  instagram: "", facebook: "", youtube: "",
  address: "", city: "", state: "", about_text: "", footer_text: "",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-2 border-b border-neutral-200">
      <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">{children}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors bg-white";

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSettings({
            site_name:   data.site_name   ?? "",
            phone:       data.phone       ?? "",
            whatsapp:    data.whatsapp    ?? "",
            email:       data.email       ?? "",
            instagram:   data.instagram   ?? "",
            facebook:    data.facebook    ?? "",
            youtube:     data.youtube     ?? "",
            address:     data.address     ?? "",
            city:        data.city        ?? "",
            state:       data.state       ?? "",
            about_text:  data.about_text  ?? "",
            footer_text: data.footer_text ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: string) =>
    setSettings(p => ({ ...p, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const err = await res.json();
        setError(err.error || "Erro ao salvar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-1">Informações gerais do site e da empresa</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* SECTION: Geral */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Geral</SectionTitle>
        <Field label="Nome do site">
          <input
            type="text"
            value={settings.site_name}
            onChange={e => set("site_name", e.target.value)}
            placeholder="FGR Imóveis"
            className={inputCls}
          />
        </Field>
      </div>

      {/* SECTION: Contato */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Contato</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Telefone">
            <input
              type="tel"
              value={settings.phone}
              onChange={e => set("phone", e.target.value)}
              placeholder="(11) 9999-9999"
              className={inputCls}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={settings.whatsapp}
              onChange={e => set("whatsapp", e.target.value)}
              placeholder="5511999999999 (com DDI)"
              className={inputCls}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="E-mail">
              <input
                type="email"
                value={settings.email}
                onChange={e => set("email", e.target.value)}
                placeholder="contato@empresa.com.br"
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* SECTION: Redes sociais */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Redes sociais</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Instagram">
            <input
              type="text"
              value={settings.instagram}
              onChange={e => set("instagram", e.target.value)}
              placeholder="@usuario"
              className={inputCls}
            />
          </Field>
          <Field label="Facebook">
            <input
              type="text"
              value={settings.facebook}
              onChange={e => set("facebook", e.target.value)}
              placeholder="https://facebook.com/pagina"
              className={inputCls}
            />
          </Field>
          <Field label="YouTube">
            <input
              type="text"
              value={settings.youtube}
              onChange={e => set("youtube", e.target.value)}
              placeholder="https://youtube.com/channel/..."
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* SECTION: Endereço */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Endereço</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Field label="Endereço completo">
              <input
                type="text"
                value={settings.address}
                onChange={e => set("address", e.target.value)}
                placeholder="Rua, número, bairro"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Cidade">
            <input
              type="text"
              value={settings.city}
              onChange={e => set("city", e.target.value)}
              placeholder="São Paulo"
              className={inputCls}
            />
          </Field>
          <Field label="Estado">
            <input
              type="text"
              maxLength={2}
              value={settings.state}
              onChange={e => set("state", e.target.value.toUpperCase())}
              placeholder="SP"
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* SECTION: Textos */}
      <div className="bg-white border border-neutral-200 p-6 space-y-5">
        <SectionTitle>Textos do site</SectionTitle>
        <Field label="Sobre a empresa">
          <textarea
            rows={5}
            value={settings.about_text}
            onChange={e => set("about_text", e.target.value)}
            placeholder="Texto da seção 'Sobre nós'..."
            className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-y"
          />
        </Field>
        <Field label="Texto do rodapé">
          <textarea
            rows={3}
            value={settings.footer_text}
            onChange={e => set("footer_text", e.target.value)}
            placeholder="Texto exibido no rodapé do site..."
            className="w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors resize-y"
          />
        </Field>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
        {success && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <Check size={16} />
            Configurações salvas!
          </span>
        )}
      </div>
    </form>
  );
}
