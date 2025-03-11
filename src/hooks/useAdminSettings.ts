
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  chatGptModel: string;
  chatGptTemperature: number;
  chatGptPrompt: string;
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
    unlimitedGenerationsForAll: false,
    chatGptModel: 'gpt-3.5-turbo',
    chatGptTemperature: 0.7,
    chatGptPrompt: 'Create an engaging product description in {language} for an online electronics store. Focus on the most important features and benefits that appeal to customers of all ages. Write in clear, accessible language that\'s easy to understand when read aloud or converted to audio. Structure the description logically, avoiding unnecessary symbols or characters. Keep the length suitable for a 60-second audio clip. Match the language to the user\'s selection ({language}) and consider the voice name "{voice_name}" for the audio output.'
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
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
          unlimitedGenerationsForAll: data.unlimitedgenerationsforall,
          chatGptModel: data.chatgptmodel || 'gpt-3.5-turbo',
          chatGptTemperature: data.chatgpttemperature || 0.7,
          chatGptPrompt: data.chatgptprompt || settings.chatGptPrompt
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  }
  
  const handleSaveSettings = async () => {
    if (!isAdmin) {
      toast({
        title: "Permission Denied",
        description: "You need administrator privileges to modify settings.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Saving settings as admin:', {
        freegenerationslimit: settings.freeGenerationsLimit,
        basicgenerationslimit: settings.basicGenerationsLimit,
        premiumgenerationslimit: settings.premiumGenerationsLimit,
        allowguestgeneration: settings.allowGuestGeneration,
        enablenewuserregistration: settings.enableNewUserRegistration,
        requireemailverification: settings.requireEmailVerification,
        storageretentiondays: settings.storageRetentionDays,
        enablefeedback: settings.enableFeedback,
        hidepricingfeatures: settings.hidePricingFeatures,
        unlimitedgenerationsforall: settings.unlimitedGenerationsForAll,
        chatgptmodel: settings.chatGptModel,
        chatgpttemperature: settings.chatGptTemperature,
        chatgptprompt: settings.chatGptPrompt
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
          unlimitedgenerationsforall: settings.unlimitedGenerationsForAll,
          chatgptmodel: settings.chatGptModel,
          chatgpttemperature: settings.chatGptTemperature,
          chatgptprompt: settings.chatGptPrompt
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
