'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Headphones, 
  Library, 
  Brain as BrainIcon, 
  X 
} from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useMedia } from '@/context/MediaContext';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen, selectedCategory, setSelectedCategory, isPureMode } = useNavigation();
  const { activeMedia, closeMedia } = useMedia();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const categories = ['Todos', 'Manga', 'Audiobook', 'Cursos', 'Música'];

  if (isPureMode) return null;

  return (
    <aside 
      className={`fixed md:sticky top-0 left-0 z-50 w-72 h-screen bg-surface-1 border-r border-border-custom flex flex-col shrink-0 overflow-y-auto no-scrollbar transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
            <Headphones className="text-bg" size={20} />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight text-text">MediaShelf</h1>
        </Link>
        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-text-muted hover:text-text">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Menu Principal</div>
        <Link 
          href="/"
          onClick={() => { closeMedia(); setIsSidebarOpen(false); setSelectedCategory('Todos'); }}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/' ? 'bg-gold/10 text-gold' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
        >
          <Library size={18} />
          <span className="text-sm font-semibold">Biblioteca</span>
        </Link>

        <Link 
          href="/brain"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/brain' ? 'bg-gold/10 text-gold' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
        >
          <BrainIcon size={18} />
          <span className="text-sm font-semibold">Brain Layer</span>
        </Link>

        {pathname === '/' && (
          <>
            <div className="pt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim/50">Categorias</div>
            <div className="grid grid-cols-1 gap-1">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsSidebarOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat ? 'text-gold bg-gold/5' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
                >
                  <div className={selectedCategory === cat ? "w-1 h-1 rounded-full bg-gold" : "w-1 h-1 rounded-full bg-text-dim/30"} />
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="p-6 border-t border-border-custom bg-surface-1/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center border border-white/5 shadow-xl">
            <span className="text-xs font-bold text-gold">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-text truncate">{user?.email || 'Visitante'}</p>
            <p className="text-[10px] text-text-dim truncate">Membro Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
