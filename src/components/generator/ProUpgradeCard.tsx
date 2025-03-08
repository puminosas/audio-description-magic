import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProUpgradeCardProps {
  user: any;
  profile: any;
}

const ProUpgradeCard = ({ user, profile }: ProUpgradeCardProps) => {
  const { toast } = useToast();
  const [hidePricingFeatures, setHidePricingFeatures] = useState(false);
  
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('hidepricingfeatures')
          .single();
        
        if (!error && data) {
          setHidePricingFeatures(data.hidepricingfeatures);
        }
      } catch (error) {
        console.error('Failed to fetch app settings:', error);
      }
    }
    
    fetchSettings();
  }, []);
  
  // If hiding pricing features or user is not on free plan, don't show upgrade card
  if (hidePricingFeatures || (profile?.plan && profile.plan !== 'free')) {
    return null;
  }
  
  const handleUpgradeToPro = () => {
    // Replace with your actual Paddle Vendor ID
    const paddleVendorId = "123456"; 
    
    try {
      // Open Paddle checkout in a new tab
      const paddleCheckoutUrl = `https://checkout.paddle.com/checkout/product/YOUR_PRODUCT_ID?vendor=${paddleVendorId}&email=${encodeURIComponent(user?.email || '')}`;
      window.open(paddleCheckoutUrl, "_blank");
      
      toast({
        title: "Opening Checkout",
        description: "You're being redirected to complete your purchase",
      });
    } catch (error) {
      console.error("Error opening checkout:", error);
      toast({
        title: "Error",
        description: "Failed to open checkout. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="p-4 border border-primary/20 bg-primary/5">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="h-5 w-5 text-yellow-500" /> Upgrade to Pro
      </h3>
      <p className="text-sm mt-2 mb-4">
        Get unlimited audio descriptions, premium voices, and priority support.
      </p>
      <Button 
        onClick={handleUpgradeToPro} 
        className="w-full bg-gradient-to-r from-primary to-indigo-600"
      >
        <Crown className="mr-2 h-4 w-4" /> Upgrade Now
      </Button>
    </Card>
  );
};

export default ProUpgradeCard;
