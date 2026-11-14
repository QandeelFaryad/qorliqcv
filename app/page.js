import HeroSection from "@/components/HeroSection";
import PartnerSection from "@/components/PartnerSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import LayoutsSection from "@/components/LayoutsSection";
import DifferenceSection from "@/components/DifferenceSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PartnerSection />
      <HowItWorksSection />
      <FeaturesSection />
      <LayoutsSection />
      <DifferenceSection />
      <FAQSection/>
      <FinalCTA/>
    </main>
  );
}