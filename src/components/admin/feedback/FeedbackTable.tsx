
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  email?: string;
  created_at: string;
  status: string;
  admin_notes?: string;
}

interface FeedbackTableProps {
  feedback: FeedbackItem[];
  onOpenDetails: (item: FeedbackItem) => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  getStatusBadgeVariant: (status: string) => "default" | "secondary" | "destructive" | "outline";
}

const FeedbackTable = ({
  feedback,
  onOpenDetails,
  onStatusChange,
  getStatusBadgeVariant
}: FeedbackTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {feedback.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No feedback found
              </TableCell>
            </TableRow>
          ) : (
            feedback.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant={item.type === 'bug' ? 'destructive' : 'default'}>
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {item.message}
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onOpenDetails(item)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    {item.status !== 'resolved' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onStatusChange(item.id, 'resolved')}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    
                    {item.status !== 'new' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onStatusChange(item.id, 'new')}
                      >
                        <XCircle className="h-4 w-4 text-orange-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FeedbackTable;
