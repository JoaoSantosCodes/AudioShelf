'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  Play, 
  ExternalLink,
  Film,
  Utensils,
  Dumbbell,
  Home,
  Share2,
  Repeat,
  Trophy,
  Star
} from 'lucide-react';
import { Book } from '@/data/books';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'todo' | 'doing' | 'done';
  due_date?: string;
  linked_book_id?: string;
  is_recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

interface SortableTaskProps {
  task: Task;
  linkedBook?: Book;
  onPlay?: (book: Book) => void;
}

export default function SortableTask({ task, linkedBook, onPlay }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lazer': return <Film size={12} />;
      case 'Social': return <Utensils size={12} />;
      case 'Saúde': return <Dumbbell size={12} />;
      case 'Casa': return <Home size={12} />;
      default: return null;
    }
  };

  const isOverdue = task.due_date && new RegExp(/^(\d{4}-\d{2}-\d{2})/).exec(task.due_date) && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card p-4 group cursor-grab active:cursor-grabbing transition-colors ${isOverdue ? 'border-red-500/50 hover:border-red-500' : 'hover:border-gold/30'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/10 flex items-center gap-1.5">
            {getCategoryIcon(task.category)}
            {task.category}
          </span>
          {task.is_recurring && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-400/5 px-1.5 py-0.5 rounded border border-blue-400/20">
              <Repeat size={10} />
              {task.frequency === 'daily' ? 'DIA' : task.frequency === 'weekly' ? 'SEM' : 'MES'}
            </div>
          )}
          {task.category === 'Casa' && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-400/5 px-1.5 py-0.5 rounded border border-green-400/20">
              <Trophy size={10} />
              RECOMPENSA
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="text-text-muted hover:text-gold p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 size={14} />
          </button>
          <button className="text-text-muted hover:text-text p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      
      <h3 className="text-[14px] font-semibold text-text mb-1 group-hover:text-gold transition-colors">{task.title}</h3>
      <p className="text-[12px] text-text-muted line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

      {linkedBook && (
        <div className="mt-4 p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between group/media">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={linkedBook.cover} alt="" className="w-8 h-8 rounded-md object-cover" />
            <div className="truncate">
              <p className="text-[10px] font-bold text-text truncate">{linkedBook.title}</p>
              <p className="text-[8px] text-text-dim uppercase tracking-wider">{linkedBook.category}</p>
            </div>
          </div>
          <button 
            onClick={() => onPlay?.(linkedBook)}
            className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-bg transition-all"
          >
            {linkedBook.category === 'Manga' ? <ExternalLink size={14} /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>
      )}

      {task.due_date && (
        <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold ${isOverdue ? 'text-red-400' : 'text-text-dim'}`}>
          <Clock size={12} />
          <span>Vence em: {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
}
