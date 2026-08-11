"use client";

import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AtSign,
} from "lucide-react";
import { siteConfig, getWhatsAppUrl } from "@/lib/config";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const contactItems = [
  {
    icon: Phone,
    label: "Telefone",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\D/g, "")}`,
    external: false,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: siteConfig.phone,
    href: getWhatsAppUrl(),
    external: true,
  },
  {
    icon: Mail,
    label: "E-mail",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    external: false,
  },
  {
    icon: AtSign,
    label: "Instagram",
    value: siteConfig.instagram,
    href: siteConfig.instagramUrl,
    external: true,
  },
  {
    icon: MapPin,
    label: "Endereço",
    value: `${siteConfig.address.street}, ${siteConfig.address.city} — ${siteConfig.address.state}`,
    href: null,
    external: false,
  },
];

const hours = [
  siteConfig.businessHours.weekdays,
  siteConfig.businessHours.saturday,
  siteConfig.businessHours.sunday,
];

export default function ContatoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-neutral-950 text-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
            Estamos aqui para ajudar
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Contato</h1>
          <p className="text-neutral-300 text-lg max-w-xl mx-auto">
            Fale com nossa equipe. Estamos prontos para ajudar você a encontrar
            o imóvel ideal.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                Informações de contato
              </h2>

              <div className="space-y-5 mb-10">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-neutral-100 flex items-center justify-center shrink-0">
                      <item.icon size={17} className="text-neutral-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium mb-0.5">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={
                            item.external ? "noopener noreferrer" : undefined
                          }
                          className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-neutral-700">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <div className="border-t border-neutral-100 pt-8">
                <div className="flex items-center gap-3 mb-5">
                  <Clock size={17} className="text-neutral-500" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
                    Horário de atendimento
                  </h3>
                </div>
                <ul className="space-y-2">
                  {hours.map((h) => (
                    <li key={h} className="text-sm text-neutral-600">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-10">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] text-white font-semibold px-8 py-4 hover:bg-[#20bd5a] transition-colors text-sm"
                >
                  <MessageCircle size={18} />
                  Iniciar conversa no WhatsApp
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">
                Envie uma mensagem
              </h2>

              {submitted ? (
                <div className="text-center py-16">
                  <CheckCircle2
                    size={52}
                    className="text-neutral-900 mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Mensagem enviada!
                  </h3>
                  <p className="text-neutral-500">
                    Responderemos o mais breve possível.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Nome"
                      name="name"
                      id="cnt-name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                    <Input
                      label="WhatsApp"
                      name="whatsapp"
                      id="cnt-whatsapp"
                      type="tel"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <Input
                    label="E-mail"
                    name="email"
                    id="cnt-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                  <Input
                    label="Assunto"
                    name="subject"
                    id="cnt-subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Do que se trata?"
                  />
                  <Textarea
                    label="Mensagem"
                    name="message"
                    id="cnt-message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Escreva sua mensagem..."
                    rows={5}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-neutral-900 text-white font-semibold py-4 hover:bg-neutral-700 transition-colors text-sm tracking-wide mt-2"
                  >
                    Enviar mensagem
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
