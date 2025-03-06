
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links: NavLink[];
  variant?: 'desktop' | 'mobile';
  onLinkClick?: () => void;
}

const NavLinks = ({ links, variant = 'desktop', onLinkClick }: NavLinksProps) => {
  const location = useLocation();
  
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  if (variant === 'mobile') {
    return (
      <>
        {links.map((link) => {
          const isActive = location.pathname === link.path || 
                          (link.path !== '/' && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`py-3 px-2 text-sm font-medium transition-colors hover:text-primary block w-full text-left ${
                isActive ? 'text-primary' : 'text-foreground/70'
              }`}
              onClick={handleClick}
            >
              {link.name}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {links.map((link) => {
        const isActive = location.pathname === link.path || 
                        (link.path !== '/' && location.pathname.startsWith(link.path));
        
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-foreground hover:bg-secondary ${
              isActive ? 'bg-secondary text-foreground' : 'text-foreground/70'
            }`}
            onClick={handleClick}
          >
            {link.name}
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
