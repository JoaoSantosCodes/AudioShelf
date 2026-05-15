'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  X, 
  CheckCircle2, 
  Circle, 
  Apple, 
  Beef, 
  Milk, 
  Wine, 
  Trash2,
  Home,
  RefreshCcw,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  user_id: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { name: 'Hortifruti', icon: Apple, color: 'text-green-400' },
    { name: 'Proteínas', icon: Beef, color: 'text-red-400' },
    { name: 'Laticínios', icon: Milk, color: 'text-blue-400' },
    { name: 'Bebidas', icon: Wine, color: 'text-purple-400' },
    { name: 'Geral', icon: ShoppingCart, color: 'text-gold' },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchItems(session.user.id);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchItems = async (userId: string) => {
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setItems(data);
    setIsLoading(false);
  };

  const addItem = async () => {
    if (!newItemName || !user) return;
    
    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{
        user_id: user.id,
        name: newItemName,
        category: selectedCategory,
        completed: false
      }])
      .select();

    if (data) {
      setItems([data[0], ...items]);
      setNewItemName('');
    }
  };

  const toggleBought = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from('shopping_list')
      .update({ completed: !item.completed })
      .eq('id', id);

    if (!error) {
      setItems(items.map(i => 
        i.id === id ? { ...i, completed: !i.completed } : i
      ));
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const clearBought = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('user_id', user.id)
      .eq('completed', true);

    if (!error) {
      setItems(items.filter(item => !item.completed));
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
            <ShoppingCart className="text-gold" size={22} />
            Lista de Mercado
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={clearBought} className="text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-red-400 transition-colors">
            Limpar Comprados
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* ADD ITEM INPUT */}
          <div className="bg-surface-1 border border-border-custom p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="O que está faltando? (ex: Café)"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  className="w-full bg-surface-2 border border-border-custom rounded-2xl py-4 px-6 text-lg font-semibold focus:border-gold/50 outline-none transition-all"
                />
              </div>
              <button 
                onClick={addItem}
                className="px-8 bg-gold text-bg rounded-2xl font-bold hover:bg-gold-bright transition-all shadow-lg shadow-gold/20 flex items-center gap-2"
              >
                <Plus size={20} /> Add
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${selectedCategory === cat.name ? 'bg-gold/10 border-gold text-gold' : 'border-border-custom text-text-dim hover:text-text'}`}
                >
                  <cat.icon size={14} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* SHOPPING LIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest">Itens na Lista</h3>
              <span className="text-[10px] text-text-muted font-medium italic">Sincronizado agora</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {items.sort((a, b) => Number(a.completed) - Number(b.completed)).map((item) => {
                  const categoryData = categories.find(c => c.name === item.category);
                  const Icon = categoryData?.icon || ShoppingCart;

                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${item.completed ? 'bg-surface-3/50 border-transparent opacity-60' : 'bg-surface-1 border-border-custom hover:border-gold/30 shadow-lg'}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button 
                          onClick={() => toggleBought(item.id)}
                          className={`transition-all ${item.completed ? 'text-gold' : 'text-text-dim hover:text-gold'}`}
                        >
                          {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${item.completed ? 'line-through text-text-dim' : 'text-text'}`}>
                            {item.name}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${categoryData?.color}`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-text-dim/30">
                  <ShoppingCart size={64} className="mb-4 opacity-20" />
                  <p className="font-serif italic">Sua lista está vazia.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
