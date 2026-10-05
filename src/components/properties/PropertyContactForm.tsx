"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { siteConfig } from "@/lib/config";
import { useWhatsAppUrl } from "@/components/providers/SiteContactProvider";
import { saveLead } from "@/lib/leads";

interface PropertyContactFormProps {
  propertyTitle: string;
  propertyCode: string;
  propertyId: number;
  propertySlug: string;
}

const waInputClass =
  "w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors";

export function PropertyContactForm({
  propertyTitle,
  propertyId,
  propertySlug,
}: PropertyContactFormProps) {
  const getWhatsAppUrl = useWhatsAppUrl();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    message: "",
  });

  const [showWaForm, setShowWaForm] = useState(false);
  const [waForm, setWaForm] = useState({ name: "", whatsapp: "" });
  const [waLoading, setWaLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleWaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setWaForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await saveLead({
      name: form.name,
      phone: form.whatsapp,
      email: form.email || undefined,
      message: form.message || undefined,
      property_id: propertyId,
      source: "formulario_contato",
    });
    setLoading(false);
    setSubmitted(true);
  }

  async function handleWaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWaLoading(true);
    const propertyUrl = `${siteConfig.url}/imoveis/${propertySlug}`;
    const message = `Olá! Tenho interesse no imóvel:\n*${propertyTitle}*\n${propertyUrl}\n\nNome: ${waForm.name}\nWhatsApp: ${waForm.whatsapp}`;
    await saveLead({
      name: waForm.name,
      phone: waForm.whatsapp,
      message,
      property_id: propertyId,
      source: "whatsapp_imovel",
    });
    window.open(getWhatsAppUrl(message), "_blank");
    setShowWaForm(false);
    setWaForm({ name: "", whatsapp: "" });
    setWaLoading(false);
  }

  return (
    <div className="border border-neutral-100 p-6">
      <h3 className="text-base font-bold text-neutral-900 mb-1">
        Tenho interesse neste imóvel
      </h3>
      <p className="text-xs text-neutral-500 mb-5">
        Preencha o formulário e entraremos em contato em breve.
      </p>

      {/* WhatsApp section */}
      {!showWaForm ? (
        <button
          onClick={() => setShowWaForm(true)}
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-3.5 hover:bg-[#20bd5a] transition-colors text-sm mb-5"
        >
          <MessageCircle size={18} />
          Falar no WhatsApp
        </button>
      ) : (
        <div className="border border-green-200 bg-green-50 p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
              <MessageCircle size={15} className="text-[#25D366]" />
              Falar no WhatsApp
            </p>
            <button
              onClick={() => setShowWaForm(false)}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleWaSubmit} className="flex flex-col gap-2">
            <input
              name="name"
              value={waForm.name}
              onChange={handleWaChange}
              placeholder="Seu nome *"
              required
              className={waInputClass}
            />
            <input
              name="whatsapp"
              type="tel"
              value={waForm.whatsapp}
              onChange={handleWaChange}
              placeholder="Seu WhatsApp *"
              required
              className={waInputClass}
            />
            <button
              type="submit"
              disabled={waLoading}
              className="w-full bg-[#25D366] text-white font-semibold py-3 text-sm hover:bg-[#20bd5a] transition-colors disabled:opacity-60 mt-1"
            >
              {waLoading ? "Aguarde..." : "Enviar e abrir WhatsApp"}
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">ou envie uma mensagem</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      {submitted ? (
        <div className="text-center py-6">
          <CheckCircle2 size={40} className="text-neutral-900 mx-auto mb-3" />
          <p className="font-semibold text-neutral-900 mb-1">Mensagem enviada!</p>
          <p className="text-xs text-neutral-500">
            Nossa equipe responderá em breve.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            name="name"
            id="contact-name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome"
            required
          />
          <Input
            name="whatsapp"
            id="contact-whatsapp"
            type="tel"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="Seu WhatsApp"
            required
          />
          <Input
            name="email"
            id="contact-email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Seu e-mail"
            required
          />
          <Textarea
            name="message"
            id="contact-message"
            value={form.message}
            onChange={handleChange}
            placeholder="Mensagem (opcional)"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white font-semibold py-3.5 hover:bg-neutral-700 transition-colors text-sm mt-1 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      )}
    </div>
  );
}
