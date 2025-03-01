
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseTyped } from '@/utils/supabaseHelper';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateGuestSessionId, convertTemporaryFilesToUserFiles } from '@/utils/fileStorageService';

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevAuthState, setPrevAuthState] = useState<'authenticated' | 'unauthenticated' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Handle redirect from email confirmation
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // The user has been redirected back from email confirmation
        // Refresh the session
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            setUser(session.user);
            fetchUserProfile(session.user.id);
            toast({
              title: "Email confirmed",
              description: "Your email has been confirmed successfully.",
            });
          }
        });
      }
    };

    // Call it once on mount to handle initial URL
    handleHashChange();

    // Add listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPrevAuthState(session ? 'authenticated' : 'unauthenticated');
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        
        // Convert any temporary files for this newly authenticated user
        const sessionId = getOrCreateGuestSessionId();
        convertTemporaryFilesToUserFiles(session.user.id, sessionId)
          .then(success => {
            if (success) {
              console.log('Temporary files converted to user files on init');
            }
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        
        const currentAuthState = session ? 'authenticated' : 'unauthenticated';
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(session ? true : false);
        
        // Handle newly authenticated user
        if (prevAuthState === 'unauthenticated' && currentAuthState === 'authenticated' && session?.user) {
          // Convert any temporary files for this newly authenticated user
          const sessionId = getOrCreateGuestSessionId();
          convertTemporaryFilesToUserFiles(session.user.id, sessionId)
            .then(success => {
              if (success) {
                console.log('Temporary files converted to user files on login');
              }
            });
        }
        
        setPrevAuthState(currentAuthState);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [prevAuthState]);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Use the supabaseTyped helper for profiles
      const { data: profileData, error: profileError } = await supabaseTyped.profiles.select()
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If profile doesn't exist, create one with admin plan for the specified user
        if (profileError.code === 'PGRST116') {
          if (userId) {
            const { data: newProfile, error: insertError } = await supabaseTyped.profiles.insert({
              id: userId,
              plan: 'admin',
              daily_limit: 9999,
              remaining_generations: 9999
            }).select().single();
              
            if (insertError) throw insertError;
            setProfile(newProfile);
          }
        } else {
          throw profileError;
        }
      } else {
        setProfile(profileData);
      }

      // Fetch user roles to check if admin
      const { data: roleData, error: roleError } = await supabaseTyped.user_roles.select()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (roleError) throw roleError;

      setIsAdmin(roleData && roleData.length > 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
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

  const signUp = (email: string, password: string, metadata?: any) => {
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

  const resetPassword = (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
    signOut,
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
