
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppSettings } from '@/hooks/useAdminSettings';

interface PricingSettingsCardProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const PricingSettingsCard = ({ settings, setSettings }: PricingSettingsCardProps) => {
  return (
    <Card className="border-primary/10 bg-primary/5">
      <CardHeader>
        <CardTitle>Pricing & Monetization</CardTitle>
        <CardDescription>
          Control pricing-related features and payment functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hidePricing">Hide Pricing Page & Features</Label>
            <p className="text-sm text-muted-foreground">
              Hides the pricing tab and all payment-related features
            </p>
          </div>
          <Switch
            id="hidePricing"
            checked={settings.hidePricingFeatures}
            onCheckedChange={(checked) => setSettings({ ...settings, hidePricingFeatures: checked })}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="unlimitedGenerations">Unlimited Generations for All Users</Label>
            <p className="text-sm text-muted-foreground">
              Enable unlimited generation for all registered users regardless of plan
            </p>
          </div>
          <Switch
            id="unlimitedGenerations"
            checked={settings.unlimitedGenerationsForAll}
            onCheckedChange={(checked) => setSettings({ ...settings, unlimitedGenerationsForAll: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSettingsCard;
