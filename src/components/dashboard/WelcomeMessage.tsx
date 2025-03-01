
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeMessageProps {
  profile: any;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ profile }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold">
          Welcome to VoiceFlow AI
        </h2>
        <p className="mt-2 text-muted-foreground">
          Generate ultra-realistic voices for your content in seconds.
        </p>
        <div className="mt-4">
          <p className="text-sm">
            Your plan: <span className="font-medium capitalize">{profile?.plan || 'Free'}</span>
          </p>
          <p className="text-sm">
            Remaining generations: <span className="font-medium">{profile?.remaining_generations || 0}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;
