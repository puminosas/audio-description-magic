
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Crown, BarChart, Clock, Infinity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlanStatusProps {
  user: any;
  profile: any;
  remainingGenerations: number;
  totalGenerations?: number;
  todayGenerations?: number;
}

const PlanStatus = ({ 
  user, 
  profile, 
  remainingGenerations, 
  totalGenerations = 0, 
  todayGenerations = 0 
}: PlanStatusProps) => {
  const [unlimitedGenerations, setUnlimitedGenerations] = useState(false);
  
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('unlimitedgenerationsforall')
          .single();
        
        if (!error && data) {
          setUnlimitedGenerations(data.unlimitedgenerationsforall);
        }
      } catch (error) {
        console.error('Failed to fetch app settings:', error);
      }
    }
    
    fetchSettings();
  }, []);
  
  const planName = profile?.plan || 'free';
  const dailyLimit = profile?.daily_limit || 10;
  const percentage = unlimitedGenerations ? 100 : Math.round((remainingGenerations / dailyLimit) * 100);
  
  // Get plan details
  const getPlanDetails = () => {
    // If unlimited generations are enabled, show a special status
    if (unlimitedGenerations) {
      return {
        name: 'Unlimited Access',
        color: 'text-violet-500',
        bgColor: 'bg-violet-500',
        icon: <Infinity className="h-5 w-5 text-violet-500" />,
        description: 'Unlimited generations enabled for all users'
      };
    }
    
    switch (planName) {
      case 'premium':
        return {
          name: 'Premium Plan',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500',
          icon: <Crown className="h-5 w-5 text-yellow-500" />,
          description: 'Unlimited daily generations and premium voices'
        };
      case 'basic':
        return {
          name: 'Basic Plan',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500',
          icon: <BarChart className="h-5 w-5 text-blue-500" />,
          description: '50 daily generations with additional voices'
        };
      default:
        return {
          name: 'Free Plan',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500',
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          description: 'Limited daily generations with basic voices'
        };
    }
  };
  
  const plan = getPlanDetails();
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {plan.icon}
            <h3 className="font-medium">{plan.name}</h3>
          </div>
          {user && (
            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {plan.description}
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Daily Limit</span>
              {unlimitedGenerations ? (
                <span className="text-sm">Unlimited</span>
              ) : (
                <span className="text-sm">
                  {remainingGenerations} / {dailyLimit} remaining
                </span>
              )}
            </div>
            <Progress value={percentage} className={`h-2 ${plan.bgColor}`} />
          </div>
          
          {user && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-secondary/30 rounded-md p-2 text-center">
                <span className="text-xs text-muted-foreground block">Today</span>
                <span className="font-medium">{todayGenerations}</span>
              </div>
              <div className="bg-secondary/30 rounded-md p-2 text-center">
                <span className="text-xs text-muted-foreground block">All Time</span>
                <span className="font-medium">{totalGenerations}</span>
              </div>
            </div>
          )}
        </div>
        
        {!user && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Sign in to save your generations and unlock more features.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanStatus;
