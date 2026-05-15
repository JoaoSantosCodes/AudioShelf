'use client';

import React, { useState, useEffect } from 'react';
import { books as initialBooks, Book } from '@/data/books';
import BookCard from '@/components/BookCard';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Headphones, 
  Library, 
  X, 
  Search, 
  RefreshCcw, 
  Database, 
  List, 
  Clock, 
  Play, 
  Calendar, 
  Activity, 
  TrendingUp,
  BarChart3, 
  Wallet, 
  ShoppingCart,
  Bell,
  CheckCircle2,
  Mic,
  Volume2,
  Send,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import MobileNav from '@/components/MobileNav';
import MediaExpandedView from '@/components/MediaExpandedView';
import GlobalSearch from '@/components/GlobalSearch';
import { useMedia } from '@/context/MediaContext';
import { processVoiceCommand } from '@/lib/commandProcessor';
import PresenceIndicator from '@/components/PresenceIndicator';
import { checkSmartAlerts, SmartNotification, generateDailyBriefing } from '@/lib/notificationEngine';

export default function Home() {
  const { activeMedia, playMedia, closeMedia } = useMedia();
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [smartNotifications, setSmartNotifications] = useState<any[]>([]);
  const [dailyBriefing, setDailyBriefing] = useState<any>(null);

  const handleVoiceInput = async () => {
    if (!user) return;
    setIsListening(true);
    
    // Simulação de IA Whisper extraindo comando
    setTimeout(async () => {
      const simulatedCommand = "Adicionar leite na lista de compras";
      const result = await processVoiceCommand(simulatedCommand, user.id);
      
      if (result.success) {
        // Atualiza os stats do dashboard
        const { count: shoppingCount } = await supabase.from('shopping_list').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', false);
        const { count: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'todo');
        
        setDashboardStats(prev => ({
          ...prev,
          shoppingCount: shoppingCount || 0,
          pendingTasks: pendingTasks || 0
        }));
      }
      setIsListening(false);
    }, 3000);
  };
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    expenses: 0,
    shoppingCount: 0,
    pendingTasks: 0
  });

  const notifications = [
    ...smartNotifications.map(n => ({
      ...n,
      icon: n.icon === 'Wallet' ? Wallet : (n.icon === 'Calendar' ? Calendar : (n.icon === 'TrendingUp' ? TrendingUp : Activity))
    })),
    ...(dashboardStats.pendingTasks > 0 ? [
      { id: 1, type: 'task', title: 'Missões Pendentes', text: `Você tem ${dashboardStats.pendingTasks} tarefas para hoje`, time: 'Agora', icon: Calendar, color: 'text-gold' },
    ] : [
      { id: 0, type: 'system', title: 'Sistema Pronto', text: 'Tudo sincronizado e atualizado.', time: 'Agora', icon: CheckCircle2, color: 'text-emerald-400' }
    ])
  ];

  const budget = 5000;
  const expensePercentage = Math.min(100, (dashboardStats.expenses / budget) * 100);

  const categories = ['Todos', 'Manga', 'Audiobook', 'Cursos', 'Música'];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchRecentActivities(session.user.id);
        fetchDashboardStats(session.user.id);
        checkSmartAlerts(session.user.id).then(setSmartNotifications);
        generateDailyBriefing(session.user.id).then(setDailyBriefing);
      }
      fetchBooks();
    });
  }, []);

  const fetchDashboardStats = async (userId: string) => {
    const [txRes, shopRes, tasksRes] = await Promise.all([
      supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'expense'),
      supabase.from('shopping_list').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', false),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId).neq('status', 'done')
    ]);
    const totalExp = txRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    setDashboardStats({
      expenses: totalExp,
      shoppingCount: shopRes.count || 0,
      pendingTasks: tasksRes.count || 0
    });
  };

  const fetchRecentActivities = async (userId: string) => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (data) setRecentActivities(data);
  };

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDbBooks(data);
    } else {
      setDbBooks(initialBooks);
    }
  };

  const handleUpdateProgress = async (bookId: string, updates: Partial<Book>) => {
    try {
      const { error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', bookId);
      
      if (error) throw error;
      
      setDbBooks(prev => prev.map(book => book.id === bookId ? { ...book, ...updates } : book));
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
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
          />
        )}
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed md:relative z-[110] w-72 h-screen bg-surface-1 border-r border-border-custom flex flex-col shrink-0 overflow-y-auto no-scrollbar shadow-2xl md:shadow-none"
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
              
              <Link href="/agenda" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <Calendar size={18} />
                <span className="text-sm font-semibold">Agenda Semanal</span>
              </Link>

              <Link href="/kanban" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <Database size={18} />
                <span className="text-sm font-semibold">Projetos & Kanban</span>
              </Link>

              <Link href="/insights" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <BarChart3 size={18} />
                <span className="text-sm font-semibold">Insights & Resultados</span>
              </Link>
              <Link href="/shopping" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <ShoppingCart size={18} />
                <span className="text-sm font-semibold">Lista de Mercado</span>
              </Link>

              <Link href="/financas" className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
                <Wallet size={18} />
                <span className="text-sm font-semibold">Finanças</span>
              </Link>

              <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Integrações</div>
              <button 
                onClick={() => setIsTelegramModalOpen(true)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all group"
              >
                <Send size={18} className="group-hover:text-sky-400 transition-colors" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">Telegram Bot</span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Ativo</span>
                </div>
              </button>

              <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Atividades Recentes</div>
              <div className="px-4 space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act, i) => (
                    <div key={i} className="flex gap-3 items-start group cursor-default">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                      <div>
                        <p className="text-[11px] leading-tight text-text-muted">
                          Você concluiu <span className="text-gold font-medium">{act.title}</span>
                        </p>
                        <span className="text-[9px] text-text-dim">Recentemente</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-text-dim px-2 italic">Nenhuma atividade recente.</p>
                )}
              </div>

              <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Categorias</div>
              <div className="grid grid-cols-1 gap-1">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat ? 'text-gold bg-gold/5' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
                  >
                    {cat === 'Todos' ? <List size={14} /> : <div className="w-1 h-1 rounded-full bg-text-dim/30" />}
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
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto no-scrollbar pb-24 md:pb-0">
        <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-text-muted hover:text-text">
              <List size={20} />
            </button>
            <h2 className="text-xl font-serif font-bold text-text">Sua Biblioteca</h2>
          </div>
          <div className="flex items-center gap-4">
            <PresenceIndicator />
            <GlobalSearch />
            <ThemeToggle />
            
            {/* VOICE ASSISTANT */}
            <button 
              onClick={handleVoiceInput}
              className={`w-10 h-10 rounded-full transition-all relative group flex items-center justify-center ${isListening ? 'bg-gold text-bg shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse' : 'bg-surface-2 text-text-muted hover:text-gold border border-border-custom hover:border-gold/30'}`}
            >
              {isListening ? <Volume2 size={18} className="animate-bounce" /> : <Mic size={18} />}
              {isListening && (
                <span className="absolute top-14 right-0 whitespace-nowrap text-[10px] font-bold text-gold uppercase tracking-widest bg-bg/80 backdrop-blur-md px-3 py-1 rounded-full border border-gold/20 z-50 shadow-xl">
                  Ouvindo Intenção...
                </span>
              )}
            </button>
            
            {/* NOTIFICATION CENTER */}
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
                    <div className="p-3 bg-surface-2 text-center">
                      <button className="text-[10px] font-bold text-text-dim uppercase tracking-widest hover:text-text transition-colors">Ver histórico completo</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-10">
          {/* SMART WIDGETS SECTION */}
          {/* BRIEFING AI SECTION */}
          {dailyBriefing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-gold/20 via-surface-1 to-surface-2 border border-gold/30 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} className="text-gold" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gold text-bg text-[9px] font-black uppercase tracking-[0.2em] rounded-full">Inteligência Estratégica</span>
                  <span className="text-[10px] font-bold text-gold/60">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-text">{dailyBriefing.title}</h2>
                <p className="text-sm text-text-muted max-w-2xl leading-relaxed">
                  {dailyBriefing.summary} {dailyBriefing.urgent > 0 ? `Atenção especial para as ${dailyBriefing.urgent} missões críticas.` : 'Seu dia parece sob controle.'}
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/kanban" className="px-6 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border-custom rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <Calendar size={14} className="text-gold" /> Ver Missões
                  </Link>
                  <Link href="/shopping" className="px-6 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border-custom rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <ShoppingCart size={14} className="text-gold" /> Lista de Mercado
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GASTOS WIDGET */}
            <Link href="/financas" className="group p-6 rounded-3xl bg-surface-1 border border-border-custom hover:border-red-500/30 transition-all shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wallet size={60} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Gastos do Mês</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text">R$ {dashboardStats.expenses.toLocaleString('pt-BR')}</span>
                <span className="text-[10px] font-bold text-red-400">-15% do limite</span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${expensePercentage}%` }}
                  className="h-full bg-red-400/50 rounded-full"
                />
              </div>
            </Link>

            {/* MERCADO WIDGET */}
            <Link href="/shopping" className="group p-6 rounded-3xl bg-surface-1 border border-border-custom hover:border-gold/30 transition-all shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShoppingCart size={60} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Lista de Mercado</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text">{dashboardStats.shoppingCount} Itens</span>
                <span className="text-[10px] font-bold text-gold">{dashboardStats.shoppingCount > 0 ? 'Faltam comprar' : 'Estoque em dia'}</span>
              </div>
              <div className="mt-4 flex -space-x-2">
                {dashboardStats.shoppingCount > 0 ? (
                  [1, 2, 3].slice(0, dashboardStats.shoppingCount).map(i => <div key={i} className="w-6 h-6 rounded-full bg-surface-3 border border-border-custom flex items-center justify-center text-[8px] font-bold text-gold">{i}</div>)
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-2 border border-border-custom flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                  </div>
                )}
              </div>
            </Link>

            {/* MISSÕES WIDGET */}
            <Link href="/kanban" className="group p-6 rounded-3xl bg-surface-1 border border-border-custom hover:border-emerald-500/30 transition-all shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar size={60} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Missões de Hoje</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-text">{dashboardStats.pendingTasks} Pendentes</span>
                <span className="text-[10px] font-bold text-emerald-400">Foco total</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted truncate">
                  {recentActivities.length > 0 ? `Próxima: ${recentActivities[0].title}` : 'Sem pendências'}
                </span>
              </div>
            </Link>
          </section>

          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif font-bold text-text">Sua Coleção</h3>
              <div className="flex bg-surface-2 p-1 rounded-xl border border-border-custom">
                {['Todos', 'Manga', 'Audiobook'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-gold text-bg shadow-lg' : 'text-text-muted hover:text-text'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

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
          </div>
        </div>
      </main>

      <MobileNav />
      <MediaExpandedView 
        onUpdateProgress={handleUpdateProgress}
      />

      {/* TELEGRAM CONNECTION MODAL */}
      <AnimatePresence>
        {isTelegramModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-1 border border-border-custom w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                      <Send className="text-sky-400" size={20} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-text">Conectar Telegram</h3>
                  </div>
                  <button onClick={() => setIsTelegramModalOpen(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-surface-2 rounded-2xl border border-border-custom text-xs leading-relaxed text-text-muted">
                    <p className="mb-2">Para receber alertas e resumos diários:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Inicie uma conversa com <span className="text-sky-400 font-bold">@MediaShelf_Bot</span></li>
                      <li>Envie o comando <span className="text-gold font-bold">/start</span></li>
                      <li>Cole o seu <span className="text-text font-bold">Chat ID</span> abaixo:</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Seu Telegram Chat ID</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 123456789"
                      value={telegramChatId}
                      onChange={e => setTelegramChatId(e.target.value)}
                      className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 px-6 text-sm font-mono focus:border-sky-400 outline-none transition-all"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      alert("Simulando envio de resumo para o Telegram...");
                      setIsTelegramModalOpen(false);
                    }}
                    className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Testar Notificação Push
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
