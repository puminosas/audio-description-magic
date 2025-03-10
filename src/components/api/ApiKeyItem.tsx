
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useApiKeys } from './ApiKeyContext';

interface ApiKeyItemProps {
  apiKey: {
    id: string;
    name: string;
    api_key: string;
    created_at: string;
  };
}

const ApiKeyItem: React.FC<ApiKeyItemProps> = ({ apiKey }) => {
  const { setKeyToDelete } = useApiKeys();

  return (
    <div className="border rounded-md p-4">
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
  );
};

export default ApiKeyItem;
