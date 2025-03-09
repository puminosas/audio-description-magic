
import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

export interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links?: NavLink[];
}

const NavLinks = ({ links }: NavLinksProps) => {
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Use default links if none are provided
  const defaultLinks = [
    { name: 'Home', path: '/' },
    { name: 'Generator', path: '/generator' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api-docs' },
    { name: 'Feedback', path: '/feedback' }
  ];
  
  const navLinks = links || defaultLinks;
  
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navLinks.map((link) => (
        <RouterNavLink to={link.path} key={link.path}>
          <Button 
            variant={isActiveRoute(link.path) ? 'secondary' : 'ghost'} 
            size="sm" 
            className="text-sm font-medium"
          >
            {link.name}
          </Button>
        </RouterNavLink>
      ))}
    </nav>
  );
};

export default NavLinks;
