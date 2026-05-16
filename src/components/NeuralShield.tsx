'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface NeuralShieldProps {
  children: React.ReactNode;
}

export default function NeuralShield({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // No MVP, usamos um PIN fixo ou vindo do .env. 
  // Para demonstração, usaremos '1234'
  const MASTER_PIN = '1234';

  useEffect(() => {
    const sessionToken = localStorage.getItem('ms-neural-token');
    if (sessionToken === 'authenticated') {
      setIsLocked(false);
    }
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      if (pin === MASTER_PIN) {
        localStorage.setItem('ms-neural-token', 'authenticated');
        setIsLocked(false);
        showToast("Acesso Neural Concedido", "success");
      } else {
        showToast("Código Inválido", "error");
        setPin('');
      }
      setIsVerifying(false);
    }, 1000);
  };

  if (!isLocked) return <>{children}</>;

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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-2">Security Protocol</p>
            <h2 className="text-3xl font-serif font-bold">Camada Neural Trancada</h2>
            <p className="text-xs text-text-dim mt-4 leading-relaxed">Insira sua chave de acesso para desbloquear as funções de inteligência e finanças.</p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="relative">
            <input 
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-surface-2 border border-border-custom rounded-2xl px-6 py-5 text-center text-2xl tracking-[1em] focus:border-gold/50 outline-none transition-all placeholder:tracking-normal placeholder:text-sm"
              maxLength={4}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isVerifying}
            className="w-full py-5 bg-gold text-bg rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-bright transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isVerifying ? (
              <Zap className="animate-spin" size={18} />
            ) : (
              <>
                Desbloquear Camada <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
