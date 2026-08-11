"use client";

import { useState } from "react";
import { CheckCircle2, Building2, Camera, FileText, Handshake } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const steps = [
  {
    icon: Building2,
    title: "Avaliação",
    description:
      "Nossa equipe avalia seu imóvel com base no mercado atual para definir o preço justo.",
  },
  {
    icon: Camera,
    title: "Divulgação",
    description:
      "Fotografias profissionais e publicação em canais estratégicos para alcançar os compradores certos.",
  },
  {
    icon: FileText,
    title: "Negociação",
    description:
      "Intermediamos a negociação com transparência e cuidado, protegendo seus interesses.",
  },
  {
    icon: Handshake,
    title: "Fechamento",
    description:
      "Cuidamos de toda a documentação para garantir uma transação segura e tranquila.",
  },
];

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

export default function VendaSeuImovelPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    propertyType: "",
    city: "",
    neighborhood: "",
    price: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-neutral-950/65" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-5">
            Para proprietários
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Seu imóvel merece ser{" "}
            <span className="italic font-normal">apresentado</span>
            <br />
            da melhor forma.
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            A FGR Imóveis conecta seu imóvel às pessoas certas — com
            profissionalismo, alcance e dedicação.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
              Simples e transparente
            </p>
            <h2 className="text-3xl font-bold text-neutral-900">
              Como funciona o processo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 border border-neutral-200 flex items-center justify-center shrink-0">
                    <step.icon size={18} className="text-neutral-700" />
                  </div>
                  <span className="text-4xl font-bold text-neutral-100">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-neutral-400 mb-4">
              Primeiro passo
            </p>
            <h2 className="text-3xl font-bold text-neutral-900">
              Quero anunciar meu imóvel
            </h2>
            <p className="text-neutral-500 mt-3">
              Preencha o formulário e nossa equipe entrará em contato para dar
              continuidade.
            </p>
          </div>

          <div className="bg-white border border-neutral-100 p-8">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle2 size={52} className="text-neutral-900 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Solicitação recebida!
                </h3>
                <p className="text-neutral-500">
                  Nossa equipe analisará as informações e entrará em contato em
                  breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Nome completo"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                  />
                  <Input
                    label="WhatsApp"
                    name="whatsapp"
                    id="whatsapp"
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
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
                <Select
                  label="Tipo do imóvel"
                  name="propertyType"
                  id="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  options={propertyTypeOptions}
                  placeholder="Selecione o tipo"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Cidade"
                    name="city"
                    id="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Cidade do imóvel"
                    required
                  />
                  <Input
                    label="Bairro"
                    name="neighborhood"
                    id="neighborhood"
                    value={form.neighborhood}
                    onChange={handleChange}
                    placeholder="Bairro"
                  />
                </div>
                <Input
                  label="Valor pretendido (R$)"
                  name="price"
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ex: 500000"
                />
                <Textarea
                  label="Mensagem"
                  name="message"
                  id="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre o imóvel (opcional)"
                  rows={4}
                />
                <button
                  type="submit"
                  className="w-full bg-neutral-900 text-white font-semibold py-4 hover:bg-neutral-700 transition-colors text-sm tracking-wide mt-2"
                >
                  Quero anunciar meu imóvel
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
