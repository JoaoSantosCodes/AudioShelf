'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isPureMode: boolean;
  setIsPureMode: (pure: boolean) => void;
  togglePureMode: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isPureMode, setIsPureMode] = useState(false);

  // Persistência
  useEffect(() => {
    const savedCategory = localStorage.getItem('ms-category');
    const savedSidebar = localStorage.getItem('ms-sidebar');
    if (savedCategory) setSelectedCategory(savedCategory);
    if (savedSidebar) setIsSidebarOpen(savedSidebar === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('ms-category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('ms-sidebar', String(isSidebarOpen));
  }, [isSidebarOpen]);

  const togglePureMode = () => {
    if (!isPureMode) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error(e));
      }
    }
    setIsPureMode(!isPureMode);
  };

  return (
    <NavigationContext.Provider value={{ 
      isSidebarOpen, 
      setIsSidebarOpen, 
      selectedCategory, 
      setSelectedCategory,
      isPureMode,
      setIsPureMode,
      togglePureMode
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
