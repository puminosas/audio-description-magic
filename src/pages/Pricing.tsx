
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PricingCard from '@/components/ui/PricingCard';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

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
            className="w-fit"
          >
            <TabsList className="grid w-[400px] grid-cols-2">
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

        <div className="grid md:grid-cols-3 gap-8">
          <TabsContent value="monthly" className="mt-0 w-full">
            <div className="grid md:grid-cols-3 gap-8 w-full">
              <PricingCard
                name="Free"
                price="Free"
                description="Perfect for trying out the service."
                features={freePlanFeatures}
                buttonText="Get Started"
                buttonVariant="outline"
              />
              
              <PricingCard
                name="Basic"
                price="$19"
                description="For small businesses with moderate needs."
                features={basicPlanFeatures}
                popular={true}
              />
              
              <PricingCard
                name="Premium"
                price="$49"
                description="For businesses with high-volume needs."
                features={premiumPlanFeatures}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="annual" className="mt-0 w-full">
            <div className="grid md:grid-cols-3 gap-8 w-full">
              <PricingCard
                name="Free"
                price="Free"
                description="Perfect for trying out the service."
                features={freePlanFeatures}
                buttonText="Get Started"
                buttonVariant="outline"
              />
              
              <PricingCard
                name="Basic"
                price="$15"
                description="For small businesses with moderate needs."
                features={basicPlanFeatures}
                popular={true}
              />
              
              <PricingCard
                name="Premium"
                price="$39"
                description="For businesses with high-volume needs."
                features={premiumPlanFeatures}
              />
            </div>
          </TabsContent>
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
      </div>
    </div>
  );
};

export default Pricing;
