'use client';

import React, { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';
import { Book } from '@/data/books';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Headphones, 
  Library, 
  X, 
  List, 
  Bell,
  Sparkles,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BellOff,
  Brain as BrainIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/GlobalSearch';
import Link from 'next/link';
import { useMedia } from '@/context/MediaContext';
import { useNavigation } from '@/context/NavigationContext';
import { useAuth } from '@/context/AuthContext';
import HomeSkeleton from '@/components/HomeSkeleton';

export default function Home() {
  const { playMedia, closeMedia, activeMedia } = useMedia();
  const { selectedCategory, setSelectedCategory, isPureMode } = useNavigation();
  const { user } = useAuth();
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedBooks = localStorage.getItem('dbBooks');
    if (cachedBooks) {
      setDbBooks(JSON.parse(cachedBooks));
      setIsLoading(false); // Carrega do cache instantaneamente
    }
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDbBooks(data);
      localStorage.setItem('dbBooks', JSON.stringify(data));
    }
    setIsLoading(false);
  };

  const filteredBooks = dbBooks.filter(book => {
    return selectedCategory === 'Todos' || book.category === selectedCategory;
  });

  if (isLoading && dbBooks.length === 0) {
    return <HomeSkeleton />;
  }

  return (
    <div className={`transition-all duration-700 ${isPureMode ? 'bg-[#000]' : ''}`}>
      <motion.div 
        animate={{ 
          opacity: isPureMode ? (activeMedia ? 0 : 1) : 1,
          scale: isPureMode ? 0.98 : 1,
          filter: isPureMode ? 'grayscale(0.5)' : 'grayscale(0)'
        }}
        transition={{ duration: 0.8 }}
        className="flex-1"
      >
          <AnimatePresence mode="wait">
            {selectedCategory === 'Todos' ? (
              <motion.div
                key="featured"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* HERO IMMERSIVE */}
                {!isPureMode && (
                  <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 md:px-12 overflow-hidden border-b border-border-custom/30">
                    <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-noir)] opacity-50" />
                    <div className="max-w-5xl mx-auto text-center space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[10px] md:text-xs text-gold uppercase tracking-[0.2em]"
                      >
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        Olá, {user?.email?.split('@')[0] || 'Visitante'} • O Estúdio Criativo Definitivo
                      </motion.div>
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-serif font-bold tracking-tight leading-[0.95] text-gradient"
                      >
                        Sua mídia. <br />
                        <span className="text-text">Sem ruído.</span>
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm md:text-lg text-text-dim max-w-2xl mx-auto leading-relaxed"
                      >
                        Mangas, audiobooks e cursos em um único ambiente imersivo. Desenvolvido para quem trata o consumo de conteúdo como um ritual.
                      </motion.p>
                    </div>
                  </section>
                )}

                {/* BENTO LIBRARY GRID */}
                <section className={`max-w-7xl mx-auto px-6 space-y-8 ${isPureMode ? 'py-32' : 'py-12 md:py-24'}`}>
                  <div className="flex items-end justify-between px-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Curadoria</p>
                      <h2 className={`text-3xl md:text-5xl font-serif font-bold tracking-tight ${isPureMode ? 'text-text/50' : ''}`}>
                        {isPureMode ? 'Zen Library' : 'Sua Coleção'}
                      </h2>
                    </div>
                    {!isPureMode && (
                      <div className="text-right hidden md:block">
                        <p className="text-2xl font-black text-text">{dbBooks.length}</p>
                        <p className="text-[10px] text-text-dim uppercase tracking-widest">Ativos Totais</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
                    {/* MANGA - GRANDE DESTAQUE */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`${isPureMode ? 'md:col-span-3' : 'md:col-span-4'} md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-1 shadow-elegant transition-all duration-700`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent z-10" />
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
                      <div className="relative h-full flex flex-col justify-end p-8 z-20">
                        <BookOpen className="h-8 w-8 text-gold mb-4" />
                        <h3 className="text-4xl font-serif font-bold mb-2">Mangateca</h3>
                        {!isPureMode && <p className="text-sm text-text-dim max-w-md">Leitor tático com progresso silencioso e marcações imersivas.</p>}
                        <div className="mt-6">
                          <button 
                            onClick={() => {
                              const first = dbBooks.find(b => b.category === 'Manga');
                              if (first) playMedia(first);
                            }}
                            className="px-6 py-2.5 bg-gold text-bg rounded-xl text-xs font-bold hover:bg-gold-bright transition-all shadow-lg shadow-gold/20"
                          >
                            Continuar Lendo
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* AUDIOBOOKS - MÉDIO */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const first = dbBooks.find(b => b.category === 'Audiobook');
                        if (first) playMedia(first);
                      }}
                      className={`${isPureMode ? 'md:col-span-3' : 'md:col-span-2'} md:row-span-1 group cursor-pointer relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-2 transition-all duration-700`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent z-10" />
                      <div className="relative h-full flex flex-col justify-between p-6 z-20">
                        <Headphones className="h-6 w-6 text-gold" />
                        <div>
                          <h3 className="text-xl font-serif font-bold">Audiobooks</h3>
                          <p className="text-xs text-text-dim mt-1">{dbBooks.filter(b => b.category === 'Audiobook').length} títulos</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* CURSOS - MÉDIO */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        const first = dbBooks.find(b => b.category === 'Cursos');
                        if (first) playMedia(first);
                      }}
                      className={`${isPureMode ? 'md:col-span-3' : 'md:col-span-2'} md:row-span-1 group cursor-pointer relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-3 transition-all duration-700`}
                    >
                      <div className="relative h-full flex flex-col justify-between p-6">
                        <GraduationCap className="h-6 w-6 text-gold" />
                        <div>
                          <h3 className="text-xl font-serif font-bold">Estudos</h3>
                          <p className="text-xs text-text-dim mt-1">Udemy & Manuais</p>
                        </div>
                      </div>
                    </motion.div>

                    {!isPureMode && (
                      <>
                        {/* QUICK STATS */}
                        <div className="md:col-span-1 rounded-[2.5rem] border border-border-custom bg-surface-1 p-6 flex flex-col justify-between">
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                          <div>
                            <p className="text-2xl font-black text-text">84%</p>
                            <p className="text-[10px] text-text-dim uppercase tracking-widest">Foco</p>
                          </div>
                        </div>

                        {/* PURE MODE STATUS */}
                        <div className="md:col-span-1 rounded-[2.5rem] border border-border-custom bg-surface-2 p-6 flex flex-col justify-between">
                          <BellOff className="h-5 w-5 text-gold" />
                          <div>
                            <p className="text-lg font-bold text-text leading-tight">Pure Mode</p>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Pronto</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto px-6 pt-12"
              >
                 <div className="flex items-center gap-4 mb-8 border-b border-border-custom pb-8">
                   <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
                     <Sparkles className="text-gold" size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gold">Filtrado por</p>
                     <h2 className="text-3xl font-serif font-bold">{selectedCategory}</h2>
                   </div>
                   <button 
                    onClick={() => setSelectedCategory('Todos')}
                    className="ml-auto text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-gold transition-colors"
                   >
                     Limpar Filtro
                   </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACERVO COMPLETO */}
          {!isPureMode && (
            <section className="max-w-7xl mx-auto px-6 py-12 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-dim px-2">Acervo Completo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <AnimatePresence>
                  {filteredBooks.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      onClick={() => playMedia(book)} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}
        </motion.div>
    </div>
  );
}
