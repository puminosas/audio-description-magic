
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from './navbar/Logo';
import NavLinks, { NavLink } from './navbar/NavLinks';
import MobileMenu from './navbar/MobileMenu';
import UserMenu from './navbar/UserMenu';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  const navLinks: NavLink[] = [
    { title: 'Generator', href: '/', isActive: isActive('/') },
    { title: 'Pricing', href: '/pricing', isActive: isActive('/pricing') },
    { title: 'Integration', href: '/integration-docs', isActive: isActive('/integration-docs') },
  ];
  
  const userLinks: NavLink[] = [
    ...(user ? [{ title: 'Dashboard', href: '/dashboard', isActive: isActive('/dashboard') }] : []),
    ...(isAdmin ? [{ title: 'Admin', href: '/admin', isActive: isActive('/admin') }] : []),
  ];
  
  const allLinks = [...navLinks, ...userLinks];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo />
            <div className="hidden md:block ml-6">
              <NavLinks links={allLinks} />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(true)}
                className="ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        links={allLinks}
      />
    </nav>
  );
};

export default Navbar;
