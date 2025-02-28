
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';

interface PlanStatusProps {
  user: User | null;
  profile: any | null;
  remainingGenerations: number;
}

const PlanStatus = ({ user, profile, remainingGenerations }: PlanStatusProps) => {
  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Badge variant="outline" className="mr-2">
          Free Plan
        </Badge>
        {remainingGenerations} generations remaining today
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      <Badge 
        variant={profile?.plan === 'premium' ? 'default' : profile?.plan === 'basic' ? 'secondary' : 'outline'} 
        className="mr-2"
      >
        {profile?.plan ? (profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)) : 'Free'} Plan
      </Badge>
      {profile?.plan === 'premium' ? 
        'Unlimited generations' : 
        profile?.plan === 'basic' ? 
          `${profile.remaining_generations} / ${profile.daily_limit} generations remaining` : 
          `${remainingGenerations} generations remaining today`
      }
    </p>
  );
};

export default PlanStatus;
