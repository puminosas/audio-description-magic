
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserMenuProps {
  variant?: 'desktop' | 'mobile';
}

const UserMenu = ({ variant = 'desktop' }: UserMenuProps) => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();

  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (variant === 'mobile') {
    return (
      <>
        <div className="flex items-center py-2">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{profile?.full_name || user?.email}</p>
            {profile?.plan && (
              <p className="text-xs text-muted-foreground">
                {profile.plan === 'premium' ? 'Premium' : profile.plan === 'basic' ? 'Basic' : 'Free'} Plan
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="py-2 flex items-center transition-colors hover:text-primary"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </button>
        
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="py-2 flex items-center transition-colors hover:text-primary"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </button>
        )}
        
        <button 
          onClick={handleSignOut}
          className="py-2 flex items-center transition-colors hover:text-primary"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-default">
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium">{profile?.full_name || user?.email}</span>
        </DropdownMenuItem>
        {profile?.plan && (
          <DropdownMenuItem className="cursor-default">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
              {profile.plan === 'premium' ? 'Premium' : profile.plan === 'basic' ? 'Basic' : 'Free'} Plan
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
