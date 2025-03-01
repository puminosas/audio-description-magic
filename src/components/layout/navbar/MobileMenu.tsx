
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks, { NavLink } from './NavLinks';
import UserMenu from './UserMenu';
import { useAuth } from '@/context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
}

const MobileMenu = ({ isOpen, links }: MobileMenuProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <nav className="md:hidden py-4 px-4 glassmorphism animate-fade-in">
      <div className="flex flex-col space-y-4">
        <NavLinks links={links} variant="mobile" />
        
        {user ? (
          <UserMenu variant="mobile" />
        ) : (
          <Button onClick={() => navigate('/auth')} className="mt-2">Sign In</Button>
        )}
      </div>
    </nav>
  );
};

export default MobileMenu;
