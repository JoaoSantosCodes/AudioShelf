'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Dumbbell, 
  Flame, 
  Target, 
  Award,
  ChevronLeft,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';

export default function InsightsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    completedTasks: 0,
    streak: 5,
    healthFocus: 85,
    weightData: { current: 82, change: -3.2 },
    gymFrequency: 4
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchStats(session.user.id);
    });
  }, []);

  const fetchStats = async (userId: string) => {
    setIsLoading(true);
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'done');
    
    if (count !== null) setStats(prev => ({ ...prev, completedTasks: count }));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER EXECUTIVO */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold">
            <Home size={20} />
          </Link>
          <h1 className="text-xl font-serif font-bold flex items-center gap-3">
            <BarChart3 className="text-gold" size={22} />
            Insights de Progresso
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-gold/10 rounded-xl border border-gold/20 flex items-center gap-2">
            <Flame className="text-gold" size={16} />
            <span className="text-xs font-bold text-gold uppercase tracking-widest">{stats.streak} Dias em Sequência</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* TOP CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-1 border border-border-custom p-6 rounded-3xl relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Target size={80} className="text-gold" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Total de Missões</p>
              <h2 className="text-5xl font-black text-text mb-4">{stats.completedTasks}</h2>
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                <TrendingUp size={14} /> +12% esta semana
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-1 border border-border-custom p-6 rounded-3xl relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Dumbbell size={80} className="text-blue-400" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Frequência Academia</p>
              <h2 className="text-5xl font-black text-text mb-4">{stats.gymFrequency}x</h2>
              <p className="text-xs text-text-muted font-medium">Meta semanal de 5 treinos</p>
              <div className="mt-4 w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '80%' }} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-1 border border-border-custom p-6 rounded-3xl relative overflow-hidden group shadow-xl border-gold/30"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Award size={80} className="text-gold" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2">Nível do Hub</p>
              <h2 className="text-5xl font-black text-text mb-4 italic">Pro</h2>
              <div className="flex items-center gap-2 text-gold text-xs font-bold">
                Mestre Organizador
              </div>
            </motion.div>
          </div>

          {/* HEALTH DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-2 border border-border-custom p-8 rounded-3xl shadow-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-serif font-bold text-text flex items-center gap-3">
                  <TrendingUp className="text-green-400" size={20} />
                  Evolução Corporal
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim bg-surface-3 px-3 py-1 rounded-full">Últimos 30 dias</span>
              </div>
              
              <div className="flex items-end gap-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-1">Peso Atual</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-text">{stats.weightData.current}</span>
                    <span className="text-xl font-bold text-text-dim">kg</span>
                  </div>
                </div>
                <div className="pb-2">
                  <div className={`flex items-center gap-1 font-bold ${stats.weightData.change < 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.weightData.change < 0 ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    {Math.abs(stats.weightData.change)} kg
                  </div>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Total perdido</p>
                </div>
              </div>

              <div className="mt-12 h-32 flex items-end gap-3">
                {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-gold/20 group-hover:bg-gold/40 rounded-t-lg transition-all duration-500" 
                      style={{ height: `${h}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-bg text-[10px] font-bold px-2 py-1 rounded">
                      {h}kg
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-bold text-text-dim uppercase tracking-widest">
                <span>Semana 1</span>
                <span>Semana 2</span>
                <span>Semana 3</span>
                <span>Semana 4</span>
              </div>
            </motion.div>

            {/* CATEGORY BREAKDOWN */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-2 border border-border-custom p-8 rounded-3xl shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-serif font-bold text-text mb-8">Foco de Atividade</h3>
              <div className="flex-1 space-y-6">
                {[
                  { name: "Estudos & Cursos", val: 45, color: "bg-gold" },
                  { name: "Saúde & Academia", val: 30, color: "bg-blue-400" },
                  { name: "Trabalho (SaaS)", val: 15, color: "bg-green-400" },
                  { name: "Casa & Família", val: 10, color: "bg-purple-400" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-text-muted">{item.name}</span>
                      <span className="text-text">{item.val}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-3 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-gold/5 border border-gold/10 rounded-2xl">
                <p className="text-xs text-text-muted italic leading-relaxed text-center">
                  "Você está focado em crescer intelectualmente esta semana. Continue assim!"
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
