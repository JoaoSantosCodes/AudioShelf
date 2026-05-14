'use client';

import React, { useState, useEffect } from 'react';
import { books as initialBooks, Book } from '@/data/books';
import BookCard from '@/components/BookCard';
import AudioPlayer from '@/components/AudioPlayer';
import { Headphones, Library, X, Search, RefreshCcw, Database, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ... (previous functions fetchBooks, deleteBook, etc remain same)
  // I will just keep the state here and modify the return block

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          chapters (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformed: Book[] = data.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          cover: b.cover,
          duration: b.duration,
          purchase_url: b.purchase_url,
          chapters: (b.chapters || [])
            .sort((a: any, b: any) => a.chapter_order - b.chapter_order)
            .map((c: any) => ({
              id: c.id,
              title: c.title,
              telegram_file_id: c.telegram_file_id
            }))
        }));
        setDbBooks(transformed);
      }
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const deleteBook = async (bookId: string) => {
    try {
      console.log("!!! COMANDO DE EXCLUSÃO DISPARADO !!! ID:", bookId);
      
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) {
        alert("Erro no Supabase: " + error.message);
        throw error;
      }

      alert("Livro excluído com sucesso!");
      setDbBooks(prev => prev.filter(b => b.id !== bookId));
      if (selectedBook?.id === bookId) setSelectedBook(null);
      
    } catch (err: any) {
      console.error("Erro fatal na exclusão:", err);
    }
  };

  const updateBookData = async (bookId: string, fields: Partial<Book>) => {
    try {
      const { error } = await supabase.from('books').update(fields).eq('id', bookId);
      if (error) throw error;
      fetchBooks();
      // Update selectedBook if it's the one being edited
      if (selectedBook?.id === bookId) {
        setSelectedBook(prev => prev ? { ...prev, ...fields } : null);
      }
    } catch (err) {
      alert("Erro ao atualizar dados");
    }
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    for (const book of initialBooks) {
      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          cover: book.cover,
          duration: book.duration
        })
        .select()
        .single();

      if (bookError) continue;

      const chaptersToInsert = book.chapters.map((c, idx) => ({
        book_id: newBook.id,
        title: c.title,
        telegram_file_id: c.telegram_file_id,
        chapter_order: idx
      }));

      await supabase.from('chapters').insert(chaptersToInsert);
    }
    fetchBooks();
  };

  const filteredBooks = dbBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-border-custom bg-surface shrink-0 z-[60]">
        <div className="flex items-center gap-2.5 font-serif text-lg md:text-xl text-gold tracking-tight">
          {selectedBook && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-1.5 -ml-1 text-text-dim active:text-gold"
            >
              <List size={20} />
            </button>
          )}
          <span className="hidden sm:inline">📚</span>
          AudioShelf
        </div>
        
        <nav className="flex gap-1">
          <button 
            onClick={() => { setSelectedBook(null); setIsSidebarOpen(false); }}
            className={`px-3 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all ${!selectedBook ? 'bg-surface-3 text-gold' : 'text-text-dim hover:bg-surface-2 hover:text-text'}`}
          >
            Biblioteca
          </button>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-3 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all ${isAdminMode ? 'bg-amber/10 text-amber' : 'text-text-dim hover:bg-surface-2 hover:text-text'}`}
          >
            {isAdminMode ? 'Admin' : 'Gerenciar'}
          </button>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-3 border border-border-custom flex items-center justify-center text-sm cursor-pointer hover:bg-surface-2 transition-colors">
            👤
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR (Drawer on Mobile, Fixed on Desktop) */}
        {selectedBook && (
          <>
            {/* Mobile Overlay */}
            <div 
              className={`fixed inset-0 bg-black/60 z-[50] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <aside className={`
              fixed md:relative inset-y-0 left-0 w-[280px] md:w-[260px] bg-surface border-r border-border-custom 
              flex flex-col shrink-0 z-[55] transition-transform duration-300 ease-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              <div className="flex items-center justify-between px-5 pt-5 pb-2.5">
                <div className="text-[10px] font-medium tracking-[0.12em] uppercase text-text-muted">
                  Capítulos
                </div>
                <div className="flex items-center gap-2">
                  {isAdminMode && (
                    <button onClick={() => deleteBook(selectedBook.id)} className="text-red-500 hover:text-red-400 p-1">
                      <X size={14} />
                    </button>
                  )}
                  <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-text-muted p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
                {selectedBook.chapters.map((chapter, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-surface-2 transition-all mb-0.5 group"
                    onClick={() => {
                      // Logic for selecting chapter could be added here if we want to force it
                      setIsSidebarOpen(false);
                    }}
                  >
                    <span className="text-[11px] text-text-muted w-4.5 text-center shrink-0 group-hover:text-gold transition-colors">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-text-dim truncate group-hover:text-text transition-colors">
                        {chapter.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </>
        )}

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {selectedBook ? (
              /* BOOK HERO */
              <div className="flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-500">
                <div className="w-40 h-[220px] rounded-lg bg-gradient-to-br from-[#2a2318] to-[#1a1410] border border-border-custom shrink-0 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                  <img src={selectedBook.cover} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-r from-black/40 to-transparent rounded-l-lg"></div>
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gold font-medium mb-2.5">
                    Clássico · Narrado
                  </div>
                  {isAdminMode ? (
                    <div className="space-y-2 mb-4">
                      <input 
                        type="text"
                        placeholder="Título do Livro"
                        defaultValue={selectedBook.title}
                        onBlur={(e) => updateBookData(selectedBook.id, { title: e.target.value })}
                        className="bg-surface-3 border border-gold/30 rounded px-2 py-1 font-serif text-3xl leading-tight text-text w-full outline-none focus:border-gold"
                      />
                      <input 
                        type="text"
                        placeholder="Link de Compra (Amazon, etc)"
                        defaultValue={selectedBook.purchase_url}
                        onBlur={(e) => updateBookData(selectedBook.id, { purchase_url: e.target.value })}
                        className="bg-surface-3 border border-gold/30 rounded px-2 py-1 text-xs text-gold w-full outline-none focus:border-gold"
                      />
                    </div>
                  ) : (
                    <h1 className="font-serif text-4xl leading-tight mb-2 text-text">
                      {selectedBook.title}
                    </h1>
                  )}
                  
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-text-dim">
                      {selectedBook.author} · Narrado por: IA Premium
                    </p>
                    
                    {selectedBook.purchase_url && !isAdminMode && (
                      <a 
                        href={selectedBook.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gold/10 border border-gold/50 text-gold text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gold hover:text-bg transition-all"
                      >
                        Comprar Livro
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-6 mb-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-medium text-text">{selectedBook.duration}</span>
                      <span className="text-[11px] text-text-muted uppercase tracking-wider">Duração</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-medium text-text">{selectedBook.chapters.length}</span>
                      <span className="text-[11px] text-text-muted uppercase tracking-wider">Capítulos</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Progresso geral</span>
                      <span>24% concluído</span>
                    </div>
                    <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* LIBRARY GRID */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-text">
                  {selectedBook ? "Outros da Biblioteca" : "Sua Biblioteca"}
                </h2>
                
                {!selectedBook && (
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-gold transition-colors" size={14} />
                    <input 
                      type="text" 
                      placeholder="Buscar..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-surface-2 border border-border-custom rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none focus:border-gold/50 transition-all w-48"
                    />
                  </div>
                )}
              </div>

              {dbBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="relative group">
                      {isAdminMode && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 rounded-lg">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteBook(book.id);
                            }}
                            className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-500 hover:scale-110 active:scale-95 transition-all"
                          >
                            <X size={32} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                      <BookCard 
                        book={book} 
                        onSelect={setSelectedBook} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface border border-border-custom rounded-2xl flex flex-col items-center gap-4">
                  {isLoading ? (
                    <RefreshCcw className="animate-spin text-gold" size={32} />
                  ) : (
                    <>
                      <Database className="text-text-muted" size={48} />
                      <p className="text-text-muted italic">Seu banco de dados está vazio.</p>
                      <button 
                        onClick={seedDatabase}
                        className="mt-4 bg-gold text-bg px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <RefreshCcw size={18} /> Importar Catálogo Inicial
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* PLAYER BAR (Visible when book selected) */}
      {selectedBook && (
        <AudioPlayer book={selectedBook} />
      )}
    </div>
  );
}
