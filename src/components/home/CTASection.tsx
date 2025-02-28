
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 reveal matrix-text">Ready to Enhance Your Product Descriptions?</h2>
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
  );
};

export default CTASection;
