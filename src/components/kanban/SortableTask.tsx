'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
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
  Share2
} from 'lucide-react';
import { Book } from '@/data/books';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  category: string;
  created_at: string;
  due_date?: string;
  linked_book_id?: string;
}

interface SortableTaskProps {
  task: Task;
  linkedBook?: Book;
  onPlay?: (book: Book) => void;
  onMove?: (id: string, status: 'todo' | 'doing' | 'done') => void;
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
      <p className="text-[12px] text-text-dim line-clamp-2 leading-relaxed mb-4">{task.description}</p>
      
      {linkedBook && (
        <div className="mb-4 p-2 rounded-lg bg-gold/5 border border-gold/10 flex items-center justify-between group/link">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded bg-surface-3 flex items-center justify-center shrink-0">
              {linkedBook.category === 'Manga' ? <ExternalLink size={12} className="text-gold" /> : <Play size={12} className="text-gold" />}
            </div>
            <span className="text-[11px] text-text font-medium truncate">{linkedBook.title}</span>
          </div>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(linkedBook);
            }}
            className="p-1.5 rounded-md bg-gold text-bg opacity-0 group-hover/link:opacity-100 transition-opacity"
          >
            {linkedBook.category === 'Manga' ? <ExternalLink size={12} /> : <Play size={12} />}
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-border-custom">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full border-2 border-bg bg-surface-3 flex items-center justify-center text-[10px] font-bold text-gold">JS</div>
          </div>
          {task.due_date && (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-text-muted'}`}>
              <Clock size={10} />
              {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
        <span className="text-[10px] text-text-muted font-medium">
          {new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
