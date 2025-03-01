
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { fetchUserApiKeys, deleteApiKey } from '@/utils/apiKeyService';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApiKeySection {
  user: User | null;
  showCreateApiKeyModal: boolean;
  setShowCreateApiKeyModal: (show: boolean) => void;
}

const ApiKeySection: React.FC<ApiKeySection> = ({ 
  user, 
  showCreateApiKeyModal, 
  setShowCreateApiKeyModal 
}) => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadApiKeys = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await fetchUserApiKeys(user.id);
      
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, [user?.id, showCreateApiKeyModal]);

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await deleteApiKey(keyToDelete);
      
      if (error) throw error;
      
      setApiKeys(apiKeys.filter(key => key.id !== keyToDelete));
      toast({
        description: "API key deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting API key",
        description: error.message || "There was a problem deleting your API key.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setKeyToDelete(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md">API Keys</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateApiKeyModal(true)}
            >
              Add Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="py-3 text-center text-sm text-muted-foreground">
              <p>No API keys found</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowCreateApiKeyModal(true)}
              >
                Create your first API key
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="truncate text-sm">
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setKeyToDelete(key.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/api-docs">View API Documentation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this API key?
              Any applications using this key will no longer be able to access the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteKey}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ApiKeySection;
