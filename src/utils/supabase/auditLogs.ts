
import { supabaseTyped } from './typedClient';

// Helper function to create an audit log
export async function createAuditLog(userId: string, action: string, details: any) {
  try {
    const { error } = await supabaseTyped.audit_logs.insert({
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return false;
  }
}
