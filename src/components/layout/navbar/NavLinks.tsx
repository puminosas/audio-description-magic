
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavLink {
  href: string;
  label: string;
  name?: string; // Added name property to fix TypeScript errors
}

export interface NavLinksProps {
  links: NavLink[];
  variant?: string;
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, variant = 'default', onLinkClick }) => {
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav className={cn(
      "flex gap-6",
      variant === 'mobile' && "flex-col",
      variant === 'dropdown' && "flex-col"
    )}>
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          onClick={handleClick}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            variant === 'default' && "text-foreground/60 hover:text-foreground/80",
            variant === 'mobile' && "text-foreground",
            variant === 'dropdown' && "text-foreground/80 hover:bg-accent px-2 py-1.5 rounded-md"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
