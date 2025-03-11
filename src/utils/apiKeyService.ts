
import { supabaseTyped } from '@/utils/supabase/typedClient';
import { supabase } from '@/integrations/supabase/client';

export const fetchUserApiKeys = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, api_key, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return { data: null, error };
  }
};

export const createApiKey = async (userId: string, name: string) => {
  try {
    // Generate a random API key
    const apiKey = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    
    // Check for admin email first to avoid unnecessary Edge Function calls
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'a.mackeliunas@gmail.com') {
      console.log('Admin email detected, bypassing plan check');
      // Skip Edge Function call for admin users
    } else {
      // For non-admin users, check plan via direct query first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        // Only call Edge Function as fallback if direct query fails
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token || ''}`
          },
          body: JSON.stringify({ user_id: userId })
        });
        
        if (!response.ok) {
          throw new Error('Failed to verify user plan');
        }
        
        const profile = await response.json();
        
        // Check if the user has the appropriate plan
        if (profile && (profile.plan !== 'premium' && profile.plan !== 'admin')) {
          throw new Error('Your current plan does not include API access');
        }
      } else if (profileData && profileData.plan !== 'premium' && profileData.plan !== 'admin') {
        throw new Error('Your current plan does not include API access');
      }
    }
    
    // Insert the new API key
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        name: name || 'API Key',
        api_key: apiKey,
        is_active: true
      })
      .select('id, api_key, name, created_at')
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating API key:', error);
    return { data: null, error };
  }
};

export const deleteApiKey = async (keyId: string) => {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return { error };
  }
};
