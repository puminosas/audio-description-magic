
import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpand: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  
  // Return a default implementation if context is not available
  // This prevents crashes when the hook is used outside a provider
  if (!context) {
    console.warn('useSidebar was called outside of SidebarProvider. Using fallback values.');
    return {
      expanded: true,
      setExpanded: () => {},
      toggleExpand: () => {}
    };
  }
  
  return context;
}

interface SidebarProviderProps {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function SidebarProvider({
  children,
  defaultExpanded = true,
}: SidebarProviderProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpand = () => setExpanded((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggleExpand }}>
      {children}
    </SidebarContext.Provider>
  );
}
