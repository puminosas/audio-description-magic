
import { Link } from 'react-router-dom';
import { FastForward, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="hero-gradient absolute top-0 left-0 right-0 bottom-0 -z-10"></div>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight reveal matrix-text opacity-100">
            Automated Audio Descriptions for E-Commerce
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto reveal opacity-100">
            Transform your product descriptions into engaging audio content. Enhance accessibility and boost sales with natural-sounding voices in multiple languages.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 reveal opacity-100">
            <Button size="lg" asChild>
              <Link to="/generator" className="gap-1">
                Try Now <FastForward size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">
                How It Works <ChevronRight size={18} />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating waves animation */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-32 overflow-hidden -z-10">
        <div className="flex justify-center">
          <div className="relative w-full max-w-6xl">
            <div className="sound-wave absolute left-10 bottom-10 scale-150 animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="bar animate-pulse-sound-1"></div>
              <div className="bar animate-pulse-sound-2"></div>
              <div className="bar animate-pulse-sound-3"></div>
            </div>
            <div className="sound-wave absolute left-1/3 bottom-4 scale-100 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="bar animate-pulse-sound-3"></div>
              <div className="bar animate-pulse-sound-2"></div>
              <div className="bar animate-pulse-sound-4"></div>
              <div className="bar animate-pulse-sound-1"></div>
            </div>
            <div className="sound-wave absolute right-1/4 bottom-12 scale-125 animate-float" style={{ animationDelay: '0.8s' }}>
              <div className="bar animate-pulse-sound-2"></div>
              <div className="bar animate-pulse-sound-4"></div>
              <div className="bar animate-pulse-sound-1"></div>
            </div>
            <div className="sound-wave absolute right-20 bottom-8 scale-110 animate-float" style={{ animationDelay: '0.3s' }}>
              <div className="bar animate-pulse-sound-4"></div>
              <div className="bar animate-pulse-sound-2"></div>
              <div className="bar animate-pulse-sound-1"></div>
              <div className="bar animate-pulse-sound-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
