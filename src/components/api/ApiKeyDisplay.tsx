
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Key, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ApiKeyItem from './ApiKeyItem';
import CreateApiKeyDialog from './CreateApiKeyDialog';
import DeleteApiKeyDialog from './DeleteApiKeyDialog';
import ApiKeyEmptyState from './ApiKeyEmptyState';
import NewApiKeyDisplay from './NewApiKeyDisplay';
import { ApiKeyProvider, useApiKeys } from './ApiKeyContext';

const ApiKeyDisplayContent: React.FC = () => {
  const { user, profile } = useAuth();
  const { 
    apiKeys, 
    loading, 
    error, 
    newApiKey,
    showCreateDialog, 
    setShowCreateDialog,
    generatingKey
  } = useApiKeys();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            You need to be signed in to manage API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to view and manage your API keys.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (profile && profile.plan !== 'premium' && profile.plan !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            API access is available on Premium plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Upgrade Required</AlertTitle>
            <AlertDescription>
              Your current plan does not include API access. Please upgrade to Premium to create and manage API keys.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (newApiKey) {
    return <NewApiKeyDisplay />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2 h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Manage your API keys for programmatic access to our services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : apiKeys.length === 0 ? (
          <ApiKeyEmptyState />
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <ApiKeyItem key={apiKey.id} apiKey={apiKey} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => setShowCreateDialog(true)} 
          disabled={generatingKey}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate New API Key
        </Button>
      </CardFooter>

      <CreateApiKeyDialog />
      <DeleteApiKeyDialog />
    </Card>
  );
};

const ApiKeyDisplay: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <ApiKeyProvider user={user}>
      <ApiKeyDisplayContent />
    </ApiKeyProvider>
  );
};

export default ApiKeyDisplay;
