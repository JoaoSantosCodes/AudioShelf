'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, MessageSquare, Bot, User, Loader2, Wallet, Calendar, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'finance' | 'task' | 'shopping';
}

export default function InsightsAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu Assistente de Insights. Como posso ajudar com seu Segundo Cérebro hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Lógica de Processamento de Contexto
    setTimeout(async () => {
      let response = "Desculpe, ainda estou aprendendo a processar esse tipo de informação.";
      
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes('gastei') || lowerInput.includes('dinheiro') || lowerInput.includes('finanças')) {
        const { data: tx } = await supabase.from('transactions').select('amount').eq('type', 'expense');
        const total = tx?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        response = `Você gastou um total de R$ ${total.toLocaleString('pt-BR')} este mês. Quer que eu detalhe por categoria?`;
      } else if (lowerInput.includes('tarefa') || lowerInput.includes('fazer') || lowerInput.includes('kanban')) {
        const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).neq('status', 'done');
        response = `Você tem ${count || 0} missões pendentes no seu Kanban. Algumas estão vencendo em breve!`;
      } else if (lowerInput.includes('mercado') || lowerInput.includes('comprar') || lowerInput.includes('lista')) {
        const { count } = await supabase.from('shopping_list').select('*', { count: 'exact', head: true }).eq('completed', false);
        response = `Sua lista de mercado tem ${count || 0} itens aguardando. Precisa que eu adicione algo novo?`;
      } else {
        response = "Entendido! Estou monitorando seu ecossistema. Posso te ajudar com resumos de finanças, tarefas ou sua lista de compras.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* CHAT BUBBLE TRIGGER */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gold text-bg shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center z-[150] hover:scale-110 transition-transform active:scale-95 group"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center animate-bounce">
          <span className="text-[10px] font-bold text-white">1</span>
        </div>
      </button>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-96 h-[32rem] bg-surface-1 border border-border-custom rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden z-[160] glass-panel"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-border-custom bg-surface-2/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <Bot className="text-bg" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-text">Assistente de Insights</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">IA Conectada</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-text-dim hover:text-text hover:bg-surface-3 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${msg.role === 'user' ? 'bg-gold/10' : 'bg-surface-3 shadow-lg'}`}>
                    {msg.role === 'user' ? <User size={14} className="text-gold" /> : <Bot size={14} className="text-gold" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-gold text-bg font-bold rounded-tr-none' : 'bg-surface-2 border border-border-custom text-text-muted rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center border border-white/5 shadow-lg">
                    <Loader2 size={14} className="text-gold animate-spin" />
                  </div>
                  <div className="bg-surface-2 border border-border-custom p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-6 border-t border-border-custom bg-surface-2/30">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte qualquer coisa..."
                  className="w-full bg-surface-1 border border-border-custom rounded-2xl py-4 pl-6 pr-14 text-xs focus:border-gold/50 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gold text-bg rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
