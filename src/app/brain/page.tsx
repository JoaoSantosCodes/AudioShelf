'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain as BrainIcon, 
  TrendingUp, 
  Wallet, 
  ShoppingCart, 
  BookOpen, 
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface GlobalStats {
  totalStudyHours: number;
  totalExpenses: number;
  familyHarmony: number;
  topCategory: string;
}

export default function BrainDashboard() {
  const [stats, setStats] = useState<GlobalStats>({
    totalStudyHours: 42,
    totalExpenses: 0,
    familyHarmony: 0,
    topCategory: 'N/A'
  });
  const [insight, setInsight] = useState("Analisando conexões neurais...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGlobalData();

    const handleSync = () => {
      fetchGlobalData();
    };

    window.addEventListener('neural-sync', handleSync);
    return () => window.removeEventListener('neural-sync', handleSync);
  }, []);

  const fetchGlobalData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Finance Data
    const { data: txs } = await supabase.from('transactions').select('amount, type');
    const expenses = txs?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0) || 0;

    // 2. Fetch Collab Data (Mocked harmony for now as it's in localStorage of the other app)
    const { count: shoppingCount } = await supabase.from('shopping_list').select('*', { count: 'exact', head: true });
    
    // 3. Fetch Books Data
    const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });

    setStats({
      totalStudyHours: (booksCount || 0) * 2.5, // Heuristic
      totalExpenses: expenses,
      familyHarmony: 85, // Mocked balance
      topCategory: 'Educação'
    });

    // Simulated AI Insight
    setTimeout(() => {
      setInsight("Seu foco em estudos aumentou 15% esta semana. O equilíbrio financeiro permite um novo investimento em cursos. A harmonia familiar está estável.");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-text-dim hover:text-gold transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para Biblioteca
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/10">
              <BrainIcon className="text-gold animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Neural Layer</p>
              <h1 className="text-3xl font-serif font-bold">MediaShelf Brain</h1>
            </div>
          </div>
          <p className="text-text-dim max-w-xl">A camada de inteligência que unifica seu consumo, finanças e vida familiar em uma única consciência digital.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI INSIGHT CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 bg-surface-1 border border-gold/30 p-8 rounded-[2.5rem] relative overflow-hidden shadow-elegant"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={120} /></div>
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-gold" size={20} />
            <h3 className="text-xs font-black uppercase tracking-widest text-gold">Insight do Ecossistema</h3>
          </div>
          <p className="text-2xl font-serif font-bold leading-relaxed italic text-text">
            "{insight}"
          </p>
          <div className="mt-8 flex gap-4">
            <button className="px-6 py-2 bg-gold text-bg rounded-xl text-[10px] font-black uppercase tracking-widest">Otimizar Rotina</button>
            <button className="px-6 py-2 bg-surface-2 text-text-dim border border-border-custom rounded-xl text-[10px] font-black uppercase tracking-widest">Ver Detalhes</button>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <StatItem 
          icon={BookOpen} 
          label="Imersão" 
          value={`${stats.totalStudyHours}h`} 
          sub="Tempo de Foco" 
          color="text-gold"
        />
        <StatItem 
          icon={Wallet} 
          label="Liquidez" 
          value={`R$ ${stats.totalExpenses.toLocaleString()}`} 
          sub="Saídas Mensais" 
          color="text-red-400"
        />
        <StatItem 
          icon={Target} 
          label="Harmonia" 
          value={`${stats.familyHarmony}%`} 
          sub="Sincronia Familiar" 
          color="text-emerald-400"
        />

        {/* NEURAL NETWORK GRAPHIC (Mockup) */}
        <div className="md:col-span-2 bg-surface-2 border border-border-custom rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Conexões Ativas</h3>
            <p className="text-xs text-text-dim">Fluxo de dados entre Hub, Finanças e Família</p>
          </div>
          <div className="h-32 flex items-center justify-center gap-12 relative">
             <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center animate-bounce"><BookOpen size={20} className="text-gold" /></div>
             <div className="h-[2px] w-20 bg-gradient-to-r from-gold/40 to-emerald-400/40" />
             <div className="w-12 h-12 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center"><BrainIcon size={20} className="text-emerald-400" /></div>
             <div className="h-[2px] w-20 bg-gradient-to-r from-emerald-400/40 to-red-400/40" />
             <div className="w-12 h-12 rounded-full bg-red-400/20 border border-red-400/40 flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}><Wallet size={20} className="text-red-400" /></div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-gold p-8 rounded-[2.5rem] flex flex-col justify-between group cursor-pointer hover:bg-gold-bright transition-all">
          <TrendingUp className="text-bg" size={32} />
          <div>
            <h3 className="text-bg text-xl font-bold">Relatório Global</h3>
            <p className="text-bg/70 text-xs flex items-center gap-1">Gerar PDF Consolidado <ChevronRight size={14} /></p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-surface-1 border border-border-custom p-8 rounded-[2.5rem] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg bg-surface-2 ${color} border border-white/5`}><Icon size={16} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">{label}</span>
      </div>
      <h2 className="text-4xl font-black mb-1">{value}</h2>
      <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{sub}</p>
    </div>
  );
}
