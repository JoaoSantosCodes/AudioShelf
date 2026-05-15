'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { MoreHorizontal, Clock, ArrowLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  category: string;
  created_at: string;
  due_date?: string;
}

interface SortableTaskProps {
  task: Task;
  onMove?: (id: string, status: 'todo' | 'doing' | 'done') => void;
}

export default function SortableTask({ task, onMove }: SortableTaskProps) {
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
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded border border-gold/10">
          {task.category}
        </span>
        <button className="text-text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <h3 className="text-[14px] font-semibold text-text mb-1 group-hover:text-gold transition-colors">{task.title}</h3>
      <p className="text-[12px] text-text-dim line-clamp-2 leading-relaxed mb-4">{task.description}</p>
      
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
