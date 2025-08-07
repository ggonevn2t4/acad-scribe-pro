import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ZaloChat from "@/components/ZaloChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      <TestimonialsSection />
      <PricingPlans />
      </main>
      <Footer />
      <ZaloChat />
    </div>
  );
};

export default Index;
