import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const {
  TELEGRAM_BOT_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !NEXT_PUBLIC_SUPABASE_URL) {
  console.error("❌ Faltam variáveis de ambiente no .env.local");
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function sync() {
  console.log("🔍 Buscando mensagens do Telegram...");
  
  // Buscar as últimas 20 mensagens
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=20&allowed_updates=["channel_post"]`);
  const data = await response.json();

  if (!data.ok || !data.result || data.result.length === 0) {
    console.log("ℹ️ Nenhuma mensagem encontrada.");
    return;
  }

  let lastCreatedBookId = null;

  for (const update of data.result) {
    const post = update.channel_post;
    if (!post) continue;

    // --- LOGICA DE FOTO (CAPA) ---
    if (post.photo && lastCreatedBookId) {
      const photo = post.photo[post.photo.length - 1]; // Maior resolução
      console.log(`📸 Foto encontrada! Aplicando como capa ao último livro...`);
      // Aqui usamos o proxy para a imagem também
      const coverUrl = `/api/stream?file_id=${photo.file_id}&type=image`;
      await supabase
        .from('books')
        .update({ cover: coverUrl })
        .eq('id', lastCreatedBookId);
      continue;
    }

    // --- LOGICA DE AUDIO OU VÍDEO ---
    const audio = post.audio || (post.document && post.document.mime_type?.startsWith('audio/') ? post.document : null);
    const video = post.video || (post.document && post.document.mime_type?.startsWith('video/') ? post.document : null);
    
    const media = audio || video;
    if (!media) continue;

    const type = video ? 'video' : 'audio';
    const file_id = media.file_id;
    const rawTitle = media.title || media.file_name || "Sem Título";
    const author = media.performer || "Autor Desconhecido";
    const duration = media.duration ? `${Math.floor(media.duration / 60)} min` : "??";

    let bookTitle = rawTitle;
    let chapterTitle = rawTitle;

    if (rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      bookTitle = parts[0].trim();
      chapterTitle = parts.slice(1).join(' - ').trim();
    }

    console.log(`🎵 Processando: "${bookTitle}" - "${chapterTitle}"`);

    // 1. Buscar ou Criar Livro
    let { data: book } = await supabase
      .from('books')
      .select('id')
      .eq('title', bookTitle)
      .maybeSingle();

    if (!book) {
      console.log(`🆕 Criando novo livro: ${bookTitle}`);
      const { data: newBook } = await supabase
        .from('books')
        .insert({
          title: bookTitle,
          author: author,
          duration: duration,
          cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'
        })
        .select()
        .single();
      book = newBook;
    }

    if (book) {
      lastCreatedBookId = book.id;
      // 2. Adicionar Capítulo
      const { data: existing } = await supabase
        .from('chapters')
        .select('id')
        .eq('book_id', book.id)
        .eq('telegram_file_id', file_id)
        .maybeSingle();

      if (!existing) {
        // Tenta extrair número do título para ordenação (ex: "01" -> 1, "Capítulo 10" -> 10)
        const chapterMatch = chapterTitle.match(/(\d+)/);
        const chapterOrder = chapterMatch ? parseInt(chapterMatch[1]) : 0;
        
        await supabase.from('chapters').insert({
          book_id: book.id,
          title: chapterTitle,
          telegram_file_id: file_id,
          chapter_order: chapterOrder,
          type: type
        });
        console.log(`✅ Capítulo "${chapterTitle}" adicionado na posição ${chapterOrder}!`);
      }
    }
  }
  console.log("🚀 Sincronização concluída!");
}

sync();
