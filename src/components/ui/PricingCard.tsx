
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  isCurrentPlan?: boolean;
  onSubscribe?: () => void;
}

const PricingCard = ({
  name,
  price,
  description,
  features,
  popular = false,
  buttonText = 'Get Started',
  buttonVariant = 'default',
  isCurrentPlan = false,
  onSubscribe
}: PricingCardProps) => {
  return (
    <div className={`
      h-full flex flex-col glassmorphism rounded-xl overflow-hidden
      ${popular ? 'scale-105 shadow-xl border-2 border-primary' : 'shadow-md border border-border'}
      transition-all duration-300 hover:shadow-lg
    `}>
      {popular && (
        <div className="py-1.5 px-4 bg-primary text-primary-foreground text-center text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Free' && <span className="text-muted-foreground">/month</span>}
        </div>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground'}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 border-t border-border mt-auto">
        <Button 
          variant={buttonVariant}
          className={`w-full ${popular ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
          disabled={isCurrentPlan}
          onClick={onSubscribe}
        >
          {isCurrentPlan ? 'Current Plan' : buttonText}
        </Button>
        {isCurrentPlan && (
          <p className="text-center text-sm mt-2 text-green-500">You are on this plan</p>
        )}
      </div>
    </div>
  );
};

export default PricingCard;
