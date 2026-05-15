import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    console.log('Receiving Telegram Update:', JSON.stringify(update));

    const post = update.channel_post;
    if (!post) return NextResponse.json({ ok: true });

    // --- LÓGICA DE FOTO (CAPA) ---
    if (post.photo) {
      const photo = post.photo[post.photo.length - 1]; // Maior resolução
      const bookTitle = post.caption?.trim();
      
      if (bookTitle) {
        console.log(`📸 Foto recebida para o livro: ${bookTitle}`);
        const coverUrl = `/api/stream?file_id=${photo.file_id}&type=image`;
        
        await supabase
          .from('books')
          .update({ cover: coverUrl })
          .ilike('title', bookTitle);
      }
      return NextResponse.json({ ok: true });
    }

    // Aceita arquivos de áudio ou vídeo (ou documentos que sejam mídia)
    const audio = post.audio || (post.document && post.document.mime_type?.startsWith('audio/') ? post.document : null);
    const video = post.video || (post.document && post.document.mime_type?.startsWith('video/') ? post.document : null);

    const media = audio || video;
    if (!media) {
      return NextResponse.json({ ok: true, message: 'No media found' });
    }

    const type = video ? 'video' : 'audio';
    const file_id = media.file_id;
    
    // Prioridade: Legenda da mensagem > Título do arquivo > Nome do arquivo > Padrão
    const rawTitle = post.caption || media.title || media.file_name || "Sem Título";
    
    const author = media.performer || (type === 'video' ? "Diretor Desconhecido" : "Autor Desconhecido");
    const duration = media.duration ? `${Math.floor(media.duration / 60)} min` : "??";
    const category = type === 'video' ? 'Vídeo' : 'Audiobook';

    // Lógica simples de Split: "1984 - Capítulo 01" -> Livro: "1984", Capítulo: "Capítulo 01"
    let bookTitle = rawTitle;
    let chapterTitle = rawTitle;

    if (rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      bookTitle = parts[0].trim();
      chapterTitle = parts.slice(1).join(' - ').trim();
    }

    console.log(`Processing: Book="${bookTitle}", Chapter="${chapterTitle}"`);

    // 1. Buscar ou Criar o Livro
    let { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('title', bookTitle)
      .maybeSingle();

    if (!book) {
      console.log(`Creating new book: ${bookTitle}`);
      const { data: newBook, error: createError } = await supabase
        .from('books')
        .insert({
          title: bookTitle,
          author: author,
          duration: duration,
          category: category,
          cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400' // Placeholder
        })
        .select()
        .single();
      
      if (createError) throw createError;
      book = newBook;
    }

    if (book) {
      // 2. Verificar se o capítulo já existe
      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('book_id', book.id)
        .eq('telegram_file_id', file_id)
        .maybeSingle();

      if (!existingChapter) {
        // 3. Pegar a última ordem para incrementar
        // Extrair número do título para ordenação correta
        const chapterMatch = chapterTitle.match(/(\d+)/);
        const chapterOrder = chapterMatch ? parseInt(chapterMatch[1]) : 0;

        console.log(`Adding chapter: ${chapterTitle} (Order: ${chapterOrder})`);
        await supabase.from('chapters').insert({
          book_id: book.id,
          title: chapterTitle,
          telegram_file_id: file_id,
          chapter_order: chapterOrder,
          type: type
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
