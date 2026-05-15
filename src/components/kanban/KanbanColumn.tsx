'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus } from 'lucide-react';
import SortableTask from './SortableTask';
import { Book } from '@/data/books';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  category: string;
  created_at: string;
  linked_book_id?: string;
  due_date?: string;
}

interface KanbanColumnProps {
  id: 'todo' | 'doing' | 'done';
  title: string;
  icon: any;
  tasks: Task[];
  books: Book[];
  onPlay: (book: Book) => void;
  onAddTask: (status: 'todo' | 'doing' | 'done') => void;
}

export default function KanbanColumn({ id, title, icon: Icon, tasks, books, onPlay, onAddTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 flex flex-col min-w-[300px]">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg bg-surface-2 border border-border-custom ${id === 'doing' ? 'text-amber' : id === 'done' ? 'text-green-500' : 'text-text-dim'}`}>
            <Icon size={18} />
          </div>
          <h2 className="font-semibold text-text tracking-wide uppercase text-[12px]">{title}</h2>
          <span className="bg-surface-3 text-text-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
            {tasks.length}
          </span>
        </div>
        <button className="text-text-muted hover:text-text"><MoreHorizontal size={18} /></button>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 space-y-4 overflow-y-auto no-scrollbar pb-10 min-h-[200px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => {
            const linkedBook = books.find(b => b.id === task.linked_book_id);
            return (
              <SortableTask 
                key={task.id} 
                task={task} 
                linkedBook={linkedBook}
                onPlay={onPlay}
              />
            );
          })}
        </SortableContext>
        
        <button 
          onClick={() => onAddTask(id)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border-custom text-text-muted hover:border-gold/30 hover:text-gold transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>
    </div>
  );
}
