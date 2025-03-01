
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  
  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }
};

export const signUp = (email: string, password: string, metadata?: any) => {
  const currentOrigin = window.location.origin;
  console.log("Signup with redirect to:", `${currentOrigin}/auth`);
  
  return supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${currentOrigin}/auth`,
    }
  });
};

export const resetPassword = (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?reset=true`,
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getSession = async () => {
  return supabase.auth.getSession();
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
