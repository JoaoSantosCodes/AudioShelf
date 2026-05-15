'use client';

import React, { useEffect, useState } from 'react';
import { useMedia } from '@/context/MediaContext';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import AudioPlayer from './AudioPlayer';
import MangaReader from './MangaReader';
import { AnimatePresence } from 'framer-motion';

export default function GlobalMediaContainer() {
  const { activeMedia, closeMedia } = useMedia();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!activeMedia || !user) return null;

  return (
    <AnimatePresence mode="wait">
      {activeMedia.category === 'Manga' ? (
        <MangaReader 
          key="manga-reader"
          book={activeMedia} 
          onClose={closeMedia} 
        />
      ) : (
        <AudioPlayer 
          key="audio-player"
          book={activeMedia} 
          userId={user.id}
        />
      )}
    </AnimatePresence>
  );
}
