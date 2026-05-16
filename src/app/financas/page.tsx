'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  Plus,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FinanceDashboard() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (data) {
      setTransactions(data);
      const total = data.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
      setBalance(total);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-text-dim hover:text-gold transition-all text-xs font-bold uppercase tracking-widest mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Biblioteca
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
            <Wallet className="text-red-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Financial Control</p>
            <h1 className="text-3xl font-serif font-bold">Gestão de Liquidez</h1>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-1 border border-border-custom p-8 rounded-[2.5rem] shadow-elegant"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-2">Saldo Atual</p>
          <h3 className="text-4xl font-serif font-bold text-text">R$ {balance.toLocaleString()}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} />
            +12.5% este mês
          </div>
        </motion.div>

        <div className="md:col-span-2 bg-surface-2 border border-border-custom p-8 rounded-[2.5rem] flex items-center justify-between">
           <div>
             <h4 className="text-lg font-bold mb-2">Fluxo de Caixa</h4>
             <p className="text-sm text-text-dim">Integração ativa com o Brain Layer para otimização de gastos.</p>
           </div>
           <button className="w-14 h-14 rounded-2xl bg-gold text-bg flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 transition-transform">
             <Plus size={24} />
           </button>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-text-dim mb-6 px-2">Transações Recentes</h3>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((t, i) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-1/50 border border-border-custom p-4 rounded-2xl flex items-center justify-between group hover:border-gold/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {t.type === 'income' ? <Plus size={18} /> : <DollarSign size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{t.description}</p>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-serif font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-text'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-border-custom rounded-[2.5rem]">
              <p className="text-text-dim italic font-serif text-sm">Nenhuma transação registrada no sistema neural.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
