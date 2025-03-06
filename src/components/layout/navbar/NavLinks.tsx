
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface NavLink {
  title: string;
  href: string;
  isActive?: boolean;
}

export interface NavLinksProps {
  links: NavLink[];
  variant?: 'default' | 'mobile';
  onLinkClick?: () => void;
}

const NavLinks = ({ links, variant = 'default', onLinkClick }: NavLinksProps) => {
  return (
    <ul className={cn(
      "flex gap-1", 
      variant === 'default' ? "flex-row items-center" : "flex-col w-full"
    )}>
      {links.map((link, index) => (
        <li key={index} className="w-full">
          <Link 
            to={link.href} 
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              variant === 'default' 
                ? "hover:bg-primary/10" 
                : "block w-full hover:bg-primary/10 py-3",
              link.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={onLinkClick}
          >
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;
