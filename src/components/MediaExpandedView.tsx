'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Clock, 
  BookOpen, 
  Star, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Headphones,
  FileText
} from 'lucide-react';
import { Book } from '@/data/books';
import { useMedia } from '@/context/MediaContext';
import UniversalPlayer from './UniversalPlayer';

interface MediaExpandedViewProps {
  onUpdateProgress?: (bookId: string, updates: Partial<Book>) => void;
}

export default function MediaExpandedView({ onUpdateProgress }: MediaExpandedViewProps) {
  const { activeMedia, closeMedia } = useMedia();

  if (!activeMedia) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
        <motion.div 
          layoutId={`book-${activeMedia.id}`}
          className="w-full max-w-5xl max-h-[90vh] bg-surface-1 border border-border-custom rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
        >
          {/* BOTÃO FECHAR */}
          <button 
            onClick={closeMedia}
            className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* CAPA & INFO LATERAL */}
          <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden group">
            <img 
              src={activeMedia.cover} 
              alt={activeMedia.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gold/90 text-bg text-[10px] font-black uppercase tracking-widest">
                  {activeMedia.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                  Premium
                </span>
              </div>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL (PLAYER) */}
          <div className="flex-1 p-4 md:p-8 flex flex-col min-h-0">
             <UniversalPlayer media={activeMedia} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
