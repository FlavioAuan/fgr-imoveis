"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const propertyTypeOptions = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "cobertura", label: "Cobertura" },
  { value: "studio", label: "Studio" },
  { value: "terreno", label: "Terreno" },
  { value: "comercial", label: "Comercial" },
  { value: "condominio", label: "Condomínio" },
  { value: "outro", label: "Outro" },
];

export function SellProperty() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    propertyType: "",
    city: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aqui integrará com API/backend futuramente
    setSubmitted(true);
  }

  return (
    <>
      {/* Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-neutral-950 text-white">
        <div className="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="eyebrow mb-4">Para proprietários</p>
            <h2 className="text-3xl lg:text-5xl font-bold mb-5">
              Quer vender seu imóvel?
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-10">
              Conte com a FGR Imóveis para apresentar seu imóvel às pessoas
              certas. Nossa equipe de especialistas irá avaliar, divulgar e
              negociar com profissionalismo e dedicação.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-light px-9 py-4"
            >
              Quero vender meu imóvel
              <span className="btn-icon bg-neutral-950/10"><ArrowRight size={14} /></span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Formulário para venda de imóvel"
        >
          <div
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={() => !submitted && setModalOpen(false)}
          />
          <div className="relative z-10 bg-white w-full rounded-t-3xl sm:max-w-lg sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                Quero vender meu imóvel
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label="Fechar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="text-neutral-900 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-neutral-900 mb-2">
                    Recebemos seu contato!
                  </h4>
                  <p className="text-neutral-500 text-sm">
                    Em breve nossa equipe entrará em contato com você.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setModalOpen(false);
                    }}
                    className="mt-6 text-sm text-neutral-900 border-b border-neutral-900 pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Nome"
                    name="name"
                    id="sell-name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                  />
                  <Input
                    label="WhatsApp"
                    name="whatsapp"
                    id="sell-whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    required
                  />
                  <Input
                    label="E-mail"
                    name="email"
                    id="sell-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                  />
                  <Select
                    label="Tipo de imóvel"
                    name="propertyType"
                    id="sell-type"
                    value={form.propertyType}
                    onChange={handleChange}
                    options={propertyTypeOptions}
                    placeholder="Selecione o tipo"
                    required
                  />
                  <Input
                    label="Cidade"
                    name="city"
                    id="sell-city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Cidade do imóvel"
                    required
                  />
                  <Textarea
                    label="Mensagem (opcional)"
                    name="message"
                    id="sell-message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Informações adicionais sobre seu imóvel"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="btn btn-dark w-full py-4 mt-2"
                  >
                    Enviar solicitação
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
