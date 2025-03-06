
import React from 'react';
import { Link } from 'react-router-dom';

export interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  className?: string;
}

const NavLinks = ({ className }: NavLinksProps) => {
  const links: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/integration-docs', label: 'Integration Docs' },
  ];

  return (
    <nav className={className}>
      <ul className="flex space-x-8">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-gray-600 hover:text-primary transition-colors font-medium"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavLinks;
