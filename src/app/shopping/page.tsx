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
  Search,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PresenceIndicator from '@/components/PresenceIndicator';
import ThemeToggle from '@/components/ThemeToggle';
import { User } from '@supabase/supabase-js';
import { getSmartSuggestions, Suggestion } from '@/lib/shoppingEngine';
import ShoppingSkeleton from '@/components/shopping/ShoppingSkeleton';
import Skeleton from '@/components/Skeleton';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
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
    // SMART CACHE: Load from localStorage first
    const cachedItems = localStorage.getItem('shoppingItems');
    if (cachedItems) setItems(JSON.parse(cachedItems));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchItems(session.user.id).finally(() => setIsLoading(false));
        getSmartSuggestions(session.user.id).then(setSuggestions);
        
        // ASSINATURA REALTIME
        const channel = supabase
          .channel('shopping_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'shopping_list', filter: `user_id=eq.${session.user.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setItems(prev => {
                  const newList = [payload.new as ShoppingItem, ...prev];
                  localStorage.setItem('shoppingItems', JSON.stringify(newList));
                  return newList;
                });
              } else if (payload.eventType === 'UPDATE') {
                setItems(prev => {
                  const newList = prev.map(item => item.id === payload.new.id ? payload.new as ShoppingItem : item);
                  localStorage.setItem('shoppingItems', JSON.stringify(newList));
                  return newList;
                });
              } else if (payload.eventType === 'DELETE') {
                setItems(prev => {
                  const newList = prev.filter(item => item.id !== payload.old.id);
                  localStorage.setItem('shoppingItems', JSON.stringify(newList));
                  return newList;
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
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

    if (data) {
      setItems(data);
      localStorage.setItem('shoppingItems', JSON.stringify(data));
    }
    setIsLoading(false);
  };

  const addItem = async () => {
    if (!newItemName || !user) return;
    
    const tempId = Date.now().toString();
    const optimisticItem: ShoppingItem = {
      id: tempId,
      name: newItemName,
      category: selectedCategory,
      completed: false,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    setItems(prev => [optimisticItem, ...prev]);
    setNewItemName('');

    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{
        user_id: user.id,
        name: newItemName,
        category: selectedCategory,
        completed: false
      }])
      .select();

    if (error) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      alert("Erro ao adicionar item. Tente novamente.");
    } else if (data) {
      // Substituir o item otimista pelo real do banco (com ID correto)
      setItems(prev => prev.map(i => i.id === tempId ? data[0] : i));
    }
  };

  const toggleBought = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // UPDATE OTIMISTA
    const originalItems = [...items];
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));

    const { error } = await supabase
      .from('shopping_list')
      .update({ completed: !item.completed })
      .eq('id', id);

    if (error) {
      setItems(originalItems);
      alert("Erro ao atualizar item.");
    }
  };

  const removeItem = async (id: string) => {
    const originalItems = [...items];
    setItems(prev => prev.filter(item => item.id !== id));

    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (error) {
      setItems(originalItems);
      alert("Erro ao remover item.");
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

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    if (!user) return;
    
    const tempId = `suggest-${Date.now()}`;
    const optimisticItem: ShoppingItem = {
      id: tempId,
      name: suggestion.name,
      category: suggestion.category,
      completed: false,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    setItems(prev => [optimisticItem, ...prev]);
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));

    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{
        user_id: user.id,
        name: suggestion.name,
        category: suggestion.category,
        completed: false
      }])
      .select();
    
    if (error) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      setSuggestions(prev => [{ ...suggestion }, ...prev]);
      alert("Erro ao adicionar sugestão.");
    } else if (data) {
      setItems(prev => prev.map(i => i.id === tempId ? data[0] : i));
    }
  };

  if (isLoading && items.length === 0) {
    return <ShoppingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER TÁTICO */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-border-custom text-text-dim hover:text-gold shrink-0">
            <Home size={18} />
          </Link>
          <h1 className="text-base md:text-xl font-serif font-bold flex items-center gap-2 md:gap-3 truncate">
            <ShoppingCart className="text-gold hidden xs:block" size={20} />
            <span className="truncate">Mercado</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:block">
            <PresenceIndicator />
          </div>
          <button onClick={clearBought} className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-red-400 transition-colors">
            Limpar Comprados
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 md:pb-10">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          
          {/* AI SUGGESTIONS */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Sparkles size={14} className="text-gold" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/70">Sugerido pela IA</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleSuggestionClick(s)}
                    className="shrink-0 px-4 py-3 bg-surface-1 border border-gold/20 rounded-2xl flex items-center gap-3 hover:border-gold/50 transition-all group shadow-lg"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                      <Plus size={16} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-text">{s.name}</p>
                      <p className="text-[9px] text-text-dim uppercase tracking-wider">{s.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADD ITEM INPUT */}
          <div className="bg-surface-1 border border-border-custom p-4 md:p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="O que falta?"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addItem()}
                  className="w-full bg-surface-2 border border-border-custom rounded-2xl py-3 md:py-4 px-4 md:px-6 text-base md:text-lg font-semibold focus:border-gold/50 outline-none transition-all"
                />
              </div>
              <button 
                onClick={addItem}
                className="py-3 md:py-0 px-8 bg-gold text-bg rounded-2xl font-bold hover:bg-gold-bright transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> <span className="sm:hidden">Adicionar Item</span><span className="hidden sm:inline">Add</span>
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
