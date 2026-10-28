import type { Metadata } from "next";
import Link from "next/link";
import { Camera, CreditCard, MessageCircle, UserPlus } from "lucide-react";
import { PlanCards } from "@/components/marketplace/PlanCards";
import { listActivePlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Anuncie seu imóvel",
  description:
    "Proprietário: anuncie você mesmo seu imóvel no portal FGR Imóveis, sem mensalidade, e receba os contatos dos interessados direto no seu WhatsApp.",
};

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Leva um minuto: nome, WhatsApp e e-mail.",
  },
  {
    icon: Camera,
    title: "Cadastre o imóvel",
    description: "Fotos, preço, endereço e descrição. Você mesmo preenche e edita quando quiser.",
  },
  {
    icon: CreditCard,
    title: "Pague o anúncio",
    description: "Pagamento único no cartão, sem mensalidade. O anúncio entra no ar na hora.",
  },
  {
    icon: MessageCircle,
    title: "Fale com os interessados",
    description: "Os contatos vão direto para o seu WhatsApp e para o seu painel. Sem intermediário.",
  },
];

const faq = [
  {
    q: "A FGR Imóveis vai vender meu imóvel?",
    a: "Não. A FGR Imóveis é um portal: mostra o seu anúncio para quem procura imóvel na região. A conversa, a visita e a negociação são entre você e o interessado.",
  },
  {
    q: "Quem recebe os contatos?",
    a: "Você. O botão de WhatsApp do anúncio abre a conversa com o seu número, e as mensagens do formulário aparecem no seu painel.",
  },
  {
    q: "O que acontece quando o prazo acaba?",
    a: "O anúncio sai do ar, mas continua salvo no seu painel. Você pode renovar quando quiser, e o prazo novo se soma ao que ainda falta.",
  },
  {
    q: "Sou corretor ou imobiliária. Posso usar?",
    a: "Para profissionais temos planos mensais com vários anúncios.",
  },
];

export default async function VendaSeuImovelPage() {
  const plans = await listActivePlans("proprietario");

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
          <p className="eyebrow-dark mb-5">Para proprietários</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Anuncie você mesmo o seu imóvel
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Coloque seu imóvel no portal FGR Imóveis e receba os interessados direto no seu WhatsApp.
            Sem mensalidade e sem intermediário.
          </p>
          <a href="#anuncios" className="btn btn-light mt-8 px-8 py-4">
            Ver preços do anúncio
          </a>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="eyebrow mb-4">Simples e direto</p>
            <h2 className="text-3xl font-bold text-neutral-900">Como funciona</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center shrink-0">
                    <step.icon size={18} className="text-neutral-700" />
                  </div>
                  <span className="text-4xl font-bold text-neutral-100">0{index + 1}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anúncios avulsos */}
      <section id="anuncios" className="py-20 lg:py-24 bg-neutral-50 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">Escolha seu anúncio</h2>
            <p className="text-neutral-500 mt-3">Pagamento único no cartão. Você renova só se precisar.</p>
          </div>
          <PlanCards
            plans={plans}
            action={plan => (
              <Link
                href={`/anunciante/cadastro?tipo=proprietario&plano=${plan.id}`}
                className={`btn w-full ${plan.highlighted ? "btn-dark" : "btn-outline"}`}
              >
                Anunciar meu imóvel
              </Link>
            )}
          />
          <p className="mt-6 text-center text-sm text-neutral-500">
            Já anuncia aqui?{" "}
            <Link href="/anunciante/login" className="font-semibold text-neutral-900 underline underline-offset-2">
              Entrar no painel
            </Link>
          </p>
        </div>
      </section>

      {/* Dúvidas */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-10">Dúvidas comuns</h2>
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {faq.map(item => (
              <div key={item.q} className="py-6">
                <h3 className="font-semibold text-neutral-900">{item.q}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  {item.a}
                  {item.q.startsWith("Sou corretor") && (
                    <>
                      {" "}
                      <Link href="/planos" className="font-semibold text-neutral-900 underline underline-offset-2">
                        Ver planos para profissionais
                      </Link>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
