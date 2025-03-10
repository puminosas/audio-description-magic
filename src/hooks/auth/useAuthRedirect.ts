
import { useEffect, useCallback } from 'react';
import { getSession } from '@/services/authService';

type AuthRedirectProps = {
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  loadUserProfile: (userId: string) => Promise<any>;
  setLoading: (loading: boolean) => void;
};

export const useAuthRedirect = ({
  setSession,
  setUser,
  loadUserProfile,
  setLoading
}: AuthRedirectProps) => {
  // Handle email confirmation redirect
  const handleHashChange = useCallback(async () => {
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
  }, [loadUserProfile, setLoading, setSession, setUser]);

  useEffect(() => {
    // Call it once on mount to handle initial URL
    handleHashChange();

    // Add listener for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);
};
