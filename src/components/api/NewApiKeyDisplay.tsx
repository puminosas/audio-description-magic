
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Copy, Key, AlertTriangle } from 'lucide-react';
import { useApiKeys } from './ApiKeyContext';

const NewApiKeyDisplay: React.FC = () => {
  const { newApiKey, setNewApiKey, copyApiKey } = useApiKeys();

  if (!newApiKey) return null;

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
};

export default NewApiKeyDisplay;
