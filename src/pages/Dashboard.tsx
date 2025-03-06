
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
import { Loader2 } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const Dashboard = () => {
  const { user, loading, profile } = useAuth();
  const [showCreateApiKeyModal, setShowCreateApiKeyModal] = useState(false);
  const { handleError } = useErrorHandler('Failed to load dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Set a timeout to mark dashboard as loaded even if profile is delayed
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 3000); // Fallback after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // Set loaded when profile is ready
  useEffect(() => {
    if (profile) {
      setIsLoaded(true);
    }
  }, [profile]);

  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  // Show loading state while authentication is being checked
  if (loading && !isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // User is authenticated but profile might not be fully loaded yet
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
