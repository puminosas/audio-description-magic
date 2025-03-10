
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ApiKeyEmptyState: React.FC = () => {
  return (
    <Alert>
      <AlertDescription>
        You don't have any API keys yet. Generate one to get started with our API.
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeyEmptyState;
