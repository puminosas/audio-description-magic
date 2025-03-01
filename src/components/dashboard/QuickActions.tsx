
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioLines, Code, FileAudio, Settings } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="flex flex-col items-center justify-center p-3 h-auto" asChild>
          <Link to="/generator">
            <AudioLines className="mb-1 h-5 w-5" />
            <span className="text-xs">New Audio</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center p-3 h-auto" asChild>
          <Link to="/generator?tab=history">
            <FileAudio className="mb-1 h-5 w-5" />
            <span className="text-xs">History</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center p-3 h-auto" asChild>
          <Link to="/api-docs">
            <Code className="mb-1 h-5 w-5" />
            <span className="text-xs">API</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center p-3 h-auto" asChild>
          <Link to="/settings">
            <Settings className="mb-1 h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
