
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
import { format } from 'date-fns';

export interface Purchase {
  id: string;
  userId: string;
  email: string | null;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  payment_method: string;
}

interface PurchasesTableProps {
  purchases: Purchase[];
}

const PurchasesTable = ({ purchases }: PurchasesTableProps) => {
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No purchase records found
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">
                  {purchase.email || `User ${purchase.userId.substring(0, 8)}...`}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {purchase.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${purchase.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {format(new Date(purchase.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="capitalize">
                  {purchase.payment_method}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(purchase.status)}>
                    {purchase.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchasesTable;
