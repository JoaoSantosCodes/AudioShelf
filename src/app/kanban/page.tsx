'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  Library,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  category: string;
  created_at: string;
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: 'Geral' });

  const categories = ['Geral', 'Manga', 'SaaS', 'Música', 'Curso', 'Publishing'];
  const columns: { id: 'todo' | 'doing' | 'done', title: string, icon: any }[] = [
    { id: 'todo', title: 'A Fazer', icon: Circle },
    { id: 'doing', title: 'Fazendo', icon: Clock },
    { id: 'done', title: 'Concluído', icon: CheckCircle2 }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchTasks(session.user.id);
    });
  }, []);

  const fetchTasks = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback para mock se a tabela não existir ainda
        setTasks([
          { id: '1', title: 'Terminar esboço do capítulo 5', description: 'Usar as novas artes como referência', status: 'todo', category: 'Manga', created_at: new Date().toISOString() },
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

  const addTask = async () => {
    if (!user || !newTask.title) return;
    
    const taskData = {
      user_id: user.id,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      status: 'todo'
    };

    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    
    if (!error && data) {
      setTasks([data, ...tasks]);
    } else {
      // Mock update if DB fails
      setTasks([{ ...taskData, id: Math.random().toString(), created_at: new Date().toISOString() } as Task, ...tasks]);
    }
    
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', category: 'Geral' });
  };

  const moveTask = async (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border-custom glass-panel shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-surface-2 rounded-full transition-colors text-text-dim hover:text-gold">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5 font-serif text-xl md:text-2xl text-gold tracking-tighter font-bold">
            <LayoutDashboard size={24} className="text-gold" />
            <span className="text-gradient">Project Kanban</span>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gold text-bg px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-gold/20"
        >
          <Plus size={18} /> Nova Tarefa
        </button>
      </header>

      {/* KANBAN BOARD */}
      <main className="flex-1 overflow-x-auto p-6 md:p-10 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-[900px]">
          {columns.map(column => (
            <div key={column.id} className="flex-1 flex flex-col min-w-[300px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-surface-2 border border-border-custom ${column.id === 'doing' ? 'text-amber' : column.id === 'done' ? 'text-green' : 'text-text-dim'}`}>
                    <column.icon size={18} />
                  </div>
                  <h2 className="font-semibold text-text tracking-wide uppercase text-[12px]">{column.title}</h2>
                  <span className="bg-surface-3 text-text-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {tasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <button className="text-text-muted hover:text-text"><MoreHorizontal size={18} /></button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10">
                {tasks.filter(t => t.status === column.id).map(task => (
                  <div 
                    key={task.id}
                    className="glass-card p-4 group cursor-default hover:border-gold/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/10">
                        {task.category}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {column.id !== 'todo' && (
                          <button onClick={() => moveTask(task.id, column.id === 'doing' ? 'todo' : 'doing')} className="p-1 hover:text-gold"><ArrowLeft size={14} /></button>
                        )}
                        {column.id !== 'done' && (
                          <button onClick={() => moveTask(task.id, column.id === 'todo' ? 'doing' : 'done')} className="p-1 hover:text-gold"><ChevronRight size={14} /></button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-[14px] font-semibold text-text mb-1 group-hover:text-gold transition-colors">{task.title}</h3>
                    <p className="text-[12px] text-text-dim line-clamp-2 leading-relaxed mb-4">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border-custom">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-bg bg-surface-3 flex items-center justify-center text-[10px] font-bold">JS</div>
                      </div>
                      <span className="text-[10px] text-text-muted font-medium">
                        {new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => {
                    setIsModalOpen(true);
                    setNewTask({ ...newTask, status: column.id } as any);
                  }}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border-custom text-text-muted hover:border-gold/30 hover:text-gold transition-all text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL ADICIONAR TAREFA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-gold/20 shadow-2xl animate-in zoom-in-95 duration-300">
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
          </div>
        </div>
      )}
    </div>
  );
}
