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

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");

  const startNeuralProcess = (msg: string) => {
    setProcessingMessage(msg);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2500);
  };

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
      totalStudyHours: (booksCount || 0) * 2.5,
      totalExpenses: expenses,
      familyHarmony: 85,
      topCategory: 'Produtividade'
    });

    if (expenses > 500) {
      setInsight("Suas saídas mensais estão elevadas. Recomendo revisar a lista de suprimentos para otimizar gastos.");
    } else if (shoppingCount && shoppingCount > 5) {
      setInsight("Sua lista de mercado está crescendo. Otimize sua rotina para realizar as compras acumuladas.");
    } else {
      setInsight("Ecossistema em harmonia. O equilíbrio entre estudo e finanças está em nível otimizado.");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-background text-text p-6 md:p-12">
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col gap-4">
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
      </div>

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
            <button 
              onClick={() => startNeuralProcess("Otimizando fluxos de trabalho e consumo...")}
              className="px-6 py-2 bg-gold text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all"
            >
              Otimizar Rotina
            </button>
            <Link 
              href="/financas"
              className="px-6 py-2 bg-surface-2 text-text-dim border border-border-custom rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-gold/50 transition-all text-center flex items-center justify-center"
            >
              Ver Detalhes
            </Link>
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

      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-gold/20 animate-ping absolute inset-0" />
                <div className="w-24 h-24 rounded-full border-b-2 border-gold animate-spin" />
                <BrainIcon className="absolute inset-0 m-auto text-gold" size={32} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gold mb-2">Neural Engine</p>
                <p className="text-xl font-serif font-bold text-text">{processingMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
