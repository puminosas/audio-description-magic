
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserApiKeys, createApiKey, deleteApiKey } from '@/utils/apiKeyService';
import { useToast } from '@/hooks/use-toast';

type ApiKeyContextType = {
  apiKeys: any[];
  loading: boolean;
  error: string | null;
  generatingKey: boolean;
  newApiKey: string;
  keyToDelete: string | null;
  newKeyName: string;
  showCreateDialog: boolean;
  fetchKeys: () => Promise<void>;
  generateNewApiKey: () => Promise<void>;
  revokeKey: (keyId: string) => Promise<void>;
  copyApiKey: (key: string) => void;
  setNewKeyName: (name: string) => void;
  setShowCreateDialog: (show: boolean) => void;
  setKeyToDelete: (keyId: string | null) => void;
  setNewApiKey: (key: string) => void;
};

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode; user: User | null }> = ({
  children,
  user
}) => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    if (user) {
      fetchKeys();
    } else {
      setLoading(false);
    }
  }, [user]);

  const value = {
    apiKeys,
    loading,
    error,
    generatingKey,
    newApiKey,
    keyToDelete,
    newKeyName,
    showCreateDialog,
    fetchKeys,
    generateNewApiKey,
    revokeKey,
    copyApiKey,
    setNewKeyName,
    setShowCreateDialog,
    setKeyToDelete,
    setNewApiKey
  };

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};
