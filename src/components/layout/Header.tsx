"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getWhatsAppUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Comprar", href: "/imoveis?tipo=venda" },
  { label: "Alugar", href: "/imoveis?tipo=aluguel" },
  { label: "Imóveis", href: "/imoveis" },
  { label: "Venda seu imóvel", href: "/venda-seu-imovel" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b",
        scrolled ? "border-neutral-200/70 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]" : "border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo variant="dark" height={48} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/80 p-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-neutral-600 hover:bg-white hover:text-neutral-950 hover:shadow-sm transition-all font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark px-5 py-2.5"
            >
              <MessageCircle size={16} />
              Fale conosco
            </a>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="flex items-center justify-center w-9 h-9 text-neutral-900"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden absolute left-0 right-0 top-full bg-white border-t border-neutral-100 shadow-lg overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-neutral-600 font-medium py-4 border-b border-neutral-100 hover:text-neutral-900 tracking-wide transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="py-4">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark w-full py-4"
            >
              <MessageCircle size={18} />
              Fale conosco pelo WhatsApp
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
