
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MainNavbar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="sound-wave scale-75">
                <div className="bar h-3"></div>
                <div className="bar h-5"></div>
                <div className="bar h-4"></div>
                <div className="bar h-2"></div>
              </div>
              <span className="text-xl font-bold">AudioDescriptions</span>
            </Link>
            
            <div className="hidden md:flex ml-6 space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}>
                Generator
              </Link>
              <Link to="/pricing" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/pricing') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}>
                Pricing
              </Link>
              <Link to="/integration-docs" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/integration-docs') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}>
                Integration
              </Link>
              {user && (
                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}>
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="hidden md:block">
              {user ? (
                <Button variant="outline" onClick={() => location.href = '/dashboard'}>
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => location.href = '/auth'}>
                  Sign In
                </Button>
              )}
            </div>
            
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="ml-2"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/90 backdrop-blur-md">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Generator
            </Link>
            <Link 
              to="/pricing" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/pricing') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/integration-docs" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/integration-docs') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Integration
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-foreground'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;
