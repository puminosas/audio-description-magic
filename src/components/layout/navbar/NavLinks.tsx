import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links: NavLink[];
  variant?: 'desktop' | 'mobile';
  onLinkClick?: () => void;
}

const NavLinks = ({ links, variant = 'desktop', onLinkClick }: NavLinksProps) => {
  const location = useLocation();
  const [hidePricing, setHidePricing] = useState(false);
  
  // Fetch the app settings to check if pricing should be hidden
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('hidepricingfeatures')
          .single();
        
        if (!error && data) {
          setHidePricing(data.hidepricingfeatures);
        }
      } catch (error) {
        console.error('Failed to fetch app settings:', error);
      }
    }
    
    fetchSettings();
  }, []);
  
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Filter out the Pricing link if hidePricing is true
  const filteredLinks = links.filter(link => {
    if (hidePricing && link.path === '/pricing') {
      return false;
    }
    return true;
  });

  if (variant === 'mobile') {
    return (
      <>
        {filteredLinks.map((link) => {
          const isActive = location.pathname === link.path || 
                          (link.path !== '/' && location.pathname.startsWith(link.path));
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`py-3 px-2 text-sm font-medium transition-colors hover:text-primary block w-full text-left ${
                isActive ? 'text-primary' : 'text-foreground/70'
              }`}
              onClick={handleClick}
            >
              {link.name}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {filteredLinks.map((link) => {
        const isActive = location.pathname === link.path || 
                        (link.path !== '/' && location.pathname.startsWith(link.path));
        
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-foreground hover:bg-secondary ${
              isActive ? 'bg-secondary text-foreground' : 'text-foreground/70'
            }`}
            onClick={handleClick}
          >
            {link.name}
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
