
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export interface NavLink {
  title: string;
  href: string;
  isExternal?: boolean;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

interface NavLinksProps {
  links?: NavLink[];
  variant?: 'default' | 'mobile';
  onLinkClick?: () => void;
}

const defaultLinks: NavLink[] = [
  { title: 'Generator', href: '/' },
  { title: 'Pricing', href: '/pricing' },
  { title: 'Integration Docs', href: '/integration-docs' },
];

const NavLinks = ({ links = defaultLinks, variant = 'default', onLinkClick }: NavLinksProps) => {
  const { user } = useAuth();
  const isAdmin = false; // Simplified until you restore admin check

  return (
    <div className={cn(
      variant === 'default' ? 'flex items-center space-x-1 md:space-x-2' : 'flex flex-col space-y-3'
    )}>
      {links.map((link) => {
        // Skip admin-only links for non-admin users
        if (link.adminOnly && !isAdmin) return null;
        
        // Skip auth-required links for non-authenticated users
        if (link.requiresAuth && !user) return null;

        return link.isExternal ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              variant === 'default' ? 'px-3 py-2' : 'px-2 py-1'
            )}
            onClick={onLinkClick}
          >
            {link.title}
          </a>
        ) : (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              variant === 'default' ? 'px-3 py-2' : 'px-2 py-1'
            )}
            onClick={onLinkClick}
          >
            {link.title}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;
