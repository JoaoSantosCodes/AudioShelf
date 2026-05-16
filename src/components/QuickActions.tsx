'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, ShoppingCart, X, Zap } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      label: 'Nova Transação', 
      icon: Wallet, 
      href: '/financas', 
      color: 'bg-red-500/10 text-red-400 border-red-500/20' 
    },
    { 
      label: 'Adicionar Suprimento', 
      icon: ShoppingCart, 
      href: '/shopping', 
      color: 'bg-gold/10 text-gold border-gold/20' 
    },
  ];

  return (
    <div className="fixed bottom-24 right-8 z-[100] md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mb-4 items-end">
            {actions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 10, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 10, x: 20 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link 
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-lg hover:scale-105 transition-all group ${action.color}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {action.label}
                  </span>
                  <action.icon size={18} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-surface-2 text-text-dim' : 'bg-gold text-bg'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Plus size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
