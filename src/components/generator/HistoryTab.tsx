
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface HistoryTabProps {
  user: User | null;
}

const HistoryTab = ({ user }: HistoryTabProps) => {
  return (
    <div className="text-center py-10">
      <h3 className="text-xl font-semibold mb-2">Your Audio History</h3>
      <p className="text-muted-foreground mb-4">
        {user ? 'View and manage your previously generated audio files.' : 'Sign in to view and manage your previously generated audio files.'}
      </p>
      {!user && (
        <Button>Sign In</Button>
      )}
    </div>
  );
};

export default HistoryTab;
