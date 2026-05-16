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
  const { user, loading, signInWithProvider } = useAuth();
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsVerifying(provider);

    try {
      const { error } = await signInWithProvider(provider);

      if (error) {
        showToast(error.message, "error");
        setIsVerifying(null);
      }
      // Se não houver erro, o Supabase fará o redirecionamento, então não precisamos setar false aqui se for bem sucedido
    } catch (err: any) {
      showToast(`Erro de conexão com a rede neural via ${provider}.`, "error");
      setIsVerifying(null);
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
            <h2 className="text-3xl font-serif font-bold">Acesso Neural</h2>
            <p className="text-xs text-text-dim mt-4 leading-relaxed">Sincronize sua identidade para descriptografar os módulos táticos.</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleOAuthLogin('google')}
            disabled={isVerifying !== null}
            className="w-full py-5 bg-surface-2 border border-border-custom text-text rounded-2xl text-xs font-bold hover:bg-surface-3 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isVerifying === 'google' ? (
              <Zap className="animate-spin text-gold" size={18} />
            ) : (
              <>
                {/* Ícone simples do Google em SVG pois lucide não tem */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </>
            )}
          </button>

          <button 
            onClick={() => handleOAuthLogin('github')}
            disabled={isVerifying !== null}
            className="w-full py-5 bg-surface-2 border border-border-custom text-text rounded-2xl text-xs font-bold hover:bg-surface-3 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isVerifying === 'github' ? (
              <Zap className="animate-spin text-gold" size={18} />
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continuar com GitHub
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-border-custom/50 flex items-center justify-center gap-2 text-text-dim">
           <ShieldCheck size={14} className="text-emerald-400" />
           <p className="text-[10px] font-bold uppercase tracking-widest">Proteção Ativa MediaShelf</p>
        </div>
      </motion.div>
    </div>
  );
}
