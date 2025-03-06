
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavLinks, { NavLink } from './NavLinks';
import UserMenu from './UserMenu';
import Logo from './Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

const MobileMenu = ({ isOpen, onClose, links }: MobileMenuProps) => {
  // Close the mobile menu when the window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background md:hidden"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Logo />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <NavLinks 
                links={links} 
                variant="mobile" 
                onLinkClick={onClose} 
              />
            </div>
            
            <div className="border-t p-4">
              <UserMenu isMobile={true} onActionComplete={onClose} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
