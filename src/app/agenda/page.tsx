'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Circle,
  MoreHorizontal,
  Home,
  Film,
  Utensils,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';

interface AgendaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  start_time?: string;
  is_completed: boolean;
  scheduled_date: string;
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lazer': return <Film size={12} />;
      case 'Social': return <Utensils size={12} />;
      case 'Saúde': return <Dumbbell size={12} />;
      case 'Casa': return <Home size={12} />;
      default: return null;
    }
  };

  // Gerar os dias da semana atual
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // Começa na Segunda
    
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAgendaItems(session.user.id);
    });
  }, [currentDate]);

  const fetchAgendaItems = async (userId: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .not('due_date', 'is', null);
    
    if (data) {
      setItems(data.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        is_completed: t.status === 'done',
        scheduled_date: t.due_date
      })));
    }
    setIsLoading(false);
  };

  const toggleComplete = async (item: AgendaItem) => {
    const newStatus = item.is_completed ? 'todo' : 'done';
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', item.id);
    
    if (!error) {
      setItems(items.map(i => i.id === item.id ? { ...i, is_completed: !i.is_completed } : i));
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER TÁTICO */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold">
            <Home size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold flex items-center gap-3">
              <CalendarIcon className="text-gold" size={22} />
              Agenda Semanal
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-2 p-1 rounded-xl border border-border-custom">
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() - 7);
                setCurrentDate(newDate);
              }}
              className="p-2 text-text-dim hover:text-gold transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 text-xs font-bold uppercase tracking-widest text-text-muted">
              {weekDays[0].toLocaleDateString('pt-BR', { month: 'short' })} {weekDays[0].getDate()} - {weekDays[6].getDate()}
            </span>
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(currentDate.getDate() + 7);
                setCurrentDate(newDate);
              }}
              className="p-2 text-text-dim hover:text-gold transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <ThemeToggle />
          <button className="px-5 py-2 bg-gold text-bg rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gold-bright transition-all shadow-lg shadow-gold/20">
            <Plus size={16} /> Novo Plano
          </button>
        </div>
      </header>

      {/* AGENDA GRID */}
      <main className="flex-1 overflow-x-auto no-scrollbar p-8">
        <div className="flex gap-6 min-w-[1200px] h-full">
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayItems = items.filter(item => item.scheduled_date.startsWith(dateStr));
            const isToday = new Date().toDateString() === day.toDateString();

            return (
              <div key={idx} className="flex-1 flex flex-col min-w-[200px]">
                {/* DAY HEADER */}
                <div className={`mb-6 p-4 rounded-2xl border transition-all ${isToday ? 'bg-gold/10 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-surface-1 border-border-custom'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-gold' : 'text-text-dim'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-serif font-bold ${isToday ? 'text-text' : 'text-text-muted'}`}>
                      {day.getDate()}
                    </span>
                    {isToday && <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
                  </div>
                </div>

                {/* DAY ITEMS */}
                <div className="flex-1 space-y-3">
                  {dayItems.length === 0 ? (
                    <div className="h-32 rounded-2xl border-2 border-dashed border-border-custom flex items-center justify-center text-text-dim/30 hover:border-gold/20 hover:text-gold/20 transition-all cursor-pointer">
                      <Plus size={24} />
                    </div>
                  ) : (
                    dayItems.map(item => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border border-border-custom bg-surface-2 group hover:border-gold/30 transition-all ${item.is_completed ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <button 
                            onClick={() => toggleComplete(item)}
                            className={`transition-colors ${item.is_completed ? 'text-green-500' : 'text-text-muted hover:text-gold'}`}
                          >
                            {item.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </button>
                          <button className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        
                        <h4 className={`text-sm font-bold mb-1 ${item.is_completed ? 'line-through text-text-dim' : 'text-text'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-text-muted line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/10 flex items-center gap-1.5">
                            {getCategoryIcon(item.category)}
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-text-dim font-bold">
                            <Clock size={12} />
                            Plan
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
