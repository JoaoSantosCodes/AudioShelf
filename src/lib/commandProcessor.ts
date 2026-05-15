import { supabase } from './supabase';

export interface CommandResponse {
  success: boolean;
  message: string;
  module: 'finance' | 'shopping' | 'kanban' | 'unknown';
  data?: any;
}

export const processVoiceCommand = async (text: string, userId: string): Promise<CommandResponse> => {
  const input = text.toLowerCase();
  
  // LOGICA PARA FINANÇAS (Ex: "Gastei 50 reais com pizza")
  if (input.includes('gastei') || input.includes('paguei') || input.includes('reais')) {
    const amountMatch = input.match(/\d+([.,]\d+)?/);
    const amount = amountMatch ? parseFloat(amountMatch[0].replace(',', '.')) : 0;
    
    let category = 'Outros';
    if (input.includes('mercado')) category = 'Mercado';
    if (input.includes('pizza') || input.includes('comer') || input.includes('lanche')) category = 'Lazer';
    if (input.includes('carro') || input.includes('uber') || input.includes('combustivel')) category = 'Transporte';

    const description = text.replace(/gastei|paguei|reais|no|na|com/gi, '').trim();

    const { data, error } = await supabase.from('transactions').insert([{
      user_id: userId,
      description: description || 'Despesa por Voz',
      amount: amount,
      category: category,
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }]).select();

    if (error) return { success: false, message: 'Erro ao salvar despesa.', module: 'finance' };
    return { success: true, message: `Registrado: R$ ${amount} em ${category}`, module: 'finance', data: data[0] };
  }

  // LOGICA PARA MERCADO (Ex: "Adicionar leite na lista de compras")
  if (input.includes('comprar') || input.includes('mercado') || input.includes('lista')) {
    const item = text.replace(/adicionar|na|lista|de|compras|mercado|comprar/gi, '').trim();
    
    const { data, error } = await supabase.from('shopping_list').insert([{
      user_id: userId,
      name: item,
      completed: false
    }]).select();

    if (error) return { success: false, message: 'Erro ao adicionar ao mercado.', module: 'shopping' };
    return { success: true, message: `Adicionado ao mercado: ${item}`, module: 'shopping', data: data[0] };
  }

  // LOGICA PARA KANBAN (Ex: "Lembrar de levar o lixo")
  if (input.includes('tarefa') || input.includes('lembrar') || input.includes('missão')) {
    const task = text.replace(/lembrar|de|tarefa|missão|criar/gi, '').trim();
    
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: userId,
      title: task,
      status: 'todo',
      priority: 'medium'
    }]).select();

    if (error) return { success: false, message: 'Erro ao criar tarefa.', module: 'kanban' };
    return { success: true, message: `Missão criada: ${task}`, module: 'kanban', data: data[0] };
  }

  return { success: false, message: 'Não entendi o comando. Tente "Gastei X reais..." ou "Comprar Y..."', module: 'unknown' };
};
