
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface UpgradePlanBannerProps {
  profile: any;
}

const UpgradePlanBanner: React.FC<UpgradePlanBannerProps> = ({ profile }) => {
  // Only show for free plan users
  if (profile?.plan !== 'free') {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <p className="text-xs text-blue-100">
              Get unlimited generations & more voices
            </p>
          </div>
          <Sparkles className="h-8 w-8 text-yellow-300" />
        </div>
        <Button
          asChild
          className="mt-3 w-full bg-white text-blue-600 hover:bg-blue-50"
        >
          <Link to="/pricing">See Plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePlanBanner;
