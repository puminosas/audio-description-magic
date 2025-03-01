
// Re-export everything from the individual files for backward compatibility
export { supabaseTyped } from './supabase/typedClient';
export { checkIsAdmin, assignAdminRole, removeAdminRole, updateUserPlan, updateUserRemainingGenerations } from './supabase/userRoles';
export { createAuditLog } from './supabase/auditLogs';
export { getFeedbackStats } from './supabase/feedbackUtils';
