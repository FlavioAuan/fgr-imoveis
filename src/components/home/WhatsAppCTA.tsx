import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/config";
import { getSiteContact } from "@/lib/siteSettings";

export async function WhatsAppCTA() {
  const { whatsapp } = await getSiteContact();
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-[28px] bg-neutral-900 px-8 py-12 sm:px-12 lg:py-14">
          <div className="max-w-xl">
            <p className="eyebrow-dark mb-4">Fale com a gente</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Não achou o que procurava?
            </h2>
            <p className="text-neutral-300 leading-relaxed">
              Conte pelo WhatsApp o que você precisa. A gente procura junto
              com você e avisa assim que surgir o imóvel certo.
            </p>
          </div>
          <a
            href={getWhatsAppUrl(undefined, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn shrink-0 self-start lg:self-auto px-8 py-4 bg-[#25D366] text-white hover:bg-[#20bd5a] focus-visible:ring-[#25D366]"
          >
            <MessageCircle size={20} />
            Chamar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
