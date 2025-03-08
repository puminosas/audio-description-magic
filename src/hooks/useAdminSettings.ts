
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  freeGenerationsLimit: number;
  basicGenerationsLimit: number;
  premiumGenerationsLimit: number;
  allowGuestGeneration: boolean;
  enableNewUserRegistration: boolean;
  requireEmailVerification: boolean;
  storageRetentionDays: number;
  enableFeedback: boolean;
  hidePricingFeatures: boolean;
  unlimitedGenerationsForAll: boolean;
}

export function useAdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    freeGenerationsLimit: 5,
    basicGenerationsLimit: 50,
    premiumGenerationsLimit: 500,
    allowGuestGeneration: true,
    enableNewUserRegistration: true,
    requireEmailVerification: false,
    storageRetentionDays: 30,
    enableFeedback: true,
    hidePricingFeatures: false,
    unlimitedGenerationsForAll: false
  });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }
      
      if (data) {
        // Map database column names (lowercase) to our camelCase interface properties
        setSettings({
          freeGenerationsLimit: data.freegenerationslimit,
          basicGenerationsLimit: data.basicgenerationslimit,
          premiumGenerationsLimit: data.premiumgenerationslimit,
          allowGuestGeneration: data.allowguestgeneration,
          enableNewUserRegistration: data.enablenewuserregistration,
          requireEmailVerification: data.requireemailverification,
          storageRetentionDays: data.storageretentiondays,
          enableFeedback: data.enablefeedback,
          hidePricingFeatures: data.hidepricingfeatures,
          unlimitedGenerationsForAll: data.unlimitedgenerationsforall
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }
  
  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      console.log('Saving settings:', {
        freegenerationslimit: settings.freeGenerationsLimit,
        basicgenerationslimit: settings.basicGenerationsLimit,
        premiumgenerationslimit: settings.premiumGenerationsLimit,
        allowguestgeneration: settings.allowGuestGeneration,
        enablenewuserregistration: settings.enableNewUserRegistration,
        requireemailverification: settings.requireEmailVerification,
        storageretentiondays: settings.storageRetentionDays,
        enablefeedback: settings.enableFeedback,
        hidepricingfeatures: settings.hidePricingFeatures,
        unlimitedgenerationsforall: settings.unlimitedGenerationsForAll
      });
      
      const { error } = await supabase
        .from('app_settings')
        .upsert({ 
          id: 1,
          // Map our camelCase interface properties to database column names (lowercase)
          freegenerationslimit: settings.freeGenerationsLimit,
          basicgenerationslimit: settings.basicGenerationsLimit,
          premiumgenerationslimit: settings.premiumGenerationsLimit,
          allowguestgeneration: settings.allowGuestGeneration,
          enablenewuserregistration: settings.enableNewUserRegistration,
          requireemailverification: settings.requireEmailVerification,
          storageretentiondays: settings.storageRetentionDays,
          enablefeedback: settings.enableFeedback,
          hidepricingfeatures: settings.hidePricingFeatures,
          unlimitedgenerationsforall: settings.unlimitedGenerationsForAll
        });
      
      if (error) {
        console.error('Error during upsert:', error);
        throw error;
      }
      
      // If unlimitedGenerationsForAll is enabled, update all free user profiles
      if (settings.unlimitedGenerationsForAll) {
        console.log('Updating user profiles for unlimited generations');
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ 
            daily_limit: 999999,
            remaining_generations: 999999 
          })
          .eq('plan', 'free');
        
        if (profileUpdateError) {
          console.error('Error updating user profiles:', profileUpdateError);
          toast({
            title: 'Partial Update',
            description: 'Settings saved but user profiles could not be updated.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
      } else {
        // If disabled, reset free users back to standard limit
        console.log('Resetting user profiles to standard limits');
        const { error: resetError } = await supabase
          .from('profiles')
          .update({ 
            daily_limit: settings.freeGenerationsLimit,
            remaining_generations: settings.freeGenerationsLimit
          })
          .eq('plan', 'free');
          
        if (resetError) {
          console.error('Error resetting user profiles:', resetError);
        }
      }
      
      toast({
        title: 'Settings Saved',
        description: 'Your system settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    setSettings,
    loading,
    handleSaveSettings
  };
}
