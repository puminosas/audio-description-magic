
import React from 'react';
import { Link } from 'react-router-dom';

export interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links: NavLink[];
  variant?: 'desktop' | 'mobile';
}

const NavLinks = ({ links, variant = 'desktop' }: NavLinksProps) => {
  if (variant === 'mobile') {
    return (
      <>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="py-2 text-sm font-medium transition-colors hover:text-primary"
          >
            {link.name}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-foreground hover:bg-secondary"
        >
          {link.name}
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
