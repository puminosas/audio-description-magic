
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // System settings
  const [freeLimit, setFreeLimit] = useState('3');
  const [basicLimit, setBasicLimit] = useState('10');
  const [premiumLimit, setPremiumLimit] = useState('100');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  
  // Email settings
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [welcomeEmailTemplate, setWelcomeEmailTemplate] = useState('Welcome to AudioDesc!\n\nThank you for creating an account. We\'re excited to help you create amazing audio descriptions for your products.');
  const [apiKeyEmailTemplate, setApiKeyEmailTemplate] = useState('Your new API key has been generated.\n\nAPI Key: {{apiKey}}\n\nKeep this key secure and do not share it with others.');
  
  // Security settings
  const [inactivityDays, setInactivityDays] = useState('90');
  const [autoDisableInactive, setAutoDisableInactive] = useState(false);
  const [logRetentionDays, setLogRetentionDays] = useState('30');
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure the core settings for your AudioDesc application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="free-limit">Free Plan Daily Limit</Label>
              <Input
                id="free-limit"
                type="number"
                value={freeLimit}
                onChange={(e) => setFreeLimit(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Maximum daily generations for free users
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="basic-limit">Basic Plan Daily Limit</Label>
              <Input
                id="basic-limit"
                type="number"
                value={basicLimit}
                onChange={(e) => setBasicLimit(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Maximum daily generations for basic users
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="premium-limit">Premium Plan Daily Limit</Label>
              <Input
                id="premium-limit"
                type="number"
                value={premiumLimit}
                onChange={(e) => setPremiumLimit(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Maximum daily generations for premium users
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="default-language">Default Language</Label>
            <Select 
              value={defaultLanguage} 
              onValueChange={setDefaultLanguage}
            >
              <SelectTrigger id="default-language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Default language for new audio generations
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Configure the email templates used for system notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="email-enabled" 
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
            <Label htmlFor="email-enabled">Enable email notifications</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcome-email">Welcome Email Template</Label>
            <Textarea
              id="welcome-email"
              value={welcomeEmailTemplate}
              onChange={(e) => setWelcomeEmailTemplate(e.target.value)}
              rows={5}
              disabled={!emailEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key-email">API Key Email Template</Label>
            <Textarea
              id="api-key-email"
              value={apiKeyEmailTemplate}
              onChange={(e) => setApiKeyEmailTemplate(e.target.value)}
              rows={5}
              disabled={!emailEnabled}
            />
            <p className="text-sm text-muted-foreground">
              Use {{apiKey}} as a placeholder for the API key
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Security & Maintenance</CardTitle>
          <CardDescription>
            Configure security and maintenance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-disable">Auto-disable inactive users</Label>
              <p className="text-sm text-muted-foreground">
                Automatically disable users who have been inactive
              </p>
            </div>
            <Switch 
              id="auto-disable" 
              checked={autoDisableInactive}
              onCheckedChange={setAutoDisableInactive}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inactivity-days">Inactivity Period (days)</Label>
            <Input
              id="inactivity-days"
              type="number"
              value={inactivityDays}
              onChange={(e) => setInactivityDays(e.target.value)}
              disabled={!autoDisableInactive}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="log-retention">Audit Log Retention (days)</Label>
            <Input
              id="log-retention"
              type="number"
              value={logRetentionDays}
              onChange={(e) => setLogRetentionDays(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Number of days to keep audit logs before automatic deletion
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
