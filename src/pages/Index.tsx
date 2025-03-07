
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import CTASection from '@/components/home/CTASection';
import AudioDescriptionDemo from '@/components/ecommerce/AudioDescriptionDemo';

const Index = () => {
  return (
    <div className="bg-background min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <div className="py-12 bg-muted/50">
        <AudioDescriptionDemo />
      </div>
      <CTASection />
    </div>
  );
};

export default Index;
