
import { useTheme } from '@/context/ThemeContext';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import CTASection from '@/components/home/CTASection';
import MatrixEffect from '@/components/home/MatrixEffect';
import ScrollReveal from '@/components/home/ScrollReveal';

const Index = () => {
  const { theme } = useTheme();
  
  return (
    <>
      {/* Add scroll reveal animation */}
      <ScrollReveal />
      
      {/* Add audio waveform effect for both themes */}
      <MatrixEffect />
      
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
};

export default Index;
