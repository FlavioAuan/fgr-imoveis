import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
  height?: number;
  linkToHome?: boolean;
}

// Dimensões reais do arquivo: 1536 × 1024 (proporção 3:2)
const LOGO_NATURAL_WIDTH = 1536;
const LOGO_NATURAL_HEIGHT = 1024;

export function Logo({
  variant = "dark",
  className,
  height = 48,
  linkToHome = true,
}: LogoProps) {
  const logoSrc =
    variant === "light" ? "/images/logo-white.png" : "/images/logo.png";

  const content = (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoSrc}
        alt="FGR Imóveis"
        width={LOGO_NATURAL_WIDTH}
        height={LOGO_NATURAL_HEIGHT}
        style={{ height: `${height}px`, width: "auto" }}
        className="object-contain"
        priority
      />
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" aria-label="FGR Imóveis - Página inicial">
        {content}
      </Link>
    );
  }

  return content;
}
