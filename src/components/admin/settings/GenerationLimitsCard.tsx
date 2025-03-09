
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AppSettings } from '@/hooks/useAdminSettings';

interface GenerationLimitsCardProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const GenerationLimitsCard = ({ settings, setSettings }: GenerationLimitsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Limits</CardTitle>
        <CardDescription>
          Configure the number of generations allowed for each plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="freeLimit">Free Plan Limit</Label>
            <Input
              id="freeLimit"
              type="number"
              value={settings.freeGenerationsLimit}
              onChange={(e) => setSettings({ ...settings, freeGenerationsLimit: parseInt(e.target.value) })}
            />
            <span className="text-xs text-muted-foreground">
              Generations per day
            </span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="basicLimit">Basic Plan Limit</Label>
            <Input
              id="basicLimit"
              type="number"
              value={settings.basicGenerationsLimit}
              onChange={(e) => setSettings({ ...settings, basicGenerationsLimit: parseInt(e.target.value) })}
            />
            <span className="text-xs text-muted-foreground">
              Generations per day
            </span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="premiumLimit">Premium Plan Limit</Label>
            <Input
              id="premiumLimit"
              type="number"
              value={settings.premiumGenerationsLimit}
              onChange={(e) => setSettings({ ...settings, premiumGenerationsLimit: parseInt(e.target.value) })}
            />
            <span className="text-xs text-muted-foreground">
              Generations per day
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationLimitsCard;
