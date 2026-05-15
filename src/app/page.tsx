'use client';

import React, { useState, useEffect } from 'react';
import { books as initialBooks, Book } from '@/data/books';
import BookCard from '@/components/BookCard';
import ThemeToggle from '@/components/ThemeToggle';
import { Headphones, Library, X, Search, RefreshCcw, Database, List, Clock, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '@/context/MediaContext';

export default function Home() {
  const { playMedia, activeMedia, closeMedia } = useMedia();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Audiobook', 'Vídeo', 'Música', 'Curso', 'Manga', 'SaaS', 'Publishing'];

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformed = data.map((b: any) => ({
        ...b,
        category: b.category || 'Audiobook',
        chapters: b.chapters || []
      }));
      
      setDbBooks(transformed);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
      setDbBooks(initialBooks);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchBooks();

    return () => subscription.unsubscribe();
  }, []);

  const deleteBook = async (bookId: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
    
    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
      
      alert("Livro excluído com sucesso!");
      setDbBooks(prev => prev.filter(b => b.id !== bookId));
      if (activeMedia?.id === bookId) closeMedia();
      
    } catch (err: any) {
      console.error("Erro fatal na exclusão:", err);
      alert("Erro ao excluir: " + err.message);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!activeMedia || !confirm("Remover este capítulo?")) return;
    
    try {
      const updatedChapters = activeMedia.chapters.filter(c => c.id !== chapterId);
      const { error } = await supabase
        .from('books')
        .update({ chapters: updatedChapters })
        .eq('id', activeMedia.id);

      if (error) throw error;
      
      setDbBooks(prev => prev.map(b => 
        b.id === activeMedia.id ? { ...b, chapters: updatedChapters } : b
      ));
      
      playMedia({ ...activeMedia, chapters: updatedChapters });
    } catch (err: any) {
      alert("Erro ao remover capítulo: " + err.message);
    }
  };

  const updateBookData = async (bookId: string, updates: any) => {
    try {
      const { error } = await supabase.from('books').update(updates).eq('id', bookId);
      if (error) throw error;
      
      setDbBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...updates } : b));
      if (activeMedia?.id === bookId) {
        playMedia({ ...activeMedia, ...updates });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar:", err);
    }
  };

  const filteredBooks = dbBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed md:relative z-50 w-72 h-full bg-surface-1 border-r border-border-custom flex flex-col shrink-0"
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <Headphones className="text-bg" size={20} />
                </div>
                <h1 className="text-xl font-serif font-bold tracking-tight text-text">MediaShelf</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Menu Principal</div>
              <button 
                onClick={() => { closeMedia(); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${!activeMedia ? 'bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
              >
                <Library size={18} />
                <span className="text-sm font-semibold">Biblioteca</span>
              </button>
              
              <Link href="/kanban" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <Database size={18} />
                <span className="text-sm font-semibold">Projetos & Kanban</span>
              </Link>

              <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Categorias</div>
              <div className="grid grid-cols-1 gap-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'text-gold' : 'text-text-dim hover:text-text'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat ? 'bg-gold' : 'bg-transparent'}`} />
                    {cat}
                  </button>
                ))}
              </div>
            </nav>

            <div className="p-6 border-t border-border-custom bg-black/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Modo Admin</span>
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`w-10 h-5 rounded-full p-1 transition-all ${isAdminMode ? 'bg-gold' : 'bg-surface-3'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-all ${isAdminMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <ThemeToggle />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-text hover:text-gold transition-colors">
            <List size={24} />
          </button>

          <div className="flex-1 max-w-xl mx-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar na sua biblioteca de elite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-2 border border-border-custom rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/5 transition-all text-text"
            />
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={fetchBooks}
              disabled={isLoading}
              className="flex items-center gap-2 text-text-muted hover:text-gold transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-gold/30 p-0.5 shadow-lg shadow-gold/10">
              <div className="w-full h-full rounded-full bg-surface-3 flex items-center justify-center text-gold font-bold text-sm">JS</div>
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {/* HERO SECTION */}
          <div className="px-8 pt-10 pb-6">
            <AnimatePresence mode="wait">
              {activeMedia && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative h-[400px] rounded-3xl overflow-hidden border border-border-custom group shadow-2xl"
                >
                  <img src={activeMedia.cover} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      {isAdminMode ? (
                        <input 
                          defaultValue={activeMedia.title}
                          onBlur={(e) => updateBookData(activeMedia.id, { title: e.target.value })}
                          className="text-5xl font-serif font-black text-text bg-transparent border-b border-dashed border-gold/30 outline-none w-full"
                        />
                      ) : (
                        <h2 className="text-5xl md:text-6xl font-serif font-black text-text tracking-tight leading-none">
                          {activeMedia.title}
                        </h2>
                      )}
                      
                      <div className="flex items-center gap-6 text-text-dim font-medium text-sm">
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="text-gold" />
                          {activeMedia.duration}
                        </span>
                        <span className="flex items-center gap-2">
                          <List size={16} className="text-gold" />
                          {activeMedia.chapters.length} Capítulos
                        </span>
                        <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold/20">
                          {activeMedia.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="px-8 py-4 bg-gold text-bg rounded-2xl font-bold flex items-center gap-3 hover:bg-gold-bright transition-all shadow-xl shadow-gold/20 group">
                        <Play size={20} fill="currentColor" /> Ouvir Agora
                      </button>
                      <button className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-text hover:bg-white/10 transition-all">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GRID SECTION */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-serif font-bold text-text mb-2">
                  {activeMedia ? "Outros da Biblioteca" : "Sua Biblioteca"}
                </h3>
                <p className="text-sm text-text-dim">Curadoria exclusiva dos seus projetos digitais.</p>
              </div>
              <div className="flex gap-2 bg-surface-2 p-1 rounded-xl border border-border-custom">
                <button className="p-2 text-gold bg-background rounded-lg shadow-sm"><List size={18} /></button>
                <button className="p-2 text-text-dim hover:text-text"><RefreshCcw size={18} /></button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="aspect-[3/4] rounded-2xl bg-surface-2 animate-pulse" />
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6">
                  <Database className="text-text-dim" size={32} />
                </div>
                <h4 className="text-xl font-bold text-text mb-2">Nenhum projeto encontrado</h4>
                <p className="text-text-dim">Envie arquivos para seu bot do Telegram para começar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredBooks.map((book) => (
                  <motion.div 
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group"
                  >
                    {isAdminMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }}
                        className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <BookCard 
                      book={book} 
                      onSelect={playMedia} 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* O Player e o Reader agora são renderizados pelo GlobalMediaContainer no layout.tsx */}
    </div>
  );
}

function Share2({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
