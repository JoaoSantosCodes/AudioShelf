'use client';

import React from 'react';
import { Book } from '@/data/books';
import { Play, Headphones, Clock } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

export default function BookCard({ book, onSelect }: BookCardProps) {
  const isVideo = book.category?.toLowerCase() === 'vídeo' || book.category?.toLowerCase() === 'video';

  return (
    <div 
      onClick={() => onSelect(book)}
      className="group cursor-pointer glass-card p-2 relative"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 mb-3 shadow-inner">
        <img 
          src={book.cover} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        
        {/* Media Type Badge */}
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-gold shadow-xl">
          {isVideo ? <Play size={14} fill="currentColor" /> : <Headphones size={14} />}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md glass-panel flex items-center gap-1.5 text-[10px] font-bold text-text/80">
          <Clock size={10} />
          {book.duration}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gold text-bg flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
            {isVideo ? <Play size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </div>
        </div>
      </div>

      <div className="px-1.5 pb-1">
        <h3 className="text-[13px] font-semibold text-text truncate group-hover:text-gold transition-colors leading-snug mb-0.5">
          {book.title}
        </h3>
        <p className="text-[11px] text-text-dim truncate font-medium">
          {book.author}
        </p>
      </div>
    </div>
  );
}
