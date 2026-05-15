'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Book, 
  CheckCircle2, 
  ShoppingCart, 
  Wallet, 
  Command,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'book' | 'task' | 'shopping' | 'finance';
  path: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock de dados para busca (Em um cenário real, viria do Supabase ou Contexto)
  const mockData: SearchResult[] = [
    { id: '1', title: '1984 - George Orwell', subtitle: 'Livro • Audiobook', type: 'book', path: '/' },
    { id: '2', title: 'Academia (Pernas)', subtitle: 'Tarefa • Hoje', type: 'task', path: '/kanban' },
    { id: '3', title: 'Leite Desnatado', subtitle: 'Mercado • Faltando', type: 'shopping', path: '/shopping' },
    { id: '4', title: 'Supermercado Central', subtitle: 'Finanças • R$ 342,90', type: 'finance', path: '/financas' },
    { id: '5', title: 'O Alquimista', subtitle: 'Livro • Paulo Coelho', type: 'book', path: '/' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    const filtered = mockData.filter(item => 
      item.title.toLowerCase().includes(val.toLowerCase()) || 
      item.subtitle.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book size={16} className="text-gold" />;
      case 'task': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'shopping': return <ShoppingCart size={16} className="text-blue-400" />;
      case 'finance': return <Wallet size={16} className="text-red-400" />;
      default: return <Search size={16} />;
    }
  };

  return (
    <>
      {/* SEARCH TRIGGER (BUTTON) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 bg-surface-2 border border-border-custom rounded-xl text-text-dim hover:text-text hover:border-gold/30 transition-all group"
      >
        <Search size={16} />
        <span className="text-xs font-semibold">Busca Global...</span>
        <div className="flex items-center gap-1 ml-4 px-1.5 py-0.5 rounded bg-surface-3 border border-white/5 text-[9px] font-bold">
          <Command size={10} /> K
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-surface-1 border border-border-custom rounded-[2rem] shadow-2xl overflow-hidden glass-panel"
            >
              <div className="p-6 flex items-center gap-4 border-b border-border-custom">
                <Search className="text-gold" size={22} />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Pesquise por livros, tarefas, compras ou notas..." 
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-text placeholder:text-text-dim"
                />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-surface-2 rounded-full text-text-dim transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                {query.length > 0 ? (
                  <div className="p-2">
                    {results.length > 0 ? (
                      results.map((res) => (
                        <button 
                          key={res.id}
                          onClick={() => navigateTo(res.path)}
                          className="w-full p-4 rounded-2xl hover:bg-surface-2 transition-all flex items-center justify-between group text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-surface-3 border border-white/5 group-hover:border-gold/30 transition-colors">
                              {getTypeIcon(res.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-text group-hover:text-gold transition-colors">{res.title}</h4>
                              <p className="text-[10px] text-text-dim font-medium uppercase tracking-widest">{res.subtitle}</p>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-text-dim opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm text-text-dim font-serif italic">Nenhum resultado encontrado para "{query}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <h5 className="text-[10px] font-bold text-text-dim uppercase tracking-[0.2em] mb-4">Sugestões Rápidas</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => navigateTo('/shopping')} className="p-4 rounded-2xl bg-surface-2 border border-border-custom hover:border-gold/30 transition-all flex items-center gap-3">
                        <ShoppingCart size={16} className="text-blue-400" />
                        <span className="text-xs font-bold text-text">Lista de Mercado</span>
                      </button>
                      <button onClick={() => navigateTo('/financas')} className="p-4 rounded-2xl bg-surface-2 border border-border-custom hover:border-gold/30 transition-all flex items-center gap-3">
                        <Wallet size={16} className="text-red-400" />
                        <span className="text-xs font-bold text-text">Resumo Financeiro</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-surface-2/50 border-t border-border-custom flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-text-dim">
                    <span className="px-1.5 py-0.5 rounded bg-surface-3 border border-white/5 text-text">ESC</span> Sair
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-text-dim">
                    <span className="px-1.5 py-0.5 rounded bg-surface-3 border border-white/5 text-text">ENTER</span> Abrir
                  </div>
                </div>
                <div className="text-[9px] font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Recentemente Pesquisado
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
