
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

export interface UserMenuProps {
  isMobile?: boolean;
  onActionComplete?: () => void;
}

const UserMenu = ({ isMobile = false, onActionComplete }: UserMenuProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    if (onActionComplete) onActionComplete();
    navigate('/');
  };

  const navigateTo = (path: string) => {
    navigate(path);
    if (onActionComplete) onActionComplete();
  };

  // Show sign in/sign up buttons if no user
  if (!user) {
    return (
      <div className={`flex ${isMobile ? 'flex-col w-full space-y-2' : 'space-x-2'}`}>
        <Button
          variant="outline"
          onClick={() => navigateTo('/auth?mode=signin')}
          className={isMobile ? 'w-full' : ''}
        >
          Sign In
        </Button>
        <Button 
          onClick={() => navigateTo('/auth?mode=signup')}
          className={isMobile ? 'w-full' : ''}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  // Get the user's initials for the avatar
  const getInitials = () => {
    if (!user?.email) return '?';
    const parts = user.email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  // Show user menu if user is logged in
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigateTo('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
