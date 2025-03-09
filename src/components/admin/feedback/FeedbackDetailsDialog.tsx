
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  email?: string;
  created_at: string;
  status: string;
  admin_notes?: string;
}

interface FeedbackDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFeedback: FeedbackItem | null;
  adminNotes: string;
  setAdminNotes: (notes: string) => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onSaveNotes: () => Promise<void>;
}

const FeedbackDetailsDialog = ({
  open,
  onOpenChange,
  selectedFeedback,
  adminNotes,
  setAdminNotes,
  onStatusChange,
  onSaveNotes
}: FeedbackDetailsDialogProps) => {
  if (!selectedFeedback) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Feedback Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-medium mb-1">Type</h4>
            <Badge variant={selectedFeedback.type === 'bug' ? 'destructive' : 'default'}>
              {selectedFeedback.type}
            </Badge>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">From</h4>
            <p>{selectedFeedback.email || 'Anonymous'}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Message</h4>
            <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Status</h4>
            <Select 
              value={selectedFeedback.status || 'new'} 
              onValueChange={(value) => onStatusChange(selectedFeedback.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Admin Notes</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this feedback..."
              rows={5}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSaveNotes}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDetailsDialog;
