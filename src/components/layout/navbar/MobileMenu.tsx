
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const MobileMenu = () => {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  
  const closeMenu = () => setOpen(false);
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-4 py-4">
          <NavLink to="/" onClick={closeMenu}>
            <Button 
              variant={isActiveRoute('/') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              size="sm"
            >
              Home
            </Button>
          </NavLink>
          
          <NavLink to="/generator" onClick={closeMenu}>
            <Button 
              variant={isActiveRoute('/generator') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              size="sm"
            >
              Generator
            </Button>
          </NavLink>
          
          <NavLink to="/pricing" onClick={closeMenu}>
            <Button 
              variant={isActiveRoute('/pricing') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              size="sm"
            >
              Pricing
            </Button>
          </NavLink>
          
          <NavLink to="/api-docs" onClick={closeMenu}>
            <Button 
              variant={isActiveRoute('/api-docs') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              size="sm"
            >
              API
            </Button>
          </NavLink>
          
          <NavLink to="/feedback" onClick={closeMenu}>
            <Button 
              variant={isActiveRoute('/feedback') ? 'secondary' : 'ghost'} 
              className="w-full justify-start" 
              size="sm"
            >
              Feedback
            </Button>
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
