
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createApiKey } from '@/utils/apiKeyService';

interface DashboardHeaderProps {
  profile: any;
  user: User | null;
  showCreateApiKeyModal: boolean;
  setShowCreateApiKeyModal: (show: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  profile, 
  user,
  showCreateApiKeyModal,
  setShowCreateApiKeyModal
}) => {
  const { toast } = useToast();
  const [keyName, setKeyName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [newApiKey, setNewApiKey] = React.useState('');

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please make sure you are logged in to create API keys.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log('Creating API key for user:', user.id, 'with name:', keyName);
      const { data, error } = await createApiKey(user.id, keyName);
      
      if (error) {
        console.error('Error creating API key:', error);
        throw error;
      }
      
      if (!data || !data.api_key) {
        throw new Error('Failed to generate API key - no key returned');
      }
      
      setNewApiKey(data.api_key);
      toast({
        title: "Success",
        description: "API key created successfully. Make sure to copy it now!",
      });
    } catch (error: any) {
      console.error('Detailed error creating API key:', error);
      toast({
        title: "Error creating API key",
        description: error.message || "There was a problem creating your API key.",
        variant: "destructive",
      });
      // Close the modal on error to allow the user to try again
      setShowCreateApiKeyModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your voice AI dashboard
          </p>
        </div>
        <div className="flex gap-2">
          {profile?.plan === 'premium' || profile?.plan === 'admin' ? (
            <Button 
              variant="outline" 
              onClick={() => setShowCreateApiKeyModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Create API Key
            </Button>
          ) : null}
          <Button asChild>
            <Link to="/generator">Create Audio</Link>
          </Button>
        </div>
      </div>

      {/* Create API Key Modal */}
      <Dialog open={showCreateApiKeyModal} onOpenChange={setShowCreateApiKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
          </DialogHeader>
          {!newApiKey ? (
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="My API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : "Create API Key"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Your API Key (copy it now!)</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    value={newApiKey}
                    readOnly
                    className="pr-20 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-1 top-1"
                    onClick={() => {
                      navigator.clipboard.writeText(newApiKey);
                      toast({
                        description: "API key copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This key will only be displayed once. Store it securely.
                </p>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setShowCreateApiKeyModal(false);
                  setNewApiKey('');
                  setKeyName('');
                }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;
