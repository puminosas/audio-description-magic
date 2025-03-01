
import { supabaseTyped } from './typedClient';

// Helper to get feedback statistics
export async function getFeedbackStats() {
  try {
    const { count: total } = await supabaseTyped.feedback
      .count({ exact: true });
    
    const { count: newCount } = await supabaseTyped.feedback
      .eq('status', 'new')
      .count({ exact: true });
    
    const { count: resolvedCount } = await supabaseTyped.feedback
      .eq('status', 'resolved')
      .count({ exact: true });
    
    return {
      total: total || 0,
      new: newCount || 0,
      resolved: resolvedCount || 0
    };
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return { total: 0, new: 0, resolved: 0 };
  }
}
