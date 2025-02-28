
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 reveal matrix-text">How It Works</h2>
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
  );
};

export default HowItWorksSection;
