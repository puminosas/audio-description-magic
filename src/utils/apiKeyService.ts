
import { supabaseTyped } from '@/utils/supabase/typedClient';
import { supabase } from '@/integrations/supabase/client';

export const fetchUserApiKeys = async (userId: string) => {
  try {
    const { data, error } = await supabaseTyped.custom
      .from('api_keys')
      .select()
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
    
    // First check if user exists and has correct plan
    // Call the Edge Function directly
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/get-user-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
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
    
    // Special case for admin email
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'a.mackeliunas@gmail.com') {
      console.log('Admin email detected, bypassing plan check');
      // Continue with API key creation for admin email
    }
    
    // Insert the new API key
    const { data, error } = await supabaseTyped.custom
      .from('api_keys')
      .insert({
        user_id: userId,
        name: name || 'API Key',
        api_key: apiKey
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
    const { error } = await supabaseTyped.custom
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
