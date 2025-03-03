
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AudioFilesTable from './AudioFilesTable';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface UserActivityDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userEmail: string | null;
  isRegistered: boolean;
  registrationDate: string | null;
  audioFiles: any[];
  loading: boolean;
}

const UserActivityDetails = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  isRegistered,
  registrationDate,
  audioFiles,
  loading
}: UserActivityDetailsProps) => {
  // Create a function that returns a Promise to satisfy the type requirement
  const handleDelete = async (id: string): Promise<void> => {
    // In this context, we don't actually want to delete anything
    // but we need to return a Promise to satisfy the type
    return Promise.resolve();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Activity Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* User info */}
          <div className="p-4 border rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">
                  {userEmail || `Anonymous User (${userId?.substring(0, 8)}...)`}
                </h3>
                <p className="text-muted-foreground text-sm">
                  ID: {userId}
                </p>
                {isRegistered && registrationDate && (
                  <p className="text-muted-foreground text-sm">
                    Registered: {format(new Date(registrationDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
              <Badge variant={isRegistered ? 'default' : 'outline'}>
                {isRegistered ? 'Registered' : 'Anonymous'}
              </Badge>
            </div>
          </div>
          
          {/* Activity history */}
          <div>
            <h4 className="font-medium mb-3">Audio Generation History</h4>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : audioFiles.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No audio files found</p>
            ) : (
              <AudioFilesTable 
                audioFiles={audioFiles}
                onDelete={handleDelete} // Now passing a function that returns a Promise
              />
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserActivityDetails;
