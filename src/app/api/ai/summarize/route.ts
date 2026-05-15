import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { text, book_id } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Configuração pendente: OPENAI_API_KEY não encontrada.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Você é um assistente de produtividade de elite. Seu objetivo é resumir transcrições de cursos ou livros em bullet points acionáveis (Insights) e um resumo executivo curto. Use um tom profissional e tático." 
        },
        { 
          role: "user", 
          content: `Por favor, resuma o seguinte texto:\n\n${text}` 
        }
      ],
      temperature: 0.5,
    });

    const summary = response.choices[0].message.content;

    // Salvar o resumo no livro/projeto correspondente
    if (book_id) {
      await supabase
        .from('books')
        .update({ summary: summary })
        .eq('id', book_id);
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Erro no resumo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
