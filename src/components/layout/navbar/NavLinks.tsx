
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NavLinks = () => {
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generate' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API Docs', path: '/api-docs' },
    { name: 'API Client', path: '/api-client' }
  ];

  return (
    <nav className="hidden md:flex space-x-1">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:text-foreground hover:bg-secondary"
            )
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavLinks;
