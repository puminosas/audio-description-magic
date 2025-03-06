
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from './NavLinks';
import NavLinks from './NavLinks';

interface MobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
  onLinkClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, links, onLinkClick }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-background/95 backdrop-blur-sm md:hidden"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <NavLinks 
                links={links} 
                variant="mobile" 
                onLinkClick={onLinkClick} 
              />

              <div className="pt-4 border-t border-border mt-2">
                <button
                  onClick={onLinkClick}
                  className="block w-full text-left px-4 py-2 text-foreground hover:bg-secondary/20 rounded-md"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
