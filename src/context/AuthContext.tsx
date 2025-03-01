
import { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { signIn, signInWithGoogle, signUp, resetPassword, signOut } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null; // User profile with plan and role details
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: {
      user: User | null;
      session: Session | null;
    } | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{
    error: any | null;
    data: {
      user: User | null;
      session: Session | null;
    } | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
  resetPassword: (email: string) => Promise<{ error: any | null; data: any | null; }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, user, profile, isAdmin, loading, setProfile, setIsAdmin } = useAuthState();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
    setIsAdmin(false);
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    signIn,
    signInWithGoogle,
    signUp,
    signOut: handleSignOut,
    loading,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
