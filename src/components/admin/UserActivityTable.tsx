
import React, { useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, UserCircle, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivity {
  id: string;
  email: string | null;
  is_registered: boolean;
  last_active: string | null;
  total_generations: number;
  files_count: number;
  registration_date: string | null;
}

interface UserActivityTableProps {
  users: UserActivity[];
  onViewActivity: (userId: string, isRegistered: boolean) => void;
}

const UserActivityTable = ({ users, onViewActivity }: UserActivityTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserActivity; direction: 'ascending' | 'descending' }>({
    key: 'last_active',
    direction: 'descending'
  });

  // Sorting function
  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] === null && b[sortConfig.key] === null) return 0;
    if (a[sortConfig.key] === null) return 1;
    if (b[sortConfig.key] === null) return -1;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Convert string dates to Date objects for proper comparison
    if (sortConfig.key === 'last_active' || sortConfig.key === 'registration_date') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0;
      bValue = bValue ? new Date(bValue as string).getTime() : 0;
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Request sort
  const requestSort = (key: keyof UserActivity) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Helper to get sort direction indicator
  const getSortDirectionIndicator = (key: keyof UserActivity) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer" 
              onClick={() => requestSort('email')}
            >
              User{getSortDirectionIndicator('email')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('is_registered')}
            >
              Type{getSortDirectionIndicator('is_registered')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('registration_date')}
            >
              Registered{getSortDirectionIndicator('registration_date')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('last_active')}
            >
              Last Active{getSortDirectionIndicator('last_active')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('total_generations')}
            >
              Generations{getSortDirectionIndicator('total_generations')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => requestSort('files_count')}
            >
              Files{getSortDirectionIndicator('files_count')}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {sortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {user.is_registered ? (
                      <UserCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <UserX className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>
                      {user.email || 
                        <span className="text-muted-foreground italic">
                          Anonymous ({user.id.substring(0, 8)}...)
                        </span>
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_registered ? 'default' : 'outline'}>
                    {user.is_registered ? 'Registered' : 'Anonymous'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_registered && user.registration_date ? 
                    formatDistanceToNow(new Date(user.registration_date), { addSuffix: true }) :
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {user.last_active ? 
                    formatDistanceToNow(new Date(user.last_active), { addSuffix: true }) :
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {user.total_generations}
                </TableCell>
                <TableCell>
                  {user.files_count}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onViewActivity(user.id, user.is_registered)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserActivityTable;
