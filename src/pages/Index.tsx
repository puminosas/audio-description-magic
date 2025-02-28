
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Headphones, 
  Globe2, 
  Mic2, 
  Code, 
  Download, 
  CreditCard, 
  Play, 
  FastForward,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/ui/FeatureCard';

const Index = () => {
  // Add scroll reveal animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.reveal').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="hero-gradient absolute top-0 left-0 right-0 bottom-0 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight reveal">
              Automated Audio Descriptions for E-Commerce
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto reveal">
              Transform your product descriptions into engaging audio content. Enhance accessibility and boost sales with natural-sounding voices in multiple languages.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 reveal">
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

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto reveal">
              Our platform makes it easy to create professional audio descriptions for your products in just a few simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glassmorphism p-6 rounded-xl text-center reveal">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Input Product Details</h3>
              <p className="text-muted-foreground">
                Enter your product description, select your preferred language and voice.
              </p>
            </div>

            <div className="glassmorphism p-6 rounded-xl text-center reveal">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Generate Audio</h3>
              <p className="text-muted-foreground">
                Our AI processes your text and converts it into natural-sounding speech.
              </p>
            </div>

            <div className="glassmorphism p-6 rounded-xl text-center reveal">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Use & Share</h3>
              <p className="text-muted-foreground">
                Download the audio file or use our embed code to add it to your product pages.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12 reveal">
            <Button size="lg" asChild>
              <Link to="/generator">Try It Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal">Key Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto reveal">
              Everything you need to enhance your product descriptions with high-quality audio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="reveal">
              <FeatureCard 
                icon={Headphones}
                title="Audio Generation"
                description="Generate high-quality, natural-sounding audio descriptions for your products."
              />
            </div>
            <div className="reveal">
              <FeatureCard 
                icon={Globe2}
                title="Multilingual Support"
                description="Create audio descriptions in multiple languages to reach global customers."
              />
            </div>
            <div className="reveal">
              <FeatureCard 
                icon={Mic2}
                title="Voice Selection"
                description="Choose from a variety of voices to match your brand identity and target audience."
              />
            </div>
            <div className="reveal">
              <FeatureCard 
                icon={Code}
                title="HTML Integration"
                description="Easily embed audio players into your product pages with our simple code snippets."
              />
            </div>
            <div className="reveal">
              <FeatureCard 
                icon={Download}
                title="Downloadable Files"
                description="Download your audio files in MP3 format for use across your marketing channels."
              />
            </div>
            <div className="reveal">
              <FeatureCard 
                icon={CreditCard}
                title="Flexible Plans"
                description="Choose from free and paid plans to suit your business needs and budget."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 reveal">Ready to Enhance Your Product Descriptions?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto reveal">
              Start generating audio descriptions today and take your e-commerce experience to the next level.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal">
              <Button size="lg" asChild>
                <Link to="/generator">
                  Get Started <Play size={18} className="ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
