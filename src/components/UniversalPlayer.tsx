'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings, 
  Maximize2,
  FileText,
  Video,
  Headphones,
  Maximize
} from 'lucide-react';
import { Book } from '@/data/books';
import Image from 'next/image';

interface UniversalPlayerProps {
  media: Book;
}

export default function UniversalPlayer({ media }: UniversalPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(media.progress || 0);

  const isManga = media.category === 'Manga';
  const isVideo = media.category === 'Vídeo' || media.category === 'Video';
  const isAudio = media.category === 'Audiobook' || media.category === 'Música' || media.category === 'Suno';

  return (
    <div className="w-full h-full bg-bg/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 overflow-hidden flex flex-col relative group/player">
      {/* VIEWPORT DA MÍDIA */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {isAudio && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-64 h-64 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-gold/20 relative group">
               <Image src={media.cover} alt={media.title} fill className="object-cover" />
               <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                 <Play size={48} className="text-gold fill-gold" />
               </div>
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-serif font-bold text-text">{media.title}</h3>
               <p className="text-xs text-gold uppercase tracking-widest font-black">{media.author}</p>
            </div>
            {/* EQUALIZER ANIMATION */}
            <div className="flex items-center justify-center gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: isPlaying ? [10, 30, 15, 25, 10] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                  className="w-1 bg-gold/60 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {isManga && (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full max-w-2xl aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden">
               <Image src={media.cover} alt={media.title} fill className="object-contain bg-surface-3" />
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10">
                 Página 42 / 180
               </div>
            </div>
          </div>
        )}

        {isVideo && (
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            <Video size={80} className="text-gold/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* CONTROLES TÁTICOS */}
      <div className="p-8 bg-surface-1/40 border-t border-white/5 backdrop-blur-xl">
        {/* PROGRESS BAR */}
        <div className="relative w-full h-1.5 bg-surface-3 rounded-full mb-8 cursor-pointer group/progress">
          <div 
            className="absolute top-0 left-0 h-full bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] transition-all" 
            style={{ width: `${progress}%` }} 
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity border-4 border-gold"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
             <button className="text-text-muted hover:text-gold transition-colors"><SkipBack size={20} /></button>
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="w-14 h-14 rounded-full bg-gold text-bg flex items-center justify-center hover:bg-gold-bright transition-all shadow-xl shadow-gold/30"
             >
               {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
             </button>
             <button className="text-text-muted hover:text-gold transition-colors"><SkipForward size={20} /></button>
          </div>

          <div className="hidden md:flex items-center gap-8">
             <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-text-dim" />
                <div className="w-24 h-1 bg-surface-3 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-gold/50" />
                </div>
             </div>
             <div className="h-4 w-[1px] bg-white/10" />
             <div className="flex items-center gap-4 text-text-dim">
                <button className="hover:text-gold transition-colors"><Settings size={18} /></button>
                <button className="hover:text-gold transition-colors"><Maximize2 size={18} /></button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
