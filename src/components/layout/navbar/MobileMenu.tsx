
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { NavLink as NavLinkType } from './NavLinks';

interface MobileMenuProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  links?: NavLinkType[];
  onLinkClick?: () => void;
}

const MobileMenu = ({ isOpen, onOpenChange, links, onLinkClick }: MobileMenuProps) => {
  const location = useLocation();
  const [open, setOpen] = React.useState(isOpen || false);
  
  React.useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);
  
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };
  
  const closeMenu = () => {
    setOpen(false);
    if (onLinkClick) {
      onLinkClick();
    }
  };
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  // Use default links if none are provided
  const defaultLinks = [
    { name: 'Home', path: '/' },
    { name: 'Generator', path: '/generator' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'API', path: '/api-docs' },
    { name: 'Feedback', path: '/feedback' }
  ];
  
  const navLinks = links || defaultLinks;
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-4 py-4">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} onClick={closeMenu}>
              <Button 
                variant={isActiveRoute(link.path) ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                size="sm"
              >
                {link.name}
              </Button>
            </NavLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
