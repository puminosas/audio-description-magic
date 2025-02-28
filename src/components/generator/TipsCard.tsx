
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const TipsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tips for Great Product Descriptions</CardTitle>
        <CardDescription>
          Follow these tips to create engaging audio descriptions that convert
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5">
          <li>Keep descriptions clear, concise, and engaging</li>
          <li>Highlight key features and benefits</li>
          <li>Use sensory language to create vivid mental images</li>
          <li>Include important specifications and dimensions</li>
          <li>Address potential customer questions or concerns</li>
        </ul>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Great product descriptions lead to better audio results and higher conversion rates.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TipsCard;
