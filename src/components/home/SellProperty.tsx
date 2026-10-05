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

const sellBenefits = [
  "Avaliação gratuita e sem compromisso",
  "Fotos e divulgação nos principais portais",
  "Acompanhamento até a assinatura da escritura",
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
      <section className="py-20 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 overflow-hidden rounded-[28px] bg-white ring-1 ring-neutral-200/70">
            <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
              <p className="eyebrow mb-4 self-start">Para proprietários</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight mb-5">
                Vamos encontrar o comprador certo para o seu imóvel
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-8">
                Avaliamos seu imóvel com base no mercado local, cuidamos das
                fotos e da divulgação e levamos até você quem realmente está
                procurando. Você acompanha tudo de perto.
              </p>
              <ul className="space-y-3 mb-10">
                {sellBenefits.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                    <CheckCircle2 size={18} className="text-neutral-900 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-dark self-start px-8 py-4"
              >
                Quero anunciar meu imóvel
                <ArrowRight size={16} />
              </button>
            </div>
            <div
              className="min-h-[280px] lg:min-h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80')",
              }}
              role="img"
              aria-label="Casa com jardim e varanda"
            />
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Formulário para anunciar imóvel"
        >
          <div
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={() => !submitted && setModalOpen(false)}
          />
          <div className="relative z-10 bg-white w-full rounded-t-3xl sm:max-w-lg sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-neutral-100">
              <h3 className="text-lg font-bold text-neutral-900">
                Quero anunciar meu imóvel
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
                    Recebemos seus dados!
                  </h4>
                  <p className="text-neutral-500 text-sm">
                    Nossa equipe vai entrar em contato em breve para conversar sobre o seu imóvel.
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
                    placeholder="(19) 99999-9999"
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
                    placeholder="Conte um pouco sobre o imóvel: bairro, tamanho, diferenciais..."
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="btn btn-dark w-full py-4 mt-2"
                  >
                    Enviar meus dados
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
