"use client";

import { useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { getPropertyWhatsAppUrl } from "@/lib/config";

interface PropertyContactFormProps {
  propertyTitle: string;
  propertyCode: string;
}

export function PropertyContactForm({
  propertyTitle,
  propertyCode,
}: PropertyContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Integração com API futura
    setSubmitted(true);
  }

  const waUrl = getPropertyWhatsAppUrl(propertyTitle, propertyCode);

  return (
    <div className="border border-neutral-100 p-6">
      <h3 className="text-base font-bold text-neutral-900 mb-1">
        Tenho interesse neste imóvel
      </h3>
      <p className="text-xs text-neutral-500 mb-5">
        Preencha o formulário e entraremos em contato em breve.
      </p>

      {/* WhatsApp button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-3.5 hover:bg-[#20bd5a] transition-colors text-sm mb-5"
      >
        <MessageCircle size={18} />
        Falar no WhatsApp
      </a>

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
            className="w-full bg-neutral-900 text-white font-semibold py-3.5 hover:bg-neutral-700 transition-colors text-sm mt-1"
          >
            Enviar mensagem
          </button>
        </form>
      )}
    </div>
  );
}
