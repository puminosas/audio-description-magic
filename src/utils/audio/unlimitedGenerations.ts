
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if unlimited generations for all users is enabled
 */
export async function isUnlimitedGenerationsEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('unlimitedgenerationsforall')
      .single();
    
    if (error) {
      console.error('Error checking unlimited generations setting:', error);
      return false;
    }
    
    return data?.unlimitedgenerationsforall || false;
  } catch (error) {
    console.error('Failed to fetch unlimited generations setting:', error);
    return false;
  }
}
