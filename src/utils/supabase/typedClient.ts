
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Export the type for Database
export type { Database };

// Type for the typed client
export type SupabaseTypedClient = typeof supabase;

// The issue is that our Database type in types.ts doesn't have all our tables defined
// This helper works around TypeScript type checking to allow us to use tables
// that aren't yet defined in the types.ts file
function castTable(tableName: string) {
  // We need to use the any type to bypass TypeScript's type checking
  // This allows us to work with tables before they're defined in the types.ts file
  return (supabase as any).from(tableName);
}

// Helper to properly chain methods
function enhanceQuery(query: any) {
  return {
    ...query,
    // Add methods with proper chaining
    select: (...args: any[]) => enhanceQuery(query.select(...args)),
    insert: (data: any) => enhanceQuery(query.insert(data)),
    update: (data: any) => enhanceQuery(query.update(data)),
    delete: () => enhanceQuery(query.delete()),
    eq: (column: string, value: any) => enhanceQuery(query.eq(column, value)),
    order: (column: string, options: { ascending?: boolean } = {}) => 
      enhanceQuery(query.order(column, options)),
    single: () => query.single(),
    maybeSingle: () => query.maybeSingle()
  };
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
  
  // Chat sessions table operations
  chat_sessions: {
    select: () => castTable('chat_sessions'),
    insert: (data: any) => castTable('chat_sessions').insert(data),
    update: (data: any) => castTable('chat_sessions').update(data),
    delete: () => castTable('chat_sessions').delete(),
    eq: (column: string, value: any) => castTable('chat_sessions').select().eq(column, value),
    single: () => castTable('chat_sessions').select().single(),
    maybeSingle: () => castTable('chat_sessions').select().maybeSingle(),
    order: (column: string, options: { ascending?: boolean }) => 
      castTable('chat_sessions').select().order(column, options),
    count: (options: { head?: boolean, exact?: boolean } = {}) => 
      castTable('chat_sessions').select().count(options),
  },
  
  // Generic functions for any table (helpful for dynamic operations)
  custom: {
    from: (tableName: string) => enhanceQuery(castTable(tableName)),
  }
};
