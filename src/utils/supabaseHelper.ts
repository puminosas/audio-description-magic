
// Export types from typedClient
export type { 
  Database,
  SupabaseTypedClient
} from './supabase/typedClient';

// Export the instance
export { supabaseTyped } from './supabase/typedClient';

// Export specific functions from userRoles
export { 
  assignAdminRole, 
  removeAdminRole, 
  updateUserPlan 
} from './supabase/userRoles';
