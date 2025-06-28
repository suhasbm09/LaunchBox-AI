import { HeroSection } from '@/components/sections/HeroSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { AboutCreatorSection } from '@/components/sections/AboutCreatorSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AboutCreatorSection />
    </>
  );
}