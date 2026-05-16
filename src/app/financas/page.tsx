'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useToast } from '@/context/ToastContext';
import NeuralShield from '@/components/NeuralShield';

export default function FinanceDashboard() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTx, setNewTx] = useState({ description: '', amount: '', type: 'expense' });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (data) {
        setTransactions(data);
        const total = data.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
        setBalance(total);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Correção para aceitar vírgula (padrão brasileiro)
      const amountValue = typeof newTx.amount === 'string' 
        ? newTx.amount.replace(',', '.') 
        : newTx.amount;
        
      const parsedAmount = parseFloat(amountValue);
      
      if (isNaN(parsedAmount)) {
        showToast("Por favor, insira um valor numérico válido.", "error");
        return;
      }

      const { error } = await supabase.from('transactions').insert([{
        description: newTx.description,
        amount: parsedAmount,
        type: newTx.type
      }]);

      if (error) {
        showToast(`Erro ao salvar: ${error.message}`, "error");
        return;
      }

      showToast("Transação registrada com sucesso!");
      setNewTx({ description: '', amount: '', type: 'expense' });
      setIsModalOpen(false);
      fetchFinanceData();
      window.dispatchEvent(new CustomEvent('neural-sync'));
    } catch (err: any) {
      showToast(`Erro inesperado: ${err.message}`, "error");
    }
  };

  return (
    <NeuralShield>
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Controle de Gastos</p>
              <h1 className="text-3xl font-serif font-bold">Meu Dinheiro & Finanças</h1>
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

        <div className="md:col-span-2 bg-surface-2 border border-border-custom p-8 rounded-[2.5rem] flex flex-col justify-between">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h4 className="text-lg font-bold mb-2">Fluxo de Caixa</h4>
               <p className="text-sm text-text-dim">Resumo de Entradas e Saídas</p>
             </div>
             <button 
              onClick={() => setIsModalOpen(true)}
              className="w-12 h-12 rounded-xl bg-gold text-bg flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
             >
               <Plus size={24} />
             </button>
           </div>
           
           <div className="space-y-2">
             <div className="h-3 w-full bg-surface-3 rounded-full overflow-hidden flex">
               {transactions.length > 0 ? (
                 <>
                   <div 
                     className="bg-emerald-500 h-full transition-all duration-1000" 
                     style={{ width: `${Math.max(10, (transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) / (transactions.reduce((a, b) => a + b.amount, 0) || 1)) * 100)}%` }} 
                   />
                   <div className="bg-surface-1 h-full flex-1" />
                 </>
               ) : (
                 <div className="w-full h-full bg-surface-1" />
               )}
             </div>
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
               <span className="text-emerald-400">Entradas</span>
               <span className="text-text-dim">Saídas / Balanço</span>
             </div>
           </div>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-black uppercase tracking-widest text-text-dim mb-6 px-2">Transações Recentes</h3>
        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-1/50 border border-border-custom p-4 rounded-2xl flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-2" />
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-surface-2 rounded" />
                    <div className="w-16 h-2 bg-surface-2 rounded" />
                  </div>
                </div>
                <div className="w-20 h-6 bg-surface-2 rounded" />
              </div>
            ))
          ) : transactions.length > 0 ? (
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-surface-1/30 border border-dashed border-border-custom rounded-[2.5rem] text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-surface-2 flex items-center justify-center mb-6 border border-white/5">
                <Plus className="text-text-dim/30" size={24} />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2 text-text/80">Sem transações registradas</h3>
              <p className="text-sm text-text-dim max-w-xs mb-8">Adicione sua primeira entrada ou saída para começar.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-gold text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all"
              >
                Registrar Agora
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-surface-1 border border-border-custom rounded-[2.5rem] p-10 shadow-2xl relative"
            >
              <h2 className="text-2xl font-serif font-bold mb-6">Nova Transação</h2>
              <form onSubmit={handleAddTx} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-2">Descrição</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.description}
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                    placeholder="Ex: Compra de Livro, Aluguel..."
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-2">Valor (R$)</label>
                  <input 
                    type="text" 
                    required
                    value={newTx.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = (Number(val) / 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                      setNewTx({...newTx, amount: formatted});
                    }}
                    placeholder="0,00"
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    type="button"
                    onClick={() => setNewTx({...newTx, type: 'income'})}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTx.type === 'income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-surface-2 border-border-custom text-text-dim'}`}
                   >
                     Entrada
                   </button>
                   <button 
                    type="button"
                    onClick={() => setNewTx({...newTx, type: 'expense'})}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newTx.type === 'expense' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-surface-2 border-border-custom text-text-dim'}`}
                   >
                     Saída
                   </button>
                </div>
                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-surface-2 text-text-dim rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-3 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-gold text-bg rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all shadow-lg shadow-gold/20"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </NeuralShield>
  );
}
