'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowLeft,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useMedia } from '@/context/MediaContext';
import { Book } from '@/data/books';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import SortableTask from '@/components/kanban/SortableTask';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  category: string;
  created_at: string;
  due_date?: string;
  linked_book_id?: string;
  book?: Book; // Para exibir informações do livro vinculado
}

export default function KanbanPage() {
  const { playMedia } = useMedia();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Geral', status: 'todo' as 'todo' | 'doing' | 'done', due_date: '', linked_book_id: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Geral', 'Manga', 'SaaS', 'Música', 'Curso', 'Publishing'];
  const columns: { id: 'todo' | 'doing' | 'done', title: string, icon: any }[] = [
    { id: 'todo', title: 'A Fazer', icon: Circle },
    { id: 'doing', title: 'Fazendo', icon: Clock },
    { id: 'done', title: 'Concluído', icon: CheckCircle2 }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks(session.user.id);
        fetchBooks();
      }
    });
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*');
    if (data) setBooks(data);
  };

  const fetchTasks = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        setTasks([
          { id: '1', title: 'Terminar esboço do capítulo 5', description: 'Usar as novas artes como referência', status: 'todo', category: 'Manga', created_at: new Date().toISOString(), due_date: new Date().toISOString() },
          { id: '2', title: 'Configurar Webhook do Telegram', description: 'Ajustar para novas hashtags', status: 'doing', category: 'SaaS', created_at: new Date().toISOString() },
          { id: '3', title: 'Mixagem da faixa Suno #42', description: 'Ajustar graves e agudos', status: 'done', category: 'Música', created_at: new Date().toISOString() },
        ]);
      } else {
        setTasks(data || []);
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
    }

    setActiveTask(null);
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
      linked_book_id: newTask.linked_book_id || null
    };

    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    
    if (!error && data) {
      setTasks([data, ...tasks]);
    } else {
      setTasks([{ ...taskData, id: Math.random().toString(), created_at: new Date().toISOString() } as Task, ...tasks]);
    }
    
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', category: 'Geral', status: 'todo', due_date: '', linked_book_id: '' });
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border-custom glass-panel shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-full transition-colors text-text-dim hover:text-gold">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5 font-serif text-xl md:text-2xl text-gold tracking-tighter font-bold">
            <LayoutDashboard size={24} className="text-gold" />
            <span className="text-gradient">Project Kanban</span>
          </div>
          
          <div className="hidden md:flex relative ml-6">
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
            onClick={() => setIsModalOpen(true)}
            className="bg-gold text-bg px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold/20"
          >
            <Plus size={18} /> Nova Tarefa
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6 md:p-10 custom-scrollbar">
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
                onAddTask={(status) => {
                  setNewTask(prev => ({ ...prev, status }));
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeTask ? (
              <div className="w-[300px]">
                <SortableTask task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-panel p-8 rounded-3xl border-gold/20 shadow-2xl"
            >
              <h2 className="font-serif text-2xl text-text mb-6 flex items-center gap-2">
                <Plus className="text-gold" /> Nova Tarefa
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Título</label>
                  <input 
                    type="text" 
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-all"
                    placeholder="O que precisa ser feito?"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Descrição</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-all h-24 resize-none"
                    placeholder="Detalhes da tarefa..."
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Prazo de Entrega</label>
                  <input 
                    type="date" 
                    value={newTask.due_date}
                    onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-all text-text"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Vincular Projeto / Mídia</label>
                  <select 
                    value={newTask.linked_book_id}
                    onChange={e => setNewTask({...newTask, linked_book_id: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-all text-text appearance-none"
                  >
                    <option value="">Nenhum vínculo</option>
                    {books.map(book => (
                      <option key={book.id} value={book.id}>{book.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Projeto / Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setNewTask({...newTask, category: cat})}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${newTask.category === cat ? 'bg-gold text-bg border-gold' : 'border-border-custom text-text-dim hover:border-text'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border-custom text-text-dim font-bold hover:bg-surface-2 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={addTask}
                  className="flex-2 py-3 rounded-xl bg-gold text-bg font-bold hover:scale-105 transition-transform"
                >
                  Criar Tarefa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
