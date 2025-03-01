
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface PlanDetailsProps {
  profile: any;
}

const PlanDetailsCard: React.FC<PlanDetailsProps> = ({ profile }) => {
  const getPlanDetails = () => {
    switch (profile?.plan) {
      case 'premium':
        return {
          name: 'Premium',
          limit: 'Unlimited',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        };
      case 'basic':
        return {
          name: 'Basic',
          limit: '100 per day',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        };
      case 'admin':
        return {
          name: 'Admin',
          limit: 'Unlimited',
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        };
      default:
        return {
          name: 'Free',
          limit: '10 per day',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
        };
    }
  };

  const planDetails = getPlanDetails();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Your Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center rounded-lg p-2 ${planDetails.bgColor}`}>
          <div className={`mr-4 rounded-full p-2 ${planDetails.bgColor}`}>
            <div className={`h-4 w-4 rounded-full ${planDetails.color}`}></div>
          </div>
          <div>
            <p className="font-semibold">{planDetails.name}</p>
            <p className="text-xs text-muted-foreground">{planDetails.limit}</p>
          </div>
        </div>
        {(profile?.plan === 'free' || profile?.plan === 'basic') && (
          <Button asChild className="mt-4 w-full" variant="outline">
            <Link to="/pricing">Upgrade Plan</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanDetailsCard;
