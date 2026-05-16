'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface NeuralShieldProps {
  children: React.ReactNode;
}

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function NeuralShield({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showToast(error.message, "error");
      } else {
        showToast("Conexão Neural Estabelecida", "success");
      }
    } catch (err: any) {
      showToast("Erro de conexão com a rede neural.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <Zap className="text-gold animate-spin" size={40} />
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[150] bg-bg flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-noir)] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-1 border border-border-custom rounded-[3rem] p-12 shadow-2xl relative"
      >
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20">
            <Lock className="text-gold" size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-2">Protocolo de Identidade</p>
            <h2 className="text-3xl font-serif font-bold">Camada Neural Trancada</h2>
            <p className="text-xs text-text-dim mt-4 leading-relaxed">Identifique-se para descriptografar os dados de inteligência e finanças.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-surface-2 border border-border-custom rounded-2xl px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all"
              required
            />
          </div>
          <div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha neural"
              className="w-full bg-surface-2 border border-border-custom rounded-2xl px-6 py-4 text-sm focus:border-gold/50 outline-none transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isVerifying}
            className="w-full py-5 bg-gold text-bg rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-6"
          >
            {isVerifying ? (
              <Zap className="animate-spin" size={18} />
            ) : (
              <>
                Sincronizar Identidade <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border-custom/50 flex items-center justify-center gap-2 text-text-dim">
           <ShieldCheck size={14} className="text-emerald-400" />
           <p className="text-[10px] font-bold uppercase tracking-widest">Proteção Ativa MediaShelf</p>
        </div>
      </motion.div>
    </div>
  );
}
