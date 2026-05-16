'use client';

import React, { createContext, useContext, useState } from 'react';
import { Book } from '@/data/books';

interface MediaContextType {
  activeMedia: Book | null;
  isMinimized: boolean;
  playMedia: (book: Book) => void;
  closeMedia: () => void;
  toggleMinimize: (minimized?: boolean) => void;
  updateActiveMedia: (updates: Partial<Book>) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<Book | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const playMedia = (book: Book) => {
    setActiveMedia(book);
    setIsMinimized(false);
  };

  const closeMedia = () => {
    setActiveMedia(null);
    setIsMinimized(false);
  };

  const toggleMinimize = (minimized?: boolean) => {
    setIsMinimized(minimized !== undefined ? minimized : !isMinimized);
  };

  const updateActiveMedia = (updates: Partial<Book>) => {
    setActiveMedia(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <MediaContext.Provider value={{ activeMedia, isMinimized, playMedia, closeMedia, toggleMinimize, updateActiveMedia }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}
