
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, RefreshCw, Key, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserApiKeys, createApiKey, deleteApiKey } from '@/utils/apiKeyService';

const ApiKeyDisplay = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchKeys();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchKeys = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await fetchUserApiKeys(user.id);
        
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewApiKey = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate an API key",
        variant: "destructive"
      });
      return;
    }

    setGeneratingKey(true);
    try {
      const { data, error } = await createApiKey(user.id, "API Key");
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New API key generated successfully!",
      });
      
      await fetchKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate a new API key",
        variant: "destructive"
      });
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard!",
    });
  };

  const revokeKey = async (keyId: string) => {
    try {
      const { error } = await deleteApiKey(keyId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "API key revoked successfully!",
      });
      
      await fetchKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive"
      });
    }
  };

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
            <AlertDescription>
              Please sign in to view and manage your API keys.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
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
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : apiKeys.length === 0 ? (
          <Alert>
            <AlertDescription>
              You don't have any API keys yet. Generate one to get started with our API.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">{apiKey.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(apiKey.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={apiKey.api_key}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyApiKey(apiKey.api_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => revokeKey(apiKey.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateNewApiKey} 
          disabled={generatingKey}
          className="w-full"
        >
          {generatingKey ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New API Key
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyDisplay;
