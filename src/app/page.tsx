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
  BellOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import MobileNav from '@/components/MobileNav';
import MediaExpandedView from '@/components/MediaExpandedView';
import GlobalSearch from '@/components/GlobalSearch';
import { useMedia } from '@/context/MediaContext';
import HomeSkeleton from '@/components/HomeSkeleton';

export default function Home() {
  const { playMedia, closeMedia, activeMedia } = useMedia();
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const categories = ['Todos', 'Manga', 'Audiobook', 'Cursos', 'Música'];

  const notifications = [
    { id: 0, type: 'system', title: 'Sistema Pronto', text: 'Sua biblioteca está sincronizada.', time: 'Agora', icon: Bell, color: 'text-emerald-400' }
  ];

  useEffect(() => {
    const cachedBooks = localStorage.getItem('dbBooks');
    if (cachedBooks) setDbBooks(JSON.parse(cachedBooks));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
      fetchBooks();
    });
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
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={`fixed md:sticky top-0 left-0 z-[110] w-72 h-screen bg-surface-1 border-r border-border-custom flex flex-col shrink-0 overflow-y-auto no-scrollbar shadow-2xl md:shadow-none transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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

          <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Categorias</div>
          <div className="grid grid-cols-1 gap-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat ? 'text-gold bg-gold/5' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
              >
                <div className={selectedCategory === cat ? "w-1 h-1 rounded-full bg-gold" : "w-1 h-1 rounded-full bg-text-dim/30"} />
                {cat}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-border-custom bg-surface-1/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center border border-white/5 shadow-xl">
              <span className="text-xs font-bold text-gold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text truncate">{user?.email || 'Visitante'}</p>
              <p className="text-[10px] text-text-dim truncate">Membro Premium</p>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto no-scrollbar pb-32 md:pb-0">
        <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-text-muted hover:text-text bg-surface-2 rounded-lg">
              <List size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-serif font-bold text-text truncate">Sua Biblioteca</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <GlobalSearch />
            <ThemeToggle />
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`w-10 h-10 rounded-full bg-surface-2 border border-border-custom flex items-center justify-center transition-all relative ${isNotificationsOpen ? 'text-gold border-gold/50 shadow-lg shadow-gold/10' : 'text-text-muted hover:text-gold'}`}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background shadow-sm" />
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 right-0 w-80 bg-surface-1 border border-border-custom rounded-3xl shadow-2xl overflow-hidden z-50 glass-panel"
                  >
                    <div className="p-5 border-b border-border-custom bg-surface-2/50 flex items-center justify-between">
                      <h3 className="text-sm font-serif font-bold text-text">Notificações</h3>
                      <button className="text-[10px] font-bold text-gold uppercase tracking-widest hover:underline">Limpar Tudo</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto no-scrollbar divide-y divide-border-custom">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 hover:bg-surface-2 transition-colors flex gap-4 cursor-pointer group">
                          <div className={`p-2 rounded-xl bg-surface-3 ${notif.color} border border-white/5`}>
                            <notif.icon size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="text-xs font-bold text-text group-hover:text-gold transition-colors">{notif.title}</span>
                              <span className="text-[9px] text-text-dim font-medium">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-tight">{notif.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* HERO IMMERSIVE */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 md:px-12 overflow-hidden border-b border-border-custom/30">
          <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-noir)] opacity-50" />
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-[10px] md:text-xs text-gold uppercase tracking-[0.2em]"
            >
              <Sparkles className="h-3 w-3 animate-pulse" />
              O Estúdio Criativo Definitivo
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

        {/* BENTO LIBRARY GRID */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-8">
          <div className="flex items-end justify-between px-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-2">Curadoria</p>
              <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">Sua Coleção</h2>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-2xl font-black text-text">{dbBooks.length}</p>
              <p className="text-[10px] text-text-dim uppercase tracking-widest">Ativos Totais</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
            {/* MANGA - GRANDE DESTAQUE */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-1 shadow-elegant"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
              <div className="relative h-full flex flex-col justify-end p-8 z-20">
                <BookOpen className="h-8 w-8 text-gold mb-4" />
                <h3 className="text-4xl font-serif font-bold mb-2">Mangateca</h3>
                <p className="text-sm text-text-dim max-w-md">Leitor tático com progresso silencioso e marcações imersivas.</p>
                <div className="mt-6">
                  <button className="px-6 py-2.5 bg-gold text-bg rounded-xl text-xs font-bold hover:bg-gold-bright transition-all shadow-lg shadow-gold/20">
                    Continuar Lendo
                  </button>
                </div>
              </div>
            </motion.div>

            {/* AUDIOBOOKS - MÉDIO */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent z-10" />
              <div className="relative h-full flex flex-col justify-between p-6 z-20">
                <Headphones className="h-6 w-6 text-gold" />
                <div>
                  <h3 className="text-xl font-serif font-bold">Audiobooks</h3>
                  <p className="text-xs text-text-dim mt-1">{dbBooks.filter(b => b.category === 'Audiobook').length} títulos processados</p>
                </div>
              </div>
            </motion.div>

            {/* CURSOS - MÉDIO */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] border border-border-custom bg-surface-3"
            >
              <div className="relative h-full flex flex-col justify-between p-6">
                <GraduationCap className="h-6 w-6 text-gold" />
                <div>
                  <h3 className="text-xl font-serif font-bold">Estudos</h3>
                  <p className="text-xs text-text-dim mt-1">Udemy & Manuais</p>
                </div>
              </div>
            </motion.div>

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
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Ativo</p>
              </div>
            </div>
          </div>
        </section>

        {/* LISTA DE MÍDIAS (LEGACY LIST) */}
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
      </div>

      <MobileNav />
      <MediaExpandedView 
        onUpdateProgress={fetchBooks}
      />
    </div>
  );
}
