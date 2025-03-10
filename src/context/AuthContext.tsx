import { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { signIn, signInWithGoogle, signUp, resetPassword, signOut } from '@/services/authService';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
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
  setIsAdmin: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, user, profile, isAdmin, loading, setProfile, setIsAdmin } = useAuthState();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfile(null);
      setIsAdmin(false);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
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
    resetPassword,
    setIsAdmin
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
