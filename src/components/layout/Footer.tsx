import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { Logo } from "@/components/ui/Logo";
import { siteConfig, getWhatsAppUrl } from "@/lib/config";

const quickLinks = [
  { label: "Comprar", href: "/imoveis?tipo=venda" },
  { label: "Alugar", href: "/imoveis?tipo=aluguel" },
  { label: "Venda seu imóvel", href: "/venda-seu-imovel" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo variant="light" height={48} className="mb-5" />
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mt-4">
              A FGR Imóveis conecta pessoas a imóveis que transformam vidas.
              Atuamos com ética, transparência e dedicação para oferecer a
              melhor experiência no mercado imobiliário.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-800 bg-white/5 hover:border-white hover:bg-white hover:text-neutral-950 text-neutral-400 transition-all"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-800 bg-white/5 hover:border-white hover:bg-white hover:text-neutral-950 text-neutral-400 transition-all"
              >
                <InstagramIcon width={18} height={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-mono text-[11px] font-medium tracking-[0.25em] uppercase text-neutral-500 mb-6">
              Links rápidos
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-[11px] font-medium tracking-[0.25em] uppercase text-neutral-500 mb-6">
              Contato
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MessageCircle size={16} className="mt-0.5 shrink-0" />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>
                  {siteConfig.address.street},{" "}
                  {siteConfig.address.city} — {siteConfig.address.state}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} FGR Imóveis. Todos os direitos
            reservados.
          </p>
          <a
            href="https://auansistemas.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <span className="text-xs text-neutral-500">Desenvolvido por Auan Sistemas - Inteligentes.</span>
            <Image
              src="/images/auansistemas.png"
              alt="Auan Sistemas"
              width={60}
              height={60}
              className="object-contain mix-blend-screen"
              unoptimized
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
