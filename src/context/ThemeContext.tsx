'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'gold' | 'cyber';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('gold');

  useEffect(() => {
    const savedTheme = localStorage.getItem('mediashelf-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme === 'cyber' ? 'theme-cyber' : '';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'gold' ? 'cyber' : 'gold';
    setTheme(newTheme);
    localStorage.setItem('mediashelf-theme', newTheme);
    document.documentElement.className = newTheme === 'cyber' ? 'theme-cyber' : '';
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
