'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain } from 'lucide-react';

export default function NeuralSyncIndicator() {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Listen for custom "neural-sync" events
    const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    };

    window.addEventListener('neural-sync', handleSync);
    return () => window.removeEventListener('neural-sync', handleSync);
  }, []);

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div 
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.8 }}
          className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 bg-gold/20 backdrop-blur-2xl border border-gold/40 px-6 py-3 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <div className="relative">
            <Brain className="text-gold animate-pulse" size={18} />
            <Zap className="absolute -top-1 -right-1 text-white animate-bounce" size={10} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">Neural Sync Active</span>
          
          {/* Progress ring simulation */}
          <div className="w-4 h-4 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
