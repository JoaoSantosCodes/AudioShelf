'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Library, 
  Plus, 
  Database, 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Search,
  Calendar,
  X,
  Repeat,
  MoreHorizontal,
  Home,
  Share2,
  Mail,
  Send,
  BarChart3,
  Wallet,
  ShoppingCart,
  Mic,
  Volume2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import SortableTask from '@/components/kanban/SortableTask';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { books as initialBooks, Book } from '@/data/books';
import { useMedia } from '@/context/MediaContext';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'todo' | 'doing' | 'done';
  due_date?: string;
  created_at: string;
  linked_book_id?: string;
  is_recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

export default function KanbanPage() {
  const { playMedia } = useMedia();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    category: 'Geral', 
    status: 'todo' as 'todo' | 'doing' | 'done', 
    due_date: '', 
    linked_book_id: '',
    is_recurring: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Geral', 'Manga', 'SaaS', 'Música', 'Curso', 'Lazer', 'Social', 'Saúde', 'Casa'];
  const columns: { id: 'todo' | 'doing' | 'done', title: string, icon: any }[] = [
    { id: 'todo', title: 'A Fazer', icon: Circle },
    { id: 'doing', title: 'Fazendo', icon: Clock },
    { id: 'done', title: 'Concluído', icon: CheckCircle2 },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchInitialData(session.user.id);

        // ASSINATURA REALTIME KANBAN
        const channel = supabase
          .channel('kanban_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setTasks(prev => [payload.new as Task, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
              } else if (payload.eventType === 'DELETE') {
                setTasks(prev => prev.filter(t => t.id !== payload.old.id));
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });
  }, []);

  const fetchInitialData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [tasksRes, booksRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('books').select('*')
      ]);

      if (booksRes.data) setBooks(booksRes.data);
      if (tasksRes.data) {
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let newStatus: 'todo' | 'doing' | 'done' | null = null;
    
    if (['todo', 'doing', 'done'].includes(overId)) {
      newStatus = overId as any;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus && activeTask && activeTask.status !== newStatus) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus! } : t));
      await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);

      // LÓGICA DE RECURSÃO: Se a tarefa foi para 'done' e é recorrente, cria a próxima
      if (newStatus === 'done' && activeTask.is_recurring) {
        const nextDate = new Date(activeTask.due_date || new Date());
        if (activeTask.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        else if (activeTask.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        else if (activeTask.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

        const nextTaskData = {
          user_id: user?.id,
          title: activeTask.title,
          description: activeTask.description,
          category: activeTask.category,
          status: 'todo',
          due_date: nextDate.toISOString().split('T')[0],
          is_recurring: true,
          frequency: activeTask.frequency,
          linked_book_id: activeTask.linked_book_id
        };

        const { data: nextTask, error } = await supabase.from('tasks').insert(nextTaskData).select().single();
        if (!error && nextTask) {
          setTasks(prev => [nextTask, ...prev]);
        }
      }
    }

    setActiveTask(null);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Simulação de IA Whisper
    setTimeout(() => {
      setNewTask({ ...newTask, title: 'Terminar relatório de arquitetura' });
      setIsListening(false);
    }, 3000);
  };

  const addTask = async () => {
    if (!user || !newTask.title) return;
    
    const taskData = {
      user_id: user.id,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      status: newTask.status,
      due_date: newTask.due_date || null,
      linked_book_id: newTask.linked_book_id || null,
      is_recurring: newTask.is_recurring,
      frequency: newTask.is_recurring ? newTask.frequency : null,
      priority: newTask.priority
    };

    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    
    if (!error && data) {
      setTasks([data, ...tasks]);
    }
    
    setIsModalOpen(false);
    setNewTask({ 
      title: '', 
      description: '', 
      category: 'Geral', 
      status: 'todo', 
      due_date: '', 
      linked_book_id: '',
      is_recurring: false,
      frequency: 'weekly',
      priority: 'medium' as 'low' | 'medium' | 'high'
    });
  };

  const handleSendInvite = () => {
    if (inviteEmail) {
      alert(`Convite enviado para ${inviteEmail}! (Simulação de integração Supabase)`);
      setInviteEmail('');
      setIsShareModalOpen(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* HEADER TÁTICO */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border-custom glass-panel shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold">
            <Home size={20} />
          </Link>
          <Link href="/agenda" className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
            <Calendar size={18} />
            <span className="text-sm font-semibold">Agenda Semanal</span>
          </Link>

          <Link href="/insights" className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
            <BarChart3 size={18} />
            <span className="text-sm font-semibold">Insights</span>
          </Link>

          <Link href="/financas" className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
            <Wallet size={18} />
            <span className="text-sm font-semibold">Finanças</span>
          </Link>

          <Link href="/shopping" className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-muted hover:bg-surface-2 hover:text-text transition-all">
            <ShoppingCart size={18} />
            <span className="text-sm font-semibold">Mercado</span>
          </Link>

          <div className="flex items-center gap-2.5 font-serif text-xl md:text-2xl text-gold tracking-tighter font-bold ml-4">
            <LayoutDashboard size={24} className="text-gold" />
            <span className="text-gradient">Project Kanban</span>
          </div>
          
          <div className="hidden lg:flex relative ml-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input 
              type="text" 
              placeholder="Pesquisar tarefas..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-surface-2 border border-border-custom rounded-full py-1.5 pl-9 pr-4 text-xs outline-none focus:border-gold/50 transition-all w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 rounded-xl bg-surface-2 border border-border-custom text-text-dim hover:text-gold hover:border-gold/30 transition-all"
            title="Convidar Colaborador"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-bg px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold/20"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        </div>
      </header>

      {/* BOARD CONTENT */}
      <main className="flex-1 overflow-x-auto p-6 md:p-10 no-scrollbar">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-[900px]">
            {columns.map(column => (
              <KanbanColumn 
                key={column.id}
                id={column.id}
                title={column.title}
                icon={column.icon}
                tasks={filteredTasks.filter(t => t.status === column.id)}
                books={books}
                onPlay={playMedia}
                onAddTask={(status) => {
                  setNewTask(prev => ({ ...prev, status }));
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.5' } }
            })
          }}>
            {activeTask ? (
              <div className="w-[280px]">
                <SortableTask 
                  task={activeTask} 
                  linkedBook={books.find(b => b.id === activeTask.linked_book_id)}
                  onPlay={playMedia}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* MODAL NOVA TAREFA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-1 border border-border-custom w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif font-bold text-text">Nova Missão</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Qual a missão de hoje?"
                      value={newTask.title}
                      onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 pl-6 pr-16 text-lg font-semibold focus:border-gold/50 outline-none transition-all"
                    />
                    <button 
                      onClick={handleVoiceInput}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${isListening ? 'bg-gold text-bg animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-surface-3 text-text-dim hover:text-gold'}`}
                    >
                      {isListening ? <Volume2 size={20} className="animate-bounce" /> : <Mic size={20} />}
                    </button>
                  </div>
                  
                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2"
                    >
                      <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] animate-pulse">Ouvindo sua voz...</span>
                    </motion.div>
                  )}
                  
                  <textarea 
                    placeholder="Descrição detalhada..."
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 px-6 h-32 focus:border-gold/50 outline-none transition-all resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Categoria</label>
                      <select 
                        value={newTask.category}
                        onChange={e => setNewTask({...newTask, category: e.target.value})}
                        className="w-full bg-surface-2 border border-border-custom rounded-xl py-3 px-4 text-sm focus:border-gold/50 outline-none transition-all appearance-none"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Prazo / Agenda</label>
                      <input 
                        type="date"
                        value={newTask.due_date}
                        onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                        className="w-full bg-surface-2 border border-border-custom rounded-xl py-3 px-4 text-sm focus:border-gold/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* RECORRÊNCIA UI */}
                  <div className="p-4 rounded-2xl bg-surface-2 border border-border-custom space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-all ${newTask.is_recurring ? 'bg-gold/20 text-gold' : 'bg-surface-3 text-text-dim'}`}>
                          <Repeat size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text">Tarefa Recorrente</p>
                          <p className="text-[10px] text-text-dim">Repetir automaticamente esta missão</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setNewTask({...newTask, is_recurring: !newTask.is_recurring})}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${newTask.is_recurring ? 'bg-gold' : 'bg-surface-3'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${newTask.is_recurring ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {newTask.is_recurring && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-2 pt-2"
                      >
                        {['daily', 'weekly', 'monthly'].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setNewTask({...newTask, frequency: freq as any})}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${newTask.frequency === freq ? 'bg-gold/10 border-gold text-gold' : 'border-border-custom text-text-dim hover:text-text'}`}
                          >
                            {freq === 'daily' ? 'Diário' : freq === 'weekly' ? 'Semanal' : 'Mensal'}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Vincular a Mídia (Opcional)</label>
                    <select 
                      value={newTask.linked_book_id}
                      onChange={e => setNewTask({...newTask, linked_book_id: e.target.value})}
                      className="w-full bg-surface-2 border border-border-custom rounded-xl py-3 px-4 text-sm focus:border-gold/50 outline-none transition-all appearance-none"
                    >
                      <option value="">Nenhuma mídia vinculada</option>
                      {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-text-muted hover:bg-surface-2 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={addTask}
                    className="flex-1 py-4 bg-gold text-bg rounded-2xl font-bold hover:bg-gold-bright transition-all shadow-xl shadow-gold/20"
                  >
                    Criar Missão
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE COMPARTILHAMENTO */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-1 border border-border-custom w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-gold">
                    <Share2 size={24} />
                    <h3 className="text-2xl font-serif font-bold text-text">Convidar Família</h3>
                  </div>
                  <button onClick={() => setIsShareModalOpen(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
                </div>

                <p className="text-sm text-text-dim leading-relaxed">
                  Trabalhe em conjunto! Convide membros da sua família ou equipe para gerenciar este board de projetos.
                </p>

                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold transition-colors" size={18} />
                    <input 
                      type="email" 
                      placeholder="E-mail do convidado..."
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-gold/50 transition-all"
                    />
                  </div>

                  <button 
                    onClick={handleSendInvite}
                    className="w-full py-4 bg-gold text-bg rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gold-bright transition-all shadow-xl shadow-gold/20"
                  >
                    <Send size={18} /> Enviar Convite
                  </button>
                </div>

                <div className="pt-4 border-t border-border-custom">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-4">Colaboradores Ativos</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-gold border border-gold/20">EU</div>
                    <p className="text-xs text-text-muted font-medium">Você (Proprietário)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
