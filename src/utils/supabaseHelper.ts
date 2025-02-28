
import { supabase } from '@/integrations/supabase/client';

// The issue is that our Database type in types.ts doesn't have our tables defined
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
  },
  // User roles table operations
  user_roles: {
    select: () => castTable('user_roles'),
    insert: (data: any) => castTable('user_roles').insert(data),
    delete: () => castTable('user_roles').delete(),
  },
  // Audio files table operations
  audio_files: {
    select: () => castTable('audio_files'),
    insert: (data: any) => castTable('audio_files').insert(data),
    update: (data: any) => castTable('audio_files').update(data),
    delete: () => castTable('audio_files').delete(),
  },
  // Generation counts table operations
  generation_counts: {
    select: () => castTable('generation_counts'),
    insert: (data: any) => castTable('generation_counts').insert(data),
    update: (data: any) => castTable('generation_counts').update(data),
  },
  // Audit logs table operations
  audit_logs: {
    select: () => castTable('audit_logs'),
    insert: (data: any) => castTable('audit_logs').insert(data),
  },
  // API keys table operations
  api_keys: {
    select: () => castTable('api_keys'),
    insert: (data: any) => castTable('api_keys').insert(data),
    update: (data: any) => castTable('api_keys').update(data),
    delete: () => castTable('api_keys').delete(),
  },
};
