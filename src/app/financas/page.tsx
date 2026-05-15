'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  ShoppingCart, 
  Pizza, 
  Car, 
  HeartPulse, 
  Home as HomeIcon,
  X,
  TrendingUp,
  ArrowDownCircle,
  MoreHorizontal,
  Home,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function FinancePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Mercado' });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: 'Mercado', icon: ShoppingCart, color: 'text-blue-400' },
    { name: 'Lazer', icon: Pizza, color: 'text-gold' },
    { name: 'Saúde', icon: HeartPulse, color: 'text-red-400' },
    { name: 'Casa', icon: HomeIcon, color: 'text-green-400' },
    { name: 'Transporte', icon: Car, color: 'text-purple-400' },
  ];

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetGoal = 5000;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // Aqui poderíamos carregar do Supabase futuramente
      setExpenses([
        { id: '1', description: 'Mercado Mensal', amount: 850.50, category: 'Mercado', date: '2026-05-14' },
        { id: '2', description: 'Pizza de Sexta', amount: 120.00, category: 'Lazer', date: '2026-05-13' },
        { id: '3', description: 'Combustível', amount: 250.00, category: 'Transporte', date: '2026-05-12' },
      ]);
      setIsLoading(false);
    });
  }, []);

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expense: Expense = {
      id: Math.random().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0]
    };

    setExpenses([expense, ...expenses]);
    setIsModalOpen(false);
    setNewExpense({ description: '', amount: '', category: 'Mercado' });
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER TÁTICO */}
      <header className="h-20 flex items-center justify-between px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold">
            <Home size={20} />
          </Link>
          <h1 className="text-xl font-serif font-bold flex items-center gap-3">
            <Wallet className="text-gold" size={22} />
            Gestão Financeira
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-gold text-bg rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gold-bright transition-all shadow-lg shadow-gold/20"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* BUDGET OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-1 border border-border-custom p-8 rounded-3xl shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-1">Gasto Total (Mês)</p>
                  <h2 className="text-4xl font-black text-text">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
                <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
                  <ArrowDownCircle size={24} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-dim uppercase tracking-wider">Progresso do Orçamento</span>
                  <span className="text-gold">{Math.round((totalSpent / budgetGoal) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalSpent / budgetGoal) * 100}%` }}
                    className="h-full bg-gold rounded-full"
                  />
                </div>
                <p className="text-[10px] text-text-muted italic">Meta: R$ {budgetGoal.toLocaleString('pt-BR')}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-2 border border-border-custom p-8 rounded-3xl shadow-xl flex flex-col justify-center"
            >
              <h3 className="text-sm font-bold text-text-muted mb-6 uppercase tracking-widest">Resumo por Categoria</h3>
              <div className="flex gap-4">
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  const catTotal = expenses.filter(e => e.category === cat.name).reduce((a, b) => a + b.amount, 0);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`p-3 rounded-2xl bg-surface-3 ${cat.color} border border-white/5`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[9px] font-black text-text-dim uppercase tracking-tighter">{cat.name}</span>
                      <span className="text-[10px] font-bold text-text">R${Math.round(catTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* EXPENSE LIST */}
          <div className="bg-surface-1 border border-border-custom rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border-custom flex items-center justify-between bg-surface-2/50">
              <h3 className="text-lg font-serif font-bold text-text flex items-center gap-3">
                <Receipt size={20} className="text-gold" />
                Últimas Notas & Gastos
              </h3>
              <span className="text-xs font-bold text-text-dim">{expenses.length} registros</span>
            </div>
            
            <div className="divide-y divide-border-custom">
              {expenses.map((expense) => {
                const categoryData = categories.find(c => c.name === expense.category);
                const Icon = categoryData?.icon || ShoppingCart;
                
                return (
                  <motion.div 
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 flex items-center justify-between hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl bg-surface-3 ${categoryData?.color} border border-white/5`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text group-hover:text-gold transition-colors">{expense.description}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{expense.category}</span>
                          <span className="text-[10px] text-text-muted italic">{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black text-text">R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <button className="text-text-dim hover:text-text p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL ADICIONAR GASTO */}
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
                  <h3 className="text-2xl font-serif font-bold text-text">Registrar Gasto</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-text-dim">R$</span>
                    <input 
                      type="number" 
                      placeholder="0,00"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                      className="w-full bg-surface-2 border border-border-custom rounded-2xl py-6 pl-16 pr-6 text-4xl font-black focus:border-gold/50 outline-none transition-all text-gold"
                    />
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder="Descrição (ex: Nota Mercado do Dia)"
                    value={newExpense.description}
                    onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 px-6 text-sm font-semibold focus:border-gold/50 outline-none transition-all"
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Categoria</label>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setNewExpense({...newExpense, category: cat.name})}
                          className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex flex-col items-center gap-1 ${newExpense.category === cat.name ? 'bg-gold/10 border-gold text-gold shadow-lg shadow-gold/5' : 'border-border-custom text-text-dim hover:text-text'}`}
                        >
                          <cat.icon size={16} />
                          {cat.name}
                        </button>
                      ))}
                    </div>
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
                    onClick={handleAddExpense}
                    className="flex-1 py-4 bg-gold text-bg rounded-2xl font-bold hover:bg-gold-bright transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={18} /> Salvar Gasto
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
