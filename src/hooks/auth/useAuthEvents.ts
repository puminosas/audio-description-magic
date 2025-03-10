import { useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '@/services/authService';
import { handleUserAuthentication } from '@/services/profile/authProfileService';

type AuthEventsProps = {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setPrevAuthState: (state: 'authenticated' | 'unauthenticated' | null) => void;
  prevAuthState: 'authenticated' | 'unauthenticated' | null;
  setProfileLoadAttempts: (callback: (current: number) => number) => void;
  loadUserProfile: (userId: string) => Promise<any>;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
};

export const useAuthEvents = ({
  setSession,
  setUser,
  setPrevAuthState,
  prevAuthState,
  setProfileLoadAttempts,
  loadUserProfile,
  setLoading,
  setProfile,
  setIsAdmin
}: AuthEventsProps) => {
  // Initialize auth state and handle auth changes
  const initializeAuth = useCallback(async () => {
    // Get initial session
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPrevAuthState(session ? 'authenticated' : 'unauthenticated');
      
      if (session?.user) {
        setProfileLoadAttempts(current => current + 1);
        loadUserProfile(session.user.id).then(({ profile }) => {
          if (!profile) {
            // If no profile, retry once after a delay
            setTimeout(() => {
              setProfileLoadAttempts(current => current + 1);
              loadUserProfile(session.user.id).then(() => {
                setLoading(false);
              });
            }, 2000);
          } else {
            setLoading(false);
          }
        });
        
        // Convert temporary files for authenticated user
        handleUserAuthentication(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, [loadUserProfile, setIsAdmin, setLoading, setProfile, setProfileLoadAttempts, setPrevAuthState, setSession, setUser]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback((event: string, session: Session | null) => {
    console.log("Auth state change event:", event);
    
    const currentAuthState = session ? 'authenticated' : 'unauthenticated';
    
    setSession(session);
    setUser(session?.user ?? null);
    
    // Only set loading to true if we have a user and need to fetch profile
    if (session?.user) {
      setLoading(true);
    }
    
    // Handle newly authenticated user
    if (prevAuthState === 'unauthenticated' && currentAuthState === 'authenticated' && session?.user) {
      handleUserAuthentication(session.user.id);
    }
    
    setPrevAuthState(currentAuthState);
    
    if (session?.user) {
      setProfileLoadAttempts(current => current + 1);
      loadUserProfile(session.user.id).then(() => {
        setLoading(false);
      });
    } else {
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [loadUserProfile, prevAuthState, setIsAdmin, setLoading, setProfile, setProfileLoadAttempts, setPrevAuthState, setSession, setUser]);

  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, handleAuthStateChange]);
};
