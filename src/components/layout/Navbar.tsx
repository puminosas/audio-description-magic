
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

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
    { name: 'Dashboard', path: '/dashboard' },
  ];

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
          <span className="text-xl font-bold">AudioDesc</span>
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
          <Button>Sign In</Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            <Button className="mt-2">Sign In</Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
