
import React from 'react';
import PlanStatus from '@/components/generator/PlanStatus';
import ProUpgradeCard from '@/components/generator/ProUpgradeCard';
import TipsCard from '@/components/generator/TipsCard';
import FeedbackCard from '@/components/generator/FeedbackCard';

interface GeneratorSidebarProps {
  user: any;
  profile: any;
  generationStats: {
    total: number;
    today: number;
    remaining: number;
  };
}

const GeneratorSidebar = ({ user, profile, generationStats }: GeneratorSidebarProps) => {
  return (
    <div className="space-y-6">
      <PlanStatus 
        user={user} 
        profile={profile}
        remainingGenerations={generationStats.remaining} 
        totalGenerations={generationStats.total}
        todayGenerations={generationStats.today}
      />
      
      <ProUpgradeCard user={user} profile={profile} />
      
      <TipsCard />
      
      <FeedbackCard />
    </div>
  );
};

export default GeneratorSidebar;
