
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchUserProfile, handleUserAuthentication } from '@/services/profileService';
import { getSession, onAuthStateChange } from '@/services/authService';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevAuthState, setPrevAuthState] = useState<'authenticated' | 'unauthenticated' | null>(null);

  // Handle email confirmation redirect
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // The user has been redirected back from email confirmation
        // Refresh the session
        getSession().then(({ data: { session } }) => {
          if (session) {
            setSession(session);
            setUser(session.user);
            fetchUserProfile(session.user.id).then(({ profile, isAdmin }) => {
              console.log("Profile loaded after hash change:", profile, "isAdmin:", isAdmin);
              setProfile(profile);
              setIsAdmin(isAdmin);
              setLoading(false);
            });
          }
        });
      }
    };

    // Call it once on mount to handle initial URL
    handleHashChange();

    // Add listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPrevAuthState(session ? 'authenticated' : 'unauthenticated');
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(({ profile, isAdmin }) => {
          console.log("Initial profile load:", profile, "isAdmin:", isAdmin);
          setProfile(profile);
          setIsAdmin(isAdmin);
          setLoading(false);
        });
        
        // Convert temporary files for authenticated user
        handleUserAuthentication(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
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
        fetchUserProfile(session.user.id).then(({ profile, isAdmin }) => {
          console.log("Profile updated after auth change:", profile, "isAdmin:", isAdmin);
          setProfile(profile);
          setIsAdmin(isAdmin);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [prevAuthState]);

  return {
    session,
    user,
    profile,
    isAdmin,
    loading,
    setProfile,
    setIsAdmin
  };
};
