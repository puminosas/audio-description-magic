
import React from 'react';
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface SearchUserProps {
  userId: string;
  email: string;
  searchLoading: boolean;
  setUserId: (value: string) => void;
  setEmail: (value: string) => void;
  searchUser: () => Promise<void>;
}

const SearchUser: React.FC<SearchUserProps> = ({ 
  userId, 
  email, 
  searchLoading, 
  setUserId, 
  setEmail, 
  searchUser 
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="userId" className="text-sm font-medium">User ID</label>
        <Input
          id="userId"
          placeholder="Enter user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Or Email</label>
        <Input
          id="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <Button onClick={searchUser} disabled={searchLoading}>
        {searchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Search User
      </Button>
    </div>
  );
};

export default SearchUser;
