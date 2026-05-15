'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ArrowUpCircle,
  MoreHorizontal,
  Home,
  Receipt,
  Camera,
  Image as ImageIcon,
  DollarSign,
  Eye,
  Sparkles,
  Loader2,
  Mic,
  Volume2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  receipt_url?: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ 
    description: '', 
    amount: '', 
    category: 'Mercado', 
    type: 'expense' as 'income' | 'expense' 
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { name: 'Mercado', icon: ShoppingCart, color: 'text-blue-400' },
    { name: 'Lazer', icon: Pizza, color: 'text-gold' },
    { name: 'Saúde', icon: HeartPulse, color: 'text-red-400' },
    { name: 'Casa', icon: HomeIcon, color: 'text-green-400' },
    { name: 'Transporte', icon: Car, color: 'text-purple-400' },
    { name: 'Salário', icon: DollarSign, color: 'text-emerald-400' },
  ];

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  const budgetGoal = 5000;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchTransactions(session.user.id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (data) setTransactions(data);
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAIScan = async () => {
    if (!previewUrl) return;
    setIsScanning(true);
    
    // Simulação de chamada de API OCR
    setTimeout(() => {
      setNewTx({
        ...newTx,
        amount: '342.90',
        description: 'Supermercado Central',
        category: 'Mercado'
      });
      setIsScanning(false);
    }, 2500);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Simulação de IA Whisper extraindo Valor e Descrição
    setTimeout(() => {
      setNewTx({
        ...newTx,
        amount: '15.00',
        description: 'Estacionamento Shopping',
        category: 'Transporte'
      });
      setIsListening(false);
    }, 3000);
  };

  const handleAddTransaction = async () => {
    if (!newTx.description || !newTx.amount || !user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        category: newTx.category,
        date: new Date().toISOString().split('T')[0],
        type: newTx.type,
        receipt_url: previewUrl || null
      }])
      .select();

    if (data) {
      setTransactions([data[0], ...transactions]);
      setIsModalOpen(false);
      setNewTx({ description: '', amount: '', category: 'Mercado', type: 'expense' });
      setPreviewUrl(null);
      setSelectedImage(null);
      setIsScanning(false);
      setIsListening(false);
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
          <h1 className="text-xl font-serif font-bold flex items-center gap-3">
            <Wallet className="text-gold" size={22} />
            Fluxo de Caixa Familiar
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-gold text-bg rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gold-bright transition-all shadow-lg shadow-gold/20"
          >
            <Plus size={16} /> Novo Registro
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* CASH FLOW DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-1 border border-border-custom p-6 rounded-3xl shadow-xl relative overflow-hidden"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Total Recebido</p>
              <h2 className="text-3xl font-black text-text">R$ {totalIncome.toLocaleString('pt-BR')}</h2>
              <div className="absolute top-4 right-4 text-emerald-400 opacity-20"><ArrowUpCircle size={40} /></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface-1 border border-border-custom p-6 rounded-3xl shadow-xl relative overflow-hidden"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Total Gasto</p>
              <h2 className="text-3xl font-black text-text">R$ {totalExpense.toLocaleString('pt-BR')}</h2>
              <div className="absolute top-4 right-4 text-red-400 opacity-20"><ArrowDownCircle size={40} /></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-surface-1 border p-6 rounded-3xl shadow-xl relative overflow-hidden ${balance >= 0 ? 'border-emerald-500/30' : 'border-red-500/30'}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-1">Saldo Final</p>
              <h2 className={`text-3xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                R$ {balance.toLocaleString('pt-BR')}
              </h2>
              <div className="absolute top-4 right-4 text-gold opacity-20"><TrendingUp size={40} /></div>
            </motion.div>
          </div>

          {/* BUDGET PROGRESS */}
          <div className="bg-surface-2 border border-border-custom p-8 rounded-3xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Acompanhamento de Gastos vs Meta</h3>
              <span className="text-xs font-bold text-gold">Meta: R$ {budgetGoal}</span>
            </div>
            <div className="w-full h-4 bg-surface-3 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalExpense / budgetGoal) * 100, 100)}%` }}
                className={`h-full rounded-full ${totalExpense > budgetGoal ? 'bg-red-500' : 'bg-gold'}`}
              />
            </div>
          </div>

          {/* TRANSACTION LIST */}
          <div className="bg-surface-1 border border-border-custom rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border-custom flex items-center justify-between bg-surface-2/50">
              <h3 className="text-lg font-serif font-bold text-text flex items-center gap-3">
                <Receipt size={20} className="text-gold" />
                Livro de Entradas & Saídas
              </h3>
            </div>
            
            <div className="divide-y divide-border-custom">
              {transactions.map((tx) => {
                const categoryData = categories.find(c => c.name === tx.category);
                const Icon = categoryData?.icon || ShoppingCart;
                
                return (
                  <motion.div 
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-5 flex items-center justify-between hover:bg-surface-2 transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl bg-surface-3 ${categoryData?.color} border border-white/5`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text group-hover:text-gold transition-colors">{tx.description}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{tx.category}</span>
                          <span className="text-[10px] text-text-muted italic">{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                          {tx.receipt_url && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                              <ImageIcon size={10} /> NOTA ANEXADA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-text'}`}>
                        {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tx.receipt_url && (
                          <button className="text-gold hover:bg-gold/10 p-2 rounded-xl" title="Ver Nota">
                            <Eye size={18} />
                          </button>
                        )}
                        <button className="text-text-dim hover:text-text p-2 rounded-xl">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL ADICIONAR REGISTRO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-1 border border-border-custom w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif font-bold text-text">Novo Registro Financeiro</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text"><X size={24} /></button>
                </div>

                {/* TYPE SELECTOR */}
                <div className="flex p-1 bg-surface-2 rounded-2xl border border-border-custom">
                  <button 
                    onClick={() => setNewTx({...newTx, type: 'expense', category: 'Mercado'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${newTx.type === 'expense' ? 'bg-red-500 text-white shadow-lg' : 'text-text-dim hover:text-text'}`}
                  >
                    <ArrowDownCircle size={16} /> Saída (Gasto)
                  </button>
                  <button 
                    onClick={() => setNewTx({...newTx, type: 'income', category: 'Salário'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${newTx.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-text-dim hover:text-text'}`}
                  >
                    <ArrowUpCircle size={16} /> Entrada (Ganho)
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className={`absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black ${newTx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>R$</span>
                    <input 
                      type="number" 
                      placeholder="0,00"
                      value={newTx.amount}
                      onChange={e => setNewTx({...newTx, amount: e.target.value})}
                      className="w-full bg-surface-2 border border-border-custom rounded-2xl py-6 pl-16 pr-6 text-4xl font-black focus:border-gold/50 outline-none transition-all"
                    />
                    <button 
                      onClick={handleVoiceInput}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all ${isListening ? 'bg-gold text-bg animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-surface-3 text-text-dim hover:text-gold border border-border-custom'}`}
                    >
                      {isListening ? <Volume2 size={24} className="animate-bounce" /> : <Mic size={24} />}
                    </button>
                  </div>

                  {isListening && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2 bg-gold/5 rounded-xl border border-gold/20"
                    >
                      <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] animate-pulse">Ouvindo despesa... "Gastei 15 reais no shopping"</span>
                    </motion.div>
                  )}
                  
                  <input 
                    type="text" 
                    placeholder="Descrição do registro..."
                    value={newTx.description}
                    onChange={e => setNewTx({...newTx, description: e.target.value})}
                    className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 px-6 text-sm font-semibold focus:border-gold/50 outline-none transition-all"
                  />

                  {/* PHOTO UPLOAD UI */}
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Anexar Nota Fiscal</label>
                      <div className="w-full h-32 border-2 border-dashed border-border-custom rounded-2xl flex flex-col items-center justify-center gap-2 text-text-dim hover:border-gold hover:text-gold transition-all overflow-hidden relative">
                        {previewUrl ? (
                          <>
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            {isScanning && (
                              <motion.div 
                                initial={{ top: '-10%' }}
                                animate={{ top: '110%' }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                className="absolute left-0 right-0 h-1 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
                              >
                                <Camera size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center gap-2"
                          >
                            <Camera size={32} />
                            <span className="text-[10px] font-bold uppercase">Tirar Foto / Anexar</span>
                          </button>
                        )}
                      </div>
                      {previewUrl && !isScanning && (
                        <button 
                          onClick={handleAIScan}
                          className="w-full py-2 bg-gold/10 border border-gold/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-bg transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles size={14} /> Analisar com IA
                        </button>
                      )}
                      {isScanning && (
                        <div className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-widest text-gold animate-pulse flex items-center justify-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> Lendo Recibo...
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        className="hidden" 
                        accept="image/*"
                        capture="environment"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim px-2">Categoria</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.filter(c => newTx.type === 'expense' ? c.name !== 'Salário' : c.name === 'Salário').map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => setNewTx({...newTx, category: cat.name})}
                            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex flex-col items-center gap-1 ${newTx.category === cat.name ? 'bg-gold/10 border-gold text-gold' : 'border-border-custom text-text-dim'}`}
                          >
                            <cat.icon size={16} />
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setPreviewUrl(null);
                    }}
                    className="flex-1 py-4 rounded-2xl font-bold text-text-muted hover:bg-surface-2 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddTransaction}
                    className="flex-1 py-4 bg-gold text-bg rounded-2xl font-bold hover:bg-gold-bright transition-all shadow-xl shadow-gold/20 flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={18} /> Salvar Registro
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
