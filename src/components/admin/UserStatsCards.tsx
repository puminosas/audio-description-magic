
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, UserCheck, UserX, FileAudio2 } from 'lucide-react';

interface UserStatsCardsProps {
  registeredUsers: number;
  anonymousUsers: number;
  totalGenerations: number;
  totalFiles: number;
}

const UserStatsCards = ({ 
  registeredUsers, 
  anonymousUsers, 
  totalGenerations, 
  totalFiles 
}: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UsersRound className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registeredUsers + anonymousUsers}</div>
          <p className="text-xs text-muted-foreground">
            Total registered and anonymous users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
          <UserCheck className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registeredUsers}</div>
          <p className="text-xs text-muted-foreground">
            Users with accounts ({registeredUsers > 0 ? Math.round((registeredUsers / (registeredUsers + anonymousUsers)) * 100) : 0}% of total)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anonymous Users</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{anonymousUsers}</div>
          <p className="text-xs text-muted-foreground">
            Users without accounts ({anonymousUsers > 0 ? Math.round((anonymousUsers / (registeredUsers + anonymousUsers)) * 100) : 0}% of total)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
          <FileAudio2 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGenerations}</div>
          <p className="text-xs text-muted-foreground">
            Audio files ({totalFiles} files total)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
