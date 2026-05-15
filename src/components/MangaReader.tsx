'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';
import { Book } from '@/data/books';

interface MangaReaderProps {
  book: Book;
  onClose: () => void;
}

export default function MangaReader({ book, onClose }: MangaReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const pages = book.chapters;
  const currentImageUrl = `/api/stream?file_id=${pages[currentPage].telegram_file_id}&type=image`;

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      setZoom(1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setZoom(1);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
    >
      {/* HEADER CONTROLS */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-surface-2/50 text-text hover:bg-gold hover:text-bg transition-all"
          >
            <X size={24} />
          </button>
          <div>
            <h2 className="font-serif text-xl text-gold">{book.title}</h2>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
              Página {currentPage + 1} de {pages.length} — {pages[currentPage].title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-2/50 p-1 rounded-xl border border-border-custom">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 hover:text-gold transition-colors"><ZoomOut size={20} /></button>
            <span className="text-[10px] font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 hover:text-gold transition-colors"><ZoomIn size={20} /></button>
          </div>
          <button className="p-3 rounded-xl bg-surface-2/50 text-text hover:text-gold transition-all"><Download size={20} /></button>
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-3 rounded-xl bg-surface-2/50 transition-all ${isFullScreen ? 'text-gold' : 'text-text hover:text-gold'}`}
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: zoom }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden border border-gold/10"
            style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
          >
            <img 
              src={currentImageUrl} 
              alt={`Page ${currentPage + 1}`}
              className="max-w-full max-h-[80vh] object-contain select-none"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* NAVIGATION OVERLAYS */}
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-surface-2/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-bg transition-all disabled:opacity-0"
        >
          <ChevronLeft size={32} />
        </button>

        <button 
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-surface-2/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-gold hover:text-bg transition-all disabled:opacity-0"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* THUMBNAILS STRIP */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center gap-3 bg-gradient-to-t from-black/80 to-transparent">
        {pages.map((page, idx) => (
          <button
            key={page.telegram_file_id}
            onClick={() => { setCurrentPage(idx); setZoom(1); }}
            className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all hover:scale-110 ${idx === currentPage ? 'border-gold shadow-lg shadow-gold/20 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            <img 
              src={`/api/stream?file_id=${page.telegram_file_id}&type=image`} 
              className="w-full h-full object-cover" 
              alt="" 
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
