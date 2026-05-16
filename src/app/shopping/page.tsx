'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  ArrowLeft,
  CheckCircle2,
  Circle,
  Package,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ShoppingDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', quantity: '', category: 'Geral' });

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    const { data } = await supabase.from('shopping_list').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('shopping_list').insert([{
        title: newItem.title,
        quantity: newItem.quantity,
        category: newItem.category,
        completed: false
      }]);

      if (error) {
        alert(`Erro ao salvar item: ${error.message}`);
        return;
      }

      setNewItem({ title: '', quantity: '', category: 'Geral' });
      setIsModalOpen(false);
      fetchShoppingList();
    } catch (err: any) {
      alert(`Erro inesperado: ${err.message}`);
    }
  };

  const toggleItem = async (id: string, current: boolean) => {
     const { error } = await supabase.from('shopping_list').update({ completed: !current }).eq('id', id);
     if (!error) fetchShoppingList();
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-text-dim hover:text-gold transition-all text-xs font-bold uppercase tracking-widest mb-6 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para Biblioteca
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <ShoppingCart className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Inventory Hub</p>
            <h1 className="text-3xl font-serif font-bold">Lista de Suprimentos</h1>
          </div>
        </div>
      </header>

      <div className="bg-surface-1 border border-border-custom rounded-[2.5rem] overflow-hidden shadow-elegant mb-12">
        <div className="p-8 border-b border-border-custom bg-surface-2/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Zap className="text-gold" size={18} />
             <h3 className="text-sm font-bold">Itens Ativos</h3>
           </div>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gold text-bg rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all"
           >
             Adicionar Item
           </button>
        </div>
        <div className="divide-y divide-border-custom">
          {items.length > 0 ? (
            items.map((item) => (
              <div 
                key={item.id}
                className="p-6 flex items-center justify-between group hover:bg-surface-2 transition-all cursor-pointer"
                onClick={() => toggleItem(item.id, item.completed)}
              >
                <div className="flex items-center gap-4">
                  <div className={item.completed ? "text-emerald-400" : "text-text-dim"}>
                    {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </div>
                  <div>
                    <p className={`text-lg font-serif font-bold ${item.completed ? "text-text-dim line-through" : "text-text"}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">Categoria: {item.category || 'Geral'}</p>
                  </div>
                </div>
                {item.quantity && (
                  <div className="px-3 py-1 rounded-full bg-surface-3 text-[10px] font-bold border border-white/5">
                    {item.quantity} un
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <Package size={48} className="mx-auto text-text-dim/20 mb-4" />
              <p className="text-text-dim italic font-serif">A lista de compras está vazia.</p>
            </div>
          )}
        </div>
      </div>

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
              <h2 className="text-2xl font-serif font-bold mb-6">Novo Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-2">Nome do Produto</label>
                  <input 
                    type="text" 
                    required
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    placeholder="Ex: Leite, Arroz, Detergente..."
                    className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-2">Quantidade</label>
                    <input 
                      type="text" 
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      placeholder="Ex: 2 un, 1kg..."
                      className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-2">Categoria</label>
                    <select 
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full bg-surface-2 border border-border-custom rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all appearance-none"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Alimentação">Alimentação</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Higiene">Higiene</option>
                    </select>
                  </div>
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
                    Adicionar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
