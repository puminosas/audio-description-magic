
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/services/profile/profileService';
import { supabase } from '@/integrations/supabase/client';

export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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

  // Extra check for admin email
  const checkAdminEmail = useCallback(async (user: User | null) => {
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
  }, [isAdmin, profile]);

  return {
    profile,
    isAdmin,
    profileLoadAttempts,
    setProfile,
    setIsAdmin,
    setProfileLoadAttempts,
    loadUserProfile,
    checkAdminEmail
  };
};
