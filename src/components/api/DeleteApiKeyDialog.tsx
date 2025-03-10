
import React from 'react';
import { Button } from '@/components/ui/button';
import { useApiKeys } from './ApiKeyContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const DeleteApiKeyDialog: React.FC = () => {
  const { keyToDelete, setKeyToDelete, revokeKey } = useApiKeys();

  return (
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
  );
};

export default DeleteApiKeyDialog;
