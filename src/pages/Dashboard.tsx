
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RecentGenerations from '@/components/dashboard/RecentGenerations';
import PlanDetails from '@/components/dashboard/PlanDetails';
import UsageStats from '@/components/dashboard/UsageStats';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeMessage from '@/components/dashboard/WelcomeMessage';
import TutorialCard from '@/components/dashboard/TutorialCard';
import UpgradePlanBanner from '@/components/dashboard/UpgradePlanBanner';
import ApiKeySection from '@/components/dashboard/ApiKeySection';

const Dashboard = () => {
  const { user, loading, profile } = useAuth();
  const [showCreateApiKeyModal, setShowCreateApiKeyModal] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // Set a timeout to handle cases where profile loading gets stuck
  useEffect(() => {
    if (!loading && user) {
      // If we have a user but no profile after 3 seconds, stop showing loading state
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 3000);
      
      // If profile loads normally, clear the timeout
      if (profile) {
        setLocalLoading(false);
      }
      
      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // If not logged in and not loading, we don't need a loading state
      setLocalLoading(false);
    }
  }, [loading, user, profile]);

  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we've timed out waiting for profile but still have a user, render dashboard without profile
  if (!loading && user && !profile && !localLoading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard</h2>
        <p>Your profile data is being loaded or initialized. Some features may be limited.</p>
      </div>
    );
  }

  // If we're still in local loading state, show loading indicator
  if (localLoading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-semibold">Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardHeader 
        profile={profile} 
        user={user}
        showCreateApiKeyModal={showCreateApiKeyModal}
        setShowCreateApiKeyModal={setShowCreateApiKeyModal}
      />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column */}
        <div className="col-span-1 space-y-6 md:col-span-8">
          <WelcomeMessage profile={profile} />
          <RecentGenerations user={user} />
          <TutorialCard />
        </div>
        
        {/* Right Column */}
        <div className="col-span-1 space-y-6 md:col-span-4">
          <PlanDetails profile={profile} />
          <UsageStats profile={profile} />
          <QuickActions />
          <UpgradePlanBanner profile={profile} />
          <ApiKeySection 
            user={user} 
            showCreateApiKeyModal={showCreateApiKeyModal}
            setShowCreateApiKeyModal={setShowCreateApiKeyModal}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
