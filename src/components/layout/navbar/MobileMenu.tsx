
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks, { NavLink } from './NavLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
  onLinkClick?: () => void;
}

const MobileMenu = ({ isOpen, links, onLinkClick }: MobileMenuProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleSignIn = () => {
    if (onLinkClick) {
      onLinkClick();
    }
    navigate('/auth');
  };

  return (
    <nav className="md:hidden fixed top-16 left-0 right-0 z-50 py-4 px-4 bg-background/95 backdrop-blur-xl border-b border-border shadow-md animate-fade-in">
      <div className="flex flex-col space-y-4">
        <NavLinks links={links} variant="mobile" onLinkClick={handleLinkClick} />
        
        {user ? (
          <UserMenu variant="mobile" />
        ) : (
          <Button onClick={handleSignIn} className="mt-2">Sign In</Button>
        )}
      </div>
    </nav>
  );
};

export default MobileMenu;
