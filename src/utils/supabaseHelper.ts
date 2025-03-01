
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
  },
  // User roles table operations
  user_roles: {
    select: () => castTable('user_roles'),
    insert: (data: any) => castTable('user_roles').insert(data),
    delete: () => castTable('user_roles').delete(),
    eq: (column: string, value: any) => castTable('user_roles').select().eq(column, value),
    single: () => castTable('user_roles').select().single(),
  },
  // Audio files table operations
  audio_files: {
    select: () => castTable('audio_files'),
    insert: (data: any) => castTable('audio_files').insert(data),
    update: (data: any) => castTable('audio_files').update(data),
    delete: () => castTable('audio_files').delete(),
    eq: (column: string, value: any) => castTable('audio_files').select().eq(column, value),
    single: () => castTable('audio_files').select().single(),
  },
  // User files table operations
  user_files: {
    select: () => castTable('user_files'),
    insert: (data: any) => castTable('user_files').insert(data),
    update: (data: any) => castTable('user_files').update(data),
    delete: () => castTable('user_files').delete(),
    eq: (column: string, value: any) => castTable('user_files').select().eq(column, value),
    single: () => castTable('user_files').select().single(),
  },
  // Generation counts table operations
  generation_counts: {
    select: () => castTable('generation_counts'),
    insert: (data: any) => castTable('generation_counts').insert(data),
    update: (data: any) => castTable('generation_counts').update(data),
    eq: (column: string, value: any) => castTable('generation_counts').select().eq(column, value),
    single: () => castTable('generation_counts').select().single(),
  },
  // Audit logs table operations
  audit_logs: {
    select: () => castTable('audit_logs'),
    insert: (data: any) => castTable('audit_logs').insert(data),
    eq: (column: string, value: any) => castTable('audit_logs').select().eq(column, value),
    single: () => castTable('audit_logs').select().single(),
  },
  // API keys table operations
  api_keys: {
    select: () => castTable('api_keys'),
    insert: (data: any) => castTable('api_keys').insert(data),
    update: (data: any) => castTable('api_keys').update(data),
    delete: () => castTable('api_keys').delete(),
    eq: (column: string, value: any) => castTable('api_keys').select().eq(column, value),
    single: () => castTable('api_keys').select().single(),
  },
  // Feedback table operations
  feedback: {
    select: () => castTable('feedback'),
    insert: (data: any) => castTable('feedback').insert(data),
    update: (data: any) => castTable('feedback').update(data),
    delete: () => castTable('feedback').delete(),
    eq: (column: string, value: any) => castTable('feedback').select().eq(column, value),
    single: () => castTable('feedback').select().single(),
  },
};
