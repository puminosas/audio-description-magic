
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

const TutorialCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
            <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Quick Tips for Better Results</h3>
            <ul className="ml-6 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Start with clean, grammatically correct text</li>
              <li>Keep sentences at a natural length</li>
              <li>Use punctuation to control pauses and pacing</li>
              <li>Try different voices for the same text</li>
              <li>Adjust language settings to match accent needs</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-2">
              Read Full Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;
