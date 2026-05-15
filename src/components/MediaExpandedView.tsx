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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
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

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl md:text-5xl font-serif font-black text-text mb-4 leading-tight">
                {activeMedia.title}
              </h2>
              <div className="flex items-center gap-4 text-text-dim">
                <span className="text-sm font-bold">{activeMedia.author}</span>
                <div className="w-1 h-1 rounded-full bg-text-dim/30" />
                <div className="flex items-center gap-1">
                  <Star className="text-gold" size={14} fill="currentColor" />
                  <span className="text-xs font-bold text-text">4.9</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-surface-2 border border-border-custom">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Clock size={12} /> Duração
                </p>
                <p className="text-sm font-bold text-text">{activeMedia.duration || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-2 border border-border-custom">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1 flex items-center gap-2">
                  <TrendingUp size={12} /> Progresso
                </p>
                <p className="text-sm font-bold text-text">{activeMedia.progress || 0}% concluído</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-2 border border-border-custom col-span-2 md:col-span-1">
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Calendar size={12} /> Último Acesso
                </p>
                <p className="text-sm font-bold text-text">Hoje</p>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gold mb-4">Sinopse</h4>
                <p className="text-sm text-text-muted leading-relaxed font-medium">
                  {activeMedia.description || 'Uma jornada épica através do conhecimento e entretenimento. Explore cada detalhe desta obra prima agora mesmo.'}
                </p>
              </div>

              <div className="pt-6 border-t border-border-custom mt-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <button className="flex-1 py-4 bg-gold text-bg rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gold-bright transition-all shadow-xl shadow-gold/20">
                    <Play size={18} fill="currentColor" />
                    Começar {activeMedia.category === 'Manga' ? 'Leitura' : 'Audição'}
                  </button>
                  <button className="px-8 py-4 bg-surface-2 text-text-dim rounded-2xl font-bold text-xs hover:text-text transition-all border border-border-custom">
                    Adicionar aos Favoritos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
