
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppSettings } from '@/hooks/useAdminSettings';

interface SystemSettingsCardProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const SystemSettingsCard = ({ settings, setSettings }: SystemSettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure global system behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="guestGeneration">Allow Guest Generation</Label>
            <p className="text-sm text-muted-foreground">
              Allow non-logged-in users to generate audio
            </p>
          </div>
          <Switch
            id="guestGeneration"
            checked={settings.allowGuestGeneration}
            onCheckedChange={(checked) => setSettings({ ...settings, allowGuestGeneration: checked })}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="newUserRegistration">Enable New User Registration</Label>
            <p className="text-sm text-muted-foreground">
              Allow new users to register for accounts
            </p>
          </div>
          <Switch
            id="newUserRegistration"
            checked={settings.enableNewUserRegistration}
            onCheckedChange={(checked) => setSettings({ ...settings, enableNewUserRegistration: checked })}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailVerification">Require Email Verification</Label>
            <p className="text-sm text-muted-foreground">
              Require users to verify their email before using the system
            </p>
          </div>
          <Switch
            id="emailVerification"
            checked={settings.requireEmailVerification}
            onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
          />
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label htmlFor="storageRetention">Storage Retention Period (Days)</Label>
          <Input
            id="storageRetention"
            type="number"
            value={settings.storageRetentionDays}
            onChange={(e) => setSettings({ ...settings, storageRetentionDays: parseInt(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            Number of days to retain temporary files for guest users
          </p>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enableFeedback">Enable Feedback System</Label>
            <p className="text-sm text-muted-foreground">
              Allow users to submit feedback and bug reports
            </p>
          </div>
          <Switch
            id="enableFeedback"
            checked={settings.enableFeedback}
            onCheckedChange={(checked) => setSettings({ ...settings, enableFeedback: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsCard;
