'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Zap, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-surface-2 border border-border-custom text-gold hover:border-gold/50 transition-all shadow-lg flex items-center gap-2"
      title={theme === 'gold' ? 'Ativar Modo Cyber' : 'Ativar Modo Obsidian'}
    >
      {theme === 'gold' ? (
        <>
          <Sun size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Obsidian</span>
        </>
      ) : (
        <>
          <Zap size={18} fill="currentColor" />
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Cyber</span>
        </>
      )}
    </motion.button>
  );
}
