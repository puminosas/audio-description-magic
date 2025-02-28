
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Generate', path: '/generator' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-3 glassmorphism' : 'py-5 bg-transparent'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="sound-wave scale-75">
            <div className="bar animate-pulse-sound-1"></div>
            <div className="bar animate-pulse-sound-2"></div>
            <div className="bar animate-pulse-sound-3"></div>
            <div className="bar animate-pulse-sound-4"></div>
          </div>
          <span className="text-xl font-bold matrix-text">AudioDesc</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors hover:text-primary ${
                location.pathname === link.path ? 'text-primary font-medium' : 'text-foreground/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
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
                <DropdownMenuItem className="flex gap-2 items-center cursor-default">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{profile?.full_name || user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex gap-2 items-center cursor-default">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {profile?.plan === 'premium' ? 'Premium' : profile?.plan === 'basic' ? 'Basic' : 'Free'} Plan
                  </span>
                </DropdownMenuItem>
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
        </nav>

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

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden py-4 px-4 glassmorphism animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2 transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary font-medium' : 'text-foreground/80'
                }`}
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
                    <p className="font-medium">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.plan === 'premium' ? 'Premium' : profile?.plan === 'basic' ? 'Basic' : 'Free'} Plan
                    </p>
                  </div>
                </div>
                <Link 
                  to="/dashboard" 
                  className="py-2 flex items-center transition-colors hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="py-2 flex items-center transition-colors hover:text-primary"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Link>
                )}
                
                <button 
                  onClick={handleSignOut}
                  className="py-2 flex items-center transition-colors hover:text-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} className="mt-2">Sign In</Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
