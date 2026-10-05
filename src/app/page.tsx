export const dynamic = "force-dynamic";

import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { TrustSection } from "@/components/home/TrustSection";
import { Categories } from "@/components/home/Categories";
import { SellProperty } from "@/components/home/SellProperty";
import { WhatsAppCTA } from "@/components/home/WhatsAppCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProperties />
      <TrustSection />
      <SellProperty />
      <WhatsAppCTA />
    </>
  );
}
