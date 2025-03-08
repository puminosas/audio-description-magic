
import { supabase } from '@/integrations/supabase/client';

/**
 * Check user's remaining generations 
 * @param userId The user ID to check
 * @returns Object containing whether user has generations left and any error
 */
export async function checkUserRemainingGenerations(userId: string): Promise<{
  hasGenerationsLeft: boolean;
  error?: string;
}> {
  try {
    // Check user's remaining generations
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('remaining_generations')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { 
        hasGenerationsLeft: false, 
        error: 'Could not verify your remaining generations. Please try again.'
      };
    }
    
    if (profileData && profileData.remaining_generations <= 0) {
      return { 
        hasGenerationsLeft: false, 
        error: 'You have used all your daily generations. Please try again tomorrow or upgrade your plan.'
      };
    }
    
    return { hasGenerationsLeft: true };
  } catch (error) {
    console.error('Error checking user quota:', error);
    return { 
      hasGenerationsLeft: false, 
      error: 'Failed to check your generation quota. Please try again.'
    };
  }
}
