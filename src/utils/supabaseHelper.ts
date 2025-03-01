
import { supabase } from '@/integrations/supabase/client';

// The issue is that our Database type in types.ts doesn't have all our tables defined
// This helper works around TypeScript type checking to allow us to use tables
// that aren't yet defined in the types.ts file
function castTable(tableName: string) {
  // We need to use the any type to bypass TypeScript's type checking
  // This allows us to work with tables before they're defined in the types.ts file
  return (supabase as any).from(tableName);
}

// This helper provides a way to interact with Supabase tables
// without modifying the original types.ts file
export const supabaseTyped = {
  // Profiles table operations
  profiles: {
    select: () => castTable('profiles'),
    update: (data: any) => castTable('profiles').update(data),
    insert: (data: any) => castTable('profiles').insert(data),
    delete: () => castTable('profiles').delete(),
    eq: (column: string, value: any) => castTable('profiles').select().eq(column, value),
    single: () => castTable('profiles').select().single(),
    maybeSingle: () => castTable('profiles').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('profiles').select().count(options),
  },
  // User roles table operations
  user_roles: {
    select: () => castTable('user_roles'),
    insert: (data: any) => castTable('user_roles').insert(data),
    delete: () => castTable('user_roles').delete(),
    eq: (column: string, value: any) => castTable('user_roles').select().eq(column, value),
    single: () => castTable('user_roles').select().single(),
    maybeSingle: () => castTable('user_roles').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('user_roles').select().count(options),
  },
  // Audio files table operations
  audio_files: {
    select: () => castTable('audio_files'),
    insert: (data: any) => castTable('audio_files').insert(data),
    update: (data: any) => castTable('audio_files').update(data),
    delete: () => castTable('audio_files').delete(),
    eq: (column: string, value: any) => castTable('audio_files').select().eq(column, value),
    single: () => castTable('audio_files').select().single(),
    maybeSingle: () => castTable('audio_files').select().maybeSingle(),
    range: (from: number, to: number) => castTable('audio_files').select().range(from, to),
    order: (column: string, options: { ascending?: boolean }) => 
      castTable('audio_files').select().order(column, options),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('audio_files').select().count(options),
  },
  // User files table operations
  user_files: {
    select: () => castTable('user_files'),
    insert: (data: any) => castTable('user_files').insert(data),
    update: (data: any) => castTable('user_files').update(data),
    delete: () => castTable('user_files').delete(),
    eq: (column: string, value: any) => castTable('user_files').select().eq(column, value),
    single: () => castTable('user_files').select().single(),
    maybeSingle: () => castTable('user_files').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('user_files').select().count(options),
  },
  // Generation counts table operations
  generation_counts: {
    select: () => castTable('generation_counts'),
    insert: (data: any) => castTable('generation_counts').insert(data),
    update: (data: any) => castTable('generation_counts').update(data),
    eq: (column: string, value: any) => castTable('generation_counts').select().eq(column, value),
    single: () => castTable('generation_counts').select().single(),
    maybeSingle: () => castTable('generation_counts').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('generation_counts').select().count(options),
  },
  // Audit logs table operations
  audit_logs: {
    select: () => castTable('audit_logs'),
    insert: (data: any) => castTable('audit_logs').insert(data),
    eq: (column: string, value: any) => castTable('audit_logs').select().eq(column, value),
    single: () => castTable('audit_logs').select().single(),
    maybeSingle: () => castTable('audit_logs').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('audit_logs').select().count(options),
  },
  // API keys table operations
  api_keys: {
    select: () => castTable('api_keys'),
    insert: (data: any) => castTable('api_keys').insert(data),
    update: (data: any) => castTable('api_keys').update(data),
    delete: () => castTable('api_keys').delete(),
    eq: (column: string, value: any) => castTable('api_keys').select().eq(column, value),
    single: () => castTable('api_keys').select().single(),
    maybeSingle: () => castTable('api_keys').select().maybeSingle(),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('api_keys').select().count(options),
  },
  // Feedback table operations
  feedback: {
    select: () => castTable('feedback'),
    insert: (data: any) => castTable('feedback').insert(data),
    update: (data: any) => castTable('feedback').update(data),
    delete: () => castTable('feedback').delete(),
    eq: (column: string, value: any) => castTable('feedback').select().eq(column, value),
    single: () => castTable('feedback').select().single(),
    maybeSingle: () => castTable('feedback').select().maybeSingle(),
    range: (from: number, to: number) => castTable('feedback').select().range(from, to),
    order: (column: string, options: { ascending?: boolean }) => 
      castTable('feedback').select().order(column, options),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('feedback').select().count(options),
  },
  
  // Generic functions for any table (helpful for dynamic operations)
  custom: {
    from: (tableName: string) => castTable(tableName),
  }
};

// Helper function to check if a user has admin role
export async function checkIsAdmin(userId: string) {
  try {
    const { data, error } = await supabaseTyped.user_roles
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) throw error;
    return !!data; // Convert to boolean - true if admin role exists
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

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

// Helper to update a user's plan
export async function updateUserPlan(userId: string, plan: 'free' | 'basic' | 'premium' | 'admin') {
  try {
    const { error } = await supabaseTyped.profiles.update({
      plan,
      updated_at: new Date().toISOString()
    }).eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user plan:', error);
    return false;
  }
}

// Helper to assign admin role to a user
export async function assignAdminRole(userId: string) {
  try {
    // First check if role already exists
    const { data: existingRole } = await supabaseTyped.user_roles
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (existingRole) {
      // Role already exists, no need to add it again
      return true;
    }
    
    // Insert the admin role
    const { error } = await supabaseTyped.user_roles.insert({
      user_id: userId,
      role: 'admin'
    });
    
    if (error) throw error;
    
    // Also update the user's plan to 'admin' in the profiles table
    await updateUserPlan(userId, 'admin');
    
    return true;
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return false;
  }
}

// Helper to remove admin role from a user
export async function removeAdminRole(userId: string) {
  try {
    const { error } = await supabaseTyped.user_roles
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
}

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
