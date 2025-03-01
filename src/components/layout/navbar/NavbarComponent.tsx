
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut,
  LayoutDashboard,
  Shield,
  ChevronDown
} from 'lucide-react';

const NavbarComponent = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generate' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API Docs', path: '/api-docs' },
    { name: 'API Client', path: '/api-client' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3 bg-background/95 backdrop-blur-sm border-b' : 'py-5 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="sound-wave scale-75">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
          <span className="text-xl font-bold">AudioDescriptions</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-2 text-sm font-medium rounded-md transition-colors
                        hover:text-foreground hover:bg-secondary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-default">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{profile?.full_name || user?.email}</span>
                </DropdownMenuItem>
                {profile?.plan && (
                  <DropdownMenuItem className="cursor-default">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {profile.plan === 'premium' ? 'Premium' : profile.plan === 'basic' ? 'Basic' : 'Free'} Plan
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button 
            className="text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden py-4 px-4 bg-background/95 backdrop-blur-sm border-b animate-in fade-in">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="py-2 text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="flex items-center py-2">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.full_name || user?.email}</p>
                    {profile?.plan && (
                      <p className="text-xs text-muted-foreground">
                        {profile.plan === 'premium' ? 'Premium' : profile.plan === 'basic' ? 'Basic' : 'Free'} Plan
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 flex items-center transition-colors hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
                
                {isAdmin && (
                  <button 
                    onClick={() => {
                      navigate('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 flex items-center transition-colors hover:text-primary"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 flex items-center transition-colors hover:text-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
                className="mt-2"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavbarComponent;
