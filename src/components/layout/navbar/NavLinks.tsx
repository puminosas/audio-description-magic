
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const NavLinks = () => {
  const location = useLocation();
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavLink to="/">
        <Button 
          variant={isActiveRoute('/') ? 'secondary' : 'ghost'} 
          size="sm" 
          className="text-sm font-medium"
        >
          Home
        </Button>
      </NavLink>
      
      <NavLink to="/generator">
        <Button 
          variant={isActiveRoute('/generator') ? 'secondary' : 'ghost'} 
          size="sm" 
          className="text-sm font-medium"
        >
          Generator
        </Button>
      </NavLink>
      
      <NavLink to="/pricing">
        <Button 
          variant={isActiveRoute('/pricing') ? 'secondary' : 'ghost'} 
          size="sm" 
          className="text-sm font-medium"
        >
          Pricing
        </Button>
      </NavLink>
      
      <NavLink to="/api-docs">
        <Button 
          variant={isActiveRoute('/api-docs') ? 'secondary' : 'ghost'} 
          size="sm" 
          className="text-sm font-medium"
        >
          API
        </Button>
      </NavLink>
      
      <NavLink to="/feedback">
        <Button 
          variant={isActiveRoute('/feedback') ? 'secondary' : 'ghost'} 
          size="sm" 
          className="text-sm font-medium"
        >
          Feedback
        </Button>
      </NavLink>
    </nav>
  );
};

export default NavLinks;
