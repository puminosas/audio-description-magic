
import { supabase } from '@/integrations/supabase/client';

// This helper provides a type-safe way to interact with Supabase tables
// without modifying the original types.ts file
export const supabaseTyped = {
  // Profiles table operations
  profiles: {
    select: () => supabase.from('profiles'),
    update: (data: any) => supabase.from('profiles').update(data),
    insert: (data: any) => supabase.from('profiles').insert(data),
    delete: () => supabase.from('profiles').delete(),
  },
  // User roles table operations
  user_roles: {
    select: () => supabase.from('user_roles'),
    insert: (data: any) => supabase.from('user_roles').insert(data),
    delete: () => supabase.from('user_roles').delete(),
  },
  // Audio files table operations
  audio_files: {
    select: () => supabase.from('audio_files'),
    insert: (data: any) => supabase.from('audio_files').insert(data),
    update: (data: any) => supabase.from('audio_files').update(data),
    delete: () => supabase.from('audio_files').delete(),
  },
  // Generation counts table operations
  generation_counts: {
    select: () => supabase.from('generation_counts'),
    insert: (data: any) => supabase.from('generation_counts').insert(data),
    update: (data: any) => supabase.from('generation_counts').update(data),
  },
  // Audit logs table operations
  audit_logs: {
    select: () => supabase.from('audit_logs'),
    insert: (data: any) => supabase.from('audit_logs').insert(data),
  },
  // API keys table operations
  api_keys: {
    select: () => supabase.from('api_keys'),
    insert: (data: any) => supabase.from('api_keys').insert(data),
    update: (data: any) => supabase.from('api_keys').update(data),
    delete: () => supabase.from('api_keys').delete(),
  },
};
