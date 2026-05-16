'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { 
  List, 
  Sparkles, 
  Bell 
} from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import GlobalSearch from './GlobalSearch';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const { setIsSidebarOpen, togglePureMode, isPureMode } = useNavigation();

  if (isPureMode) return null;

  const getTitle = () => {
    if (pathname === '/') return 'Sua Biblioteca';
    if (pathname === '/brain') return 'Neural Layer';
    return 'MediaShelf';
  };

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40 w-full">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="md:hidden p-2 text-text-muted hover:text-text bg-surface-2 rounded-lg"
        >
          <List size={20} />
        </button>
        <h2 className="text-lg md:text-xl font-serif font-bold text-text truncate">{getTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <GlobalSearch />
        <ThemeToggle />
        
        <button 
          onClick={togglePureMode}
          className="w-10 h-10 rounded-full bg-surface-2 border border-border-custom flex items-center justify-center text-text-muted hover:text-gold transition-all"
          title="Modo Pure Absoluto"
        >
          <Sparkles size={18} />
        </button>
        
        <div className="relative">
          <button 
            className="w-10 h-10 rounded-full bg-surface-2 border border-border-custom flex items-center justify-center text-text-muted hover:text-gold transition-all relative"
          >
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background shadow-sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
