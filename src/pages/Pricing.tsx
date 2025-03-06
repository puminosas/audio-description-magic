
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PricingCard from '@/components/ui/PricingCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FeedbackDialog from '@/components/feedback/FeedbackDialog';

declare global {
  interface Window {
    Paddle: any;
  }
}

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize Paddle
    const loadPaddleJs = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/paddle.js';
      script.async = true;
      script.onload = initializePaddle;
      document.body.appendChild(script);
    };

    const initializePaddle = () => {
      if (window.Paddle) {
        window.Paddle.Setup({ 
          vendor: 123456, // Replace with your Paddle vendor ID
          debug: true // Set to false in production
        });
      }
    };

    loadPaddleJs();
  }, []);

  const handleCheckout = (planId: string) => {
    // Don't proceed if user is not logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in before subscribing to a plan.",
        variant: "destructive"
      });
      return;
    }

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: planId,
        email: user.email,
        successCallback: (data: any) => {
          console.log('Checkout success:', data);
          // You would typically call your API endpoint to update the user's plan
          // after successful payment verification on the server side
          toast({
            title: "Subscription Successful",
            description: "Your subscription has been activated. Refreshing your account...",
          });
          
          // In a real implementation, you would update the user's profile with the new plan
          // For now we'll just show a toast
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        }
      });
    } else {
      toast({
        title: "Payment System Unavailable",
        description: "Our payment system is currently unavailable. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const freePlanFeatures = [
    { name: '3 audio generations per day', included: true },
    { name: 'Standard quality audio', included: true },
    { name: 'Limited voice selection', included: true },
    { name: 'MP3 downloads', included: true },
    { name: 'HTML embed code', included: true },
    { name: 'API access', included: false },
    { name: 'Audio history', included: false },
  ];

  const basicPlanFeatures = [
    { name: '10 audio generations per day', included: true },
    { name: 'High quality audio', included: true },
    { name: 'Full voice selection', included: true },
    { name: 'MP3 & WAV downloads', included: true },
    { name: 'HTML embed code', included: true },
    { name: 'Audio history for 30 days', included: true },
    { name: 'API access', included: false },
  ];

  const premiumPlanFeatures = [
    { name: 'Unlimited audio generations', included: true },
    { name: 'Premium quality audio', included: true },
    { name: 'Full voice selection', included: true },
    { name: 'MP3 & WAV downloads', included: true },
    { name: 'HTML embed code', included: true },
    { name: 'Unlimited audio history', included: true },
    { name: 'API access with 1000 requests', included: true },
    { name: 'Priority support', included: true },
  ];

  const getPlanButtonText = (planType: string) => {
    if (!user) return "Sign Up";
    
    if (profile?.plan === planType) {
      return "Current Plan";
    }
    
    return "Subscribe";
  };

  const handlePlanAction = (planType: string) => {
    if (!user) {
      // Redirect to signup
      window.location.href = '/auth?signup=true';
      return;
    }
    
    if (profile?.plan === planType) {
      // Already on this plan
      toast({
        title: "Current Plan",
        description: `You're already subscribed to the ${planType} plan.`,
      });
      return;
    }
    
    // Start checkout process
    const productIds: Record<string, string> = {
      basic: billingCycle === 'monthly' ? 'basic_monthly_id' : 'basic_annual_id',
      premium: billingCycle === 'monthly' ? 'premium_monthly_id' : 'premium_annual_id'
    };
    
    // For demo purposes, we'll use placeholder IDs
    if (planType === 'free') {
      // Handle downgrade to free
      toast({
        title: "Plan Downgraded",
        description: "Your plan has been downgraded to Free.",
      });
    } else {
      handleCheckout(productIds[planType]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include high-quality audio generation.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <Tabs
            defaultValue="monthly"
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}
            className="w-full max-w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
              <TabsTrigger value="annual">
                Annual Billing
                <span className="ml-2 rounded-full bg-primary/20 px-3 py-0.5 text-xs text-primary">
                  Save 20%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {billingCycle === 'monthly' ? (
            <>
              <PricingCard
                name="Free"
                price="Free"
                description="Perfect for trying out the service."
                features={freePlanFeatures}
                buttonText={getPlanButtonText('free')}
                buttonVariant="outline"
                onSubscribe={() => handlePlanAction('free')}
                isCurrentPlan={profile?.plan === 'free'}
              />
              
              <PricingCard
                name="Basic"
                price="$19"
                description="For small businesses with moderate needs."
                features={basicPlanFeatures}
                popular={true}
                buttonText={getPlanButtonText('basic')}
                onSubscribe={() => handlePlanAction('basic')}
                isCurrentPlan={profile?.plan === 'basic'}
              />
              
              <PricingCard
                name="Premium"
                price="$49"
                description="For businesses with high-volume needs."
                features={premiumPlanFeatures}
                buttonText={getPlanButtonText('premium')}
                onSubscribe={() => handlePlanAction('premium')}
                isCurrentPlan={profile?.plan === 'premium'}
              />
            </>
          ) : (
            <>
              <PricingCard
                name="Free"
                price="Free"
                description="Perfect for trying out the service."
                features={freePlanFeatures}
                buttonText={getPlanButtonText('free')}
                buttonVariant="outline"
                onSubscribe={() => handlePlanAction('free')}
                isCurrentPlan={profile?.plan === 'free'}
              />
              
              <PricingCard
                name="Basic"
                price="$15"
                description="For small businesses with moderate needs."
                features={basicPlanFeatures}
                popular={true}
                buttonText={getPlanButtonText('basic')}
                onSubscribe={() => handlePlanAction('basic')}
                isCurrentPlan={profile?.plan === 'basic'}
              />
              
              <PricingCard
                name="Premium"
                price="$39"
                description="For businesses with high-volume needs."
                features={premiumPlanFeatures}
                buttonText={getPlanButtonText('premium')}
                onSubscribe={() => handlePlanAction('premium')}
                isCurrentPlan={profile?.plan === 'premium'}
              />
            </>
          )}
        </div>

        <div className="mt-16 glassmorphism rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">All Plans Include</h2>
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-4">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>Multiple languages support</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>Natural-sounding voices</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>HTML embed code</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>MP3 downloads</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>Easy-to-use interface</span>
            </div>
            <div className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
              <span>Free updates</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.
              </p>
            </div>
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Is there a limit to the text length?</h3>
              <p className="text-muted-foreground">
                Free and Basic plans support up to 500 words per generation. Premium allows up to 2,000 words.
              </p>
            </div>
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer custom plans for large businesses?</h3>
              <p className="text-muted-foreground">
                Yes, we offer custom enterprise plans with dedicated support. Contact our sales team for details.
              </p>
            </div>
            <div className="glassmorphism rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions about our pricing or plans?
          </p>
          <FeedbackDialog />
        </div>
      </div>
    </div>
  );
};

export default Pricing;
