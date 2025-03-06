
import React from 'react';
import { Link } from 'react-router-dom';

export interface NavLink {
  name: string;
  path: string;
}

export interface NavLinksProps {
  links: NavLink[];
  variant?: 'desktop' | 'mobile';
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ 
  links, 
  variant = 'desktop',
  onLinkClick 
}) => {
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col space-y-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="block px-4 py-2 text-foreground hover:bg-secondary/20 rounded-md"
            onClick={handleClick}
          >
            {link.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-6">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="text-foreground hover:text-primary transition-colors"
          onClick={handleClick}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};

export default NavLinks;
