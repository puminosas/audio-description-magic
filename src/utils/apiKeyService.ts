
import { supabaseTyped } from '@/utils/supabase/typedClient';

export const fetchUserApiKeys = async (userId: string) => {
  const { data, error } = await supabaseTyped.api_keys
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createApiKey = async (userId: string, name: string) => {
  // Generate a random API key
  const apiKey = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  
  const { data, error } = await supabaseTyped.api_keys
    .insert({
      user_id: userId,
      name: name || 'API Key',
      api_key: apiKey
    })
    .select('id, api_key, name, created_at')
    .single();
  
  return { data, error };
};

export const deleteApiKey = async (keyId: string) => {
  const { error } = await supabaseTyped.api_keys
    .delete()
    .eq('id', keyId);
  
  return { error };
};
