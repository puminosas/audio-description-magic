
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ShieldCheck, ShieldX } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string | null;
  plan: string;
  created_at: string;
}

interface UsersTableProps {
  users: UserData[];
  onToggleAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
  onUpdatePlan: (userId: string, plan: string) => Promise<void>;
}

const UsersTable = ({ 
  users, 
  onToggleAdmin, 
  onUpdatePlan 
}: UsersTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isAdmin = user.role === 'admin';
              
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.email}
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[120px]">
                    {user.id}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.plan || 'free'}
                      onValueChange={(value) => onUpdatePlan(user.id, value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isAdmin ? 'default' : 'outline'}>
                      {isAdmin ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isAdmin ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onToggleAdmin(user.id, true)}
                        >
                          <ShieldX className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onToggleAdmin(user.id, false)}
                        >
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
