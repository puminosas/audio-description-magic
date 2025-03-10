
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useApiKeys } from './ApiKeyContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const CreateApiKeyDialog: React.FC = () => {
  const { 
    showCreateDialog, 
    setShowCreateDialog, 
    newKeyName, 
    setNewKeyName, 
    generateNewApiKey, 
    generatingKey 
  } = useApiKeys();

  return (
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
  );
};

export default CreateApiKeyDialog;
