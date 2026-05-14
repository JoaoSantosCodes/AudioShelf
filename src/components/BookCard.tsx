'use client';

import React from 'react';
import { Book } from '@/data/books';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

export default function BookCard({ book, onSelect }: BookCardProps) {
  return (
    <div 
      onClick={() => onSelect(book)}
      className="group cursor-pointer transition-transform duration-200 hover:-translate-y-1 relative"
    >
      <div className="relative aspect-[2/3] rounded-lg bg-surface-2 border border-border-custom overflow-hidden shadow-lg mb-2.5">
        <img 
          src={book.cover} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Mini progress bar at the bottom of the card */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-surface-3">
          <div className="h-full bg-gold" style={{ width: '0%' }}></div>
        </div>
      </div>
      <div className="px-1">
        <h3 className="text-[12.5px] font-medium text-text truncate group-hover:text-gold transition-colors leading-tight">
          {book.title}
        </h3>
        <p className="text-[11px] text-text-muted truncate mt-0.5">{book.author}</p>
      </div>
    </div>
  );
}
