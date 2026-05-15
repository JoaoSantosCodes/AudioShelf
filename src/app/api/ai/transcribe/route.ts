import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { file_id, chapter_id } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Configuração pendente: OPENAI_API_KEY não encontrada.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1. Obter link do arquivo via Telegram (usando o token existente)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
    const fileData = await fileRes.json();
    
    if (!fileData.ok) throw new Error('Erro ao obter arquivo do Telegram');

    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;

    // 2. Download do áudio para buffer
    const audioRes = await fetch(fileUrl);
    const audioBuffer = await audioRes.arrayBuffer();
    
    // 3. Enviar para Whisper
    // Nota: Whisper espera um arquivo real, usaremos o buffer como File
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
      model: "whisper-1",
    });

    // 4. Salvar no Supabase
    if (chapter_id) {
      await supabase
        .from('chapters')
        .update({ transcription: transcription.text })
        .eq('id', chapter_id);
    }

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Erro na transcrição:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
