'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, Sparkles, X } from 'lucide-react';
import { processVoiceCommand } from '@/lib/commandProcessor';
import { supabase } from '@/lib/supabase';

export default function GlobalVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleVoice = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    if (isListening) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        console.log("Global audio captured:", audioBlob);
        
        // Simulação de processamento Whisper
        setTimeout(async () => {
          const simulatedCommand = "Adicionar café na lista de compras";
          const result = await processVoiceCommand(simulatedCommand, session.user.id);
          
          if (result.success) {
            // Feedback tático
            console.log("Comando Global executado:", result);
          }
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }, 2000);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Erro no microfone global:", err);
      setIsListening(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-28 z-[150]">
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-20 right-0 whitespace-nowrap bg-bg/80 backdrop-blur-xl border border-gold/30 p-4 rounded-3xl shadow-2xl flex items-center gap-4"
          >
            <div className="flex gap-1 items-center h-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [8, 16, 8] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-gold rounded-full"
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Escuta Ativa...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={handleToggleVoice}
        disabled={isProcessing}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl relative group ${isListening ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse' : 'bg-surface-2 text-text-dim hover:text-gold border border-border-custom hover:border-gold/30'}`}
      >
        {isProcessing ? (
          <Loader2 size={24} className="animate-spin text-gold" />
        ) : (
          isListening ? <Volume2 size={24} /> : <Mic size={24} />
        )}
        
        {!isListening && !isProcessing && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full border-2 border-background flex items-center justify-center">
            <Sparkles size={10} className="text-bg" />
          </div>
        )}
      </button>
    </div>
  );
}
