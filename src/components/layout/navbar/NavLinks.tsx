import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useMobile } from '@/hooks/useMobile';

const NavLinks = () => {
  const { user } = useAuth();
  const isAdmin = useAdminCheck();
  const location = useLocation();
  const isMobile = useMobile();
  
  const linkContainerClasses = `
    flex 
    ${isMobile ? 'flex-col items-center w-full' : 'items-center gap-6'}
  `;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) => {
    return `
      text-sm 
      font-medium 
      ${isMobile ? 'w-full text-center py-3' : ''}
      hover:text-primary 
      transition-colors 
      duration-200
      ${isActive ? 'text-primary' : 'text-secondary-foreground'}
    `;
  };
  
  const NavItem = ({ to, children, isActive }: { to: string, children: React.ReactNode, isActive: boolean }) => (
    <NavLink to={to} className={navLinkClasses} >
      {children}
    </NavLink>
  );
  
  return (
    <div className={linkContainerClasses}>
      <NavItem to="/" isActive={location.pathname === "/"}>Home</NavItem>
      
      {/* Add link to embed audio documentation */}
      <NavItem to="/embed-audio-docs" isActive={location.pathname === "/embed-audio-docs"}>
        Integration Docs
      </NavItem>
      
      <NavItem to="/generator" isActive={location.pathname === "/generator"}>Generator</NavItem>
      
      {user && isAdmin && (
        <NavItem to="/admin" isActive={location.pathname === "/admin"}>Admin</NavItem>
      )}
      
      {user ? (
        <NavItem to="/history" isActive={location.pathname === "/history"}>History</NavItem>
      ) : null}
    </div>
  );
};

export default NavLinks;
