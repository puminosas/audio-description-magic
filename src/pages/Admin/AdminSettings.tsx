
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    freeGenerationsLimit: 5,
    basicGenerationsLimit: 50,
    premiumGenerationsLimit: 500,
    allowGuestGeneration: true,
    enableNewUserRegistration: true,
    requireEmailVerification: false,
    storageRetentionDays: 30,
    enableFeedback: true
  });
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // For now, this is a mock save since we haven't implemented a settings table yet
    setTimeout(() => {
      toast({
        title: 'Settings Saved',
        description: 'Your system settings have been updated successfully.',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="h-full w-full flex flex-col p-4 space-y-6 overflow-auto">
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
        
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
