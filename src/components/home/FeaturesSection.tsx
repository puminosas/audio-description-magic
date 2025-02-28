
import FeatureCard from '@/components/ui/FeatureCard';
import { Headphones, Globe2, Mic2, Code, Download, CreditCard } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal matrix-text">Key Features</h2>
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
  );
};

export default FeaturesSection;
