
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, RefreshCw, Key, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserApiKeys, createApiKey, deleteApiKey } from '@/utils/apiKeyService';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const ApiKeyDisplay = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

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
    setError(null);
    
    try {
      const { data, error } = await fetchUserApiKeys(user.id);
        
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      setError(error.message || 'Failed to fetch your API keys');
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
    
    // Check if user has permission to create API keys
    if (profile && profile.plan !== 'premium' && profile.plan !== 'admin') {
      toast({
        title: "Upgrade Required",
        description: "Your current plan does not include API access. Please upgrade to Premium.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingKey(true);
    setError(null);
    
    try {
      const { data, error } = await createApiKey(user.id, newKeyName || "API Key");
      
      if (error) throw error;
      
      if (!data || !data.api_key) {
        throw new Error('Failed to generate API key - no key returned');
      }
      
      setNewApiKey(data.api_key);
      toast({
        title: "Success",
        description: "New API key generated successfully!",
      });
      
      await fetchKeys();
      setShowCreateDialog(false);
      setNewKeyName('');
    } catch (error: any) {
      console.error('Error generating API key:', error);
      setError(error.message || 'Failed to generate a new API key');
      toast({
        title: "Error",
        description: error.message || "Failed to generate a new API key",
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
      setKeyToDelete(null);
    } catch (error: any) {
      console.error('Error revoking API key:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
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
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center text-green-500">
            <Key className="mr-2 h-5 w-5" />
            New API Key Created
          </CardTitle>
          <CardDescription>
            Please copy and save your API key now. You won't be able to see it again!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-600">Important</AlertTitle>
            <AlertDescription className="text-yellow-700">
              This API key will only be displayed once. Please copy it and store it securely now.
            </AlertDescription>
          </Alert>
          
          <div className="relative">
            <Input
              value={newApiKey}
              readOnly
              className="font-mono text-sm pr-24"
            />
            <Button 
              onClick={() => copyApiKey(newApiKey)}
              size="sm"
              className="absolute right-1 top-1"
            >
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setNewApiKey('')}
            className="w-full"
          >
            Done
          </Button>
        </CardFooter>
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
                <div className="relative">
                  <Input
                    value={apiKey.api_key.substring(0, 8) + "••••••••••••••••••••••••••••••••"}
                    readOnly
                    className="font-mono text-sm bg-secondary/20"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="absolute right-1 top-1"
                    onClick={() => setKeyToDelete(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
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

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Enter a name for your new API key to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="API Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={generateNewApiKey} disabled={generatingKey}>
              {generatingKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone,
              and any applications using this key will no longer have access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => keyToDelete && revokeKey(keyToDelete)}
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ApiKeyDisplay;
