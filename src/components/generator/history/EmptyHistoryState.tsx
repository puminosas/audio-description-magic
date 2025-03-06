
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileAudio } from 'lucide-react';

interface EmptyHistoryStateProps {
  isLoggedIn: boolean;
}

const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({ isLoggedIn }) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <FileAudio className="h-16 w-16 mx-auto mb-4 opacity-20" />
      <p className="text-lg mb-2">No audio files found</p>
      <p className="mb-6">
        {isLoggedIn ? "You haven't generated any audio descriptions yet." : "Generate your first audio description!"}
      </p>
      <Button onClick={() => window.location.href = '/generator'}>Generate Audio</Button>
    </div>
  );
};

export default EmptyHistoryState;
