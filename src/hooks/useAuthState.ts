
import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchUserProfile, handleUserAuthentication } from '@/services/profileService';
import { getSession, onAuthStateChange } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevAuthState, setPrevAuthState] = useState<'authenticated' | 'unauthenticated' | null>(null);
  const [profileLoadAttempts, setProfileLoadAttempts] = useState<number>(0);

  // Helper function to load profile
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Loading profile for user:", userId);
      const { profile, isAdmin } = await fetchUserProfile(userId);
      
      console.log("Profile loaded:", profile, "isAdmin:", isAdmin);
      setProfile(profile);
      setIsAdmin(isAdmin);
      
      // If admin email but no admin role, force refresh admin status
      if (profile?.email === 'a.mackeliunas@gmail.com' && !isAdmin) {
        console.log("Admin email detected but no admin role, forcing refresh");
        
        try {
          // Attempt to assign admin role
          const { data } = await supabase
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: 'admin'
            }, { onConflict: 'user_id,role' });
          
          // Update admin status
          setIsAdmin(true);
          console.log("Admin role forced for admin email");
        } catch (e) {
          console.error("Error forcing admin role:", e);
        }
      }
      
      return { profile, isAdmin };
    } catch (error) {
      console.error("Error loading user profile:", error);
      return { profile: null, isAdmin: false };
    }
  }, []);

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
            loadUserProfile(session.user.id).then(() => {
              setLoading(false);
            });
          } else {
            setLoading(false);
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
  }, [loadUserProfile]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPrevAuthState(session ? 'authenticated' : 'unauthenticated');
      
      if (session?.user) {
        setProfileLoadAttempts(1);
        loadUserProfile(session.user.id).then(({ profile }) => {
          if (!profile) {
            // If no profile, retry once after a delay
            setTimeout(() => {
              setProfileLoadAttempts(2);
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
        setProfileLoadAttempts(current => current + 1);
        loadUserProfile(session.user.id).then(() => {
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
  }, [prevAuthState, loadUserProfile]);

  // Extra check for admin email
  useEffect(() => {
    const checkAdminEmail = async () => {
      if (user && user.email === 'a.mackeliunas@gmail.com' && !isAdmin) {
        console.log("Admin email detected but not set as admin, forcing admin status");
        setIsAdmin(true);
        
        try {
          // Attempt to assign admin role
          await supabase
            .from('user_roles')
            .upsert({
              user_id: user.id,
              role: 'admin'
            }, { onConflict: 'user_id,role' });
            
          // Update profile if needed
          if (profile && profile.plan !== 'admin') {
            await supabase
              .from('profiles')
              .update({
                plan: 'admin',
                daily_limit: 9999,
                remaining_generations: 9999,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
              
            setProfile({
              ...profile,
              plan: 'admin',
              daily_limit: 9999,
              remaining_generations: 9999
            });
          }
          
          console.log("Admin role and profile updated for admin email");
        } catch (e) {
          console.error("Error forcing admin privileges:", e);
        }
      }
    };
    
    checkAdminEmail();
  }, [user, profile, isAdmin]);

  return {
    session,
    user,
    profile,
    isAdmin,
    loading,
    setProfile,
    setIsAdmin // Make sure this is explicitly returned
  };
};
