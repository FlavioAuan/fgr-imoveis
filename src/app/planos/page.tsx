import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, MessageSquare, Search } from "lucide-react";
import { PlanCards } from "@/components/marketplace/PlanCards";
import { listActivePlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Anuncie seus imóveis",
  description:
    "Planos para imobiliárias, corretores e proprietários anunciarem imóveis em São João da Boa Vista e região no portal FGR Imóveis.",
};

const reasons = [
  { icon: Search, title: "Quem procura imóvel na região", text: "O portal reúne imóveis de várias imobiliárias em uma busca só." },
  { icon: MessageSquare, title: "Contato direto com você", text: "Leads e WhatsApp vão para o anunciante. Sem intermediário." },
  { icon: BarChart3, title: "Painel próprio", text: "Cadastre, edite e acompanhe os contatos de cada anúncio." },
];

export default async function PlanosPage() {
  const plans = await listActivePlans();

  return (
    <div className="min-h-screen bg-neutral-50 pt-20 lg:pt-24">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <p className="eyebrow bg-white mb-4">Para imobiliárias e corretores</p>
        <h1 className="text-3xl lg:text-5xl font-bold text-neutral-900">Anuncie no portal FGR Imóveis</h1>
        <p className="mt-4 text-neutral-500 max-w-2xl mx-auto">
          Escolha um plano, cadastre seus imóveis e receba os contatos direto no seu painel.
          Pagamento mensal no cartão, sem fidelidade.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PlanCards
          plans={plans}
          action={plan => (
            <Link
              href={`/anunciante/cadastro?plano=${plan.id}`}
              className={`btn w-full ${plan.highlighted ? "btn-dark" : "btn-outline"}`}
            >
              {plan.price === 0 ? "Começar grátis" : "Assinar"}
            </Link>
          )}
        />
        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta? <Link href="/anunciante/login" className="font-semibold text-neutral-900 underline underline-offset-2">Entrar no painel</Link>
        </p>
      </section>

      <section className="bg-white border-t border-neutral-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
          {reasons.map(r => (
            <div key={r.title}>
              <r.icon size={22} className="text-neutral-900" />
              <h2 className="mt-3 text-lg font-bold text-neutral-900">{r.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
