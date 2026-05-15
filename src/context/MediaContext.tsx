'use client';

import React, { createContext, useContext, useState } from 'react';
import { Book } from '@/data/books';

interface MediaContextType {
  activeMedia: Book | null;
  playMedia: (book: Book) => void;
  closeMedia: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [activeMedia, setActiveMedia] = useState<Book | null>(null);

  const playMedia = (book: Book) => {
    setActiveMedia(book);
  };

  const closeMedia = () => {
    setActiveMedia(null);
  };

  return (
    <MediaContext.Provider value={{ activeMedia, playMedia, closeMedia }}>
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
