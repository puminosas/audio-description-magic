
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useProfile } from './auth/useProfile';
import { useAuthRedirect } from './auth/useAuthRedirect';
import { useAuthEvents } from './auth/useAuthEvents';

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [prevAuthState, setPrevAuthState] = useState<'authenticated' | 'unauthenticated' | null>(null);

  // Use the profile hook for profile management
  const {
    profile,
    isAdmin,
    profileLoadAttempts,
    setProfile,
    setIsAdmin,
    setProfileLoadAttempts,
    loadUserProfile,
    checkAdminEmail
  } = useProfile(user?.id);

  // Handle authentication redirects
  useAuthRedirect({
    setSession,
    setUser,
    loadUserProfile,
    setLoading
  });

  // Initialize auth state and listen for changes
  useAuthEvents({
    setSession,
    setUser,
    setPrevAuthState,
    prevAuthState,
    setProfileLoadAttempts,
    loadUserProfile,
    setLoading,
    setProfile,
    setIsAdmin
  });

  // Check for admin email when user changes
  useEffect(() => {
    if (user) {
      checkAdminEmail(user);
    }
  }, [user, checkAdminEmail]);

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
