'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle2, 
  ShoppingCart, 
  Wallet, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  BarChart3,
  Dumbbell,
  Target
} from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function InsightsPage() {
  const [realStats, setRealStats] = useState({
    tasksDone: 0,
    totalExpenses: 0,
    shoppingItems: 0,
    healthScore: 85
  });
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Busca dados reais
    const [tasksRes, txRes, shopRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', session.user.id).eq('status', 'done'),
      supabase.from('transactions').select('amount').eq('user_id', session.user.id).eq('type', 'expense'),
      supabase.from('shopping_list').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('completed', true)
    ]);

    // Cálculo de Gastos
    const expensesTotal = txRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // Cálculo de Atividade Semanal (Últimos 7 dias)
    const now = new Date();
    const activity = Array(7).fill(0);
    tasksRes.data?.forEach(task => {
      const taskDate = new Date(task.created_at);
      const diffDays = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 7) {
        activity[6 - diffDays]++;
      }
    });

    // Normalizar para porcentagem do gráfico (ex: max 5 tarefas = 100%)
    const maxTasks = Math.max(...activity, 1);
    const normalizedActivity = activity.map(count => (count / maxTasks) * 100);

    setWeeklyActivity(normalizedActivity);
    setRealStats({
      tasksDone: tasksRes.data?.length || 0,
      totalExpenses: expensesTotal,
      shoppingItems: shopRes.count || 0,
      healthScore: Math.min(100, (tasksRes.data?.length || 0) * 5) // Exemplo: cada tarefa concluída dá 5% de saúde
    });
    setIsLoading(false);
  };

  const stats = [
    { title: 'Missões Concluídas', value: realStats.tasksDone.toString(), change: '+12%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Gastos do Mês', value: `R$ ${realStats.totalExpenses.toLocaleString('pt-BR')}`, change: '-5%', icon: Wallet, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Itens de Mercado', value: realStats.shoppingItems.toString(), change: '+18%', icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Foco em Saúde', value: `${realStats.healthScore}%`, change: '+2%', icon: Dumbbell, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  const weeklyData = [65, 80, 45, 90, 100, 75, 85];
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER TÁTICO */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold">
            <Home size={20} />
          </Link>
          <h1 className="text-xl font-serif font-bold flex items-center gap-3">
            <BarChart3 className="text-gold" size={22} />
            Relatório de Progresso Mensal
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="px-4 py-1.5 bg-surface-2 border border-border-custom rounded-full text-[10px] font-bold text-text-dim uppercase tracking-widest">
            Maio 2026
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* TOP STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface-1 border border-border-custom p-6 rounded-3xl shadow-xl hover:border-gold/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change} {stat.change.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-text mb-1 group-hover:text-gold transition-colors">{stat.value}</h3>
                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* WEEKLY ACTIVITY CHART (CSS ONLY) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 bg-surface-1 border border-border-custom p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-serif font-bold text-text">Atividade Semanal</h3>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Consistência de metas concluídas</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-dim">
                    <div className="w-2 h-2 rounded-full bg-gold"></div> Missões
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 h-64 px-4">
                {(weeklyActivity.length > 0 ? weeklyActivity : [0,0,0,0,0,0,0]).map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ delay: 0.5 + (idx * 0.1), duration: 1, ease: 'easeOut' }}
                        className="w-full bg-gradient-to-t from-gold/40 to-gold rounded-t-xl group-hover:from-gold group-hover:to-gold-bright transition-all"
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gold text-bg text-[10px] font-bold px-2 py-1 rounded">
                        {val > 0 ? 'Ativo' : '0'}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase">{days[idx]}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* UPCOMING GOALS */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-2 border border-border-custom p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={120} />
              </div>
              <h3 className="text-lg font-serif font-bold text-text mb-6">Próximas Metas</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-text">Academia (Missões Saúde)</span>
                    <span className="text-gold">{realStats.healthScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${realStats.healthScore}%` }}
                      className="h-full bg-gold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-text">Meta de Compras (Itens/Mês)</span>
                    <span className="text-emerald-400">{Math.min(100, realStats.shoppingItems * 10)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, realStats.shoppingItems * 10)}%` }}
                      className="h-full bg-emerald-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-text">Economia Doméstica</span>
                    <span className="text-blue-400">{realStats.totalExpenses > 0 ? 85 : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${realStats.totalExpenses > 0 ? 85 : 0}%` }}
                      className="h-full bg-blue-400"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-surface-3 hover:bg-surface-1 border border-border-custom rounded-2xl text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-gold transition-all">
                Configurar Novas Metas
              </button>
            </motion.div>
          </div>

          {/* RECENT MILESTONES */}
          <div className="bg-surface-1 border border-border-custom rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border-custom bg-surface-2/50">
              <h3 className="text-sm font-bold text-text uppercase tracking-[0.2em]">Marcos Recentes de Sucesso</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y md:divide-y-0 divide-border-custom">
              <div className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-gold/10 text-gold">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">Meta de Academia Batida!</h4>
                  <p className="text-xs text-text-dim mt-1">Você frequentou a academia 4 vezes nesta semana. Ótimo progresso!</p>
                  <span className="text-[9px] text-text-muted mt-2 block">Há 2 horas</span>
                </div>
              </div>
              <div className="p-6 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-400/10 text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">Economia de Mercado</h4>
                  <p className="text-xs text-text-dim mt-1">Neste mês você gastou 15% menos em itens não essenciais no mercado.</p>
                  <span className="text-[9px] text-text-muted mt-2 block">Há 1 dia</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
