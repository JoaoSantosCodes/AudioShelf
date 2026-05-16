'use client';

import React from 'react';
import { Book } from '@/data/books';
import { Play, Headphones, Clock, Music, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const isVideo = book.category?.toLowerCase() === 'vídeo' || book.category?.toLowerCase() === 'video';
  const isMusic = book.category?.toLowerCase() === 'música' || book.category?.toLowerCase() === 'suno';

  return (
    <motion.div 
      layoutId={`book-${book.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(book)}
      className="group relative glass-card p-3 cursor-pointer overflow-hidden transition-all duration-500 border-gold/10 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/10 shimmer-effect"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 mb-4 shadow-xl">
        <Image 
          src={book.cover} 
          alt={book.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Media Type Badge */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-gold border border-gold/20 backdrop-blur-md shadow-lg">
          {isVideo ? <Video size={14} /> : isMusic ? <Music size={14} /> : <Headphones size={14} />}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
          <div className="w-14 h-14 rounded-full bg-gold/20 backdrop-blur-xl flex items-center justify-center border border-gold/40 shadow-2xl">
            <Play size={24} className="text-gold fill-gold ml-1" />
          </div>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold px-2 py-0.5 rounded-full bg-gold/5 border border-gold/10">
            {book.category}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-text-muted font-bold">
            <Clock size={10} />
            {book.duration}
          </div>
        </div>
        <h3 className="font-serif text-[15px] text-text leading-tight group-hover:text-gold transition-colors line-clamp-1">{book.title}</h3>
        <p className="text-[11px] text-text-dim font-medium line-clamp-1">{book.author}</p>
      </div>
    </motion.div>
  );
}
