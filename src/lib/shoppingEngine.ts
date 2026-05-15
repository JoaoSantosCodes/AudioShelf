import { supabase } from './supabase';

export interface Suggestion {
  name: string;
  category: string;
  confidence: number; // 0 to 1
}

export const getSmartSuggestions = async (userId: string) => {
  // 1. Buscar histórico de itens comprados (concluídos)
  const { data: history } = await supabase
    .from('shopping_list')
    .select('name, category')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (!history || history.length === 0) {
    // Sugestões básicas se não houver histórico
    return [
      { name: 'Leite', category: 'Laticínios', confidence: 0.5 },
      { name: 'Café', category: 'Matinal', confidence: 0.5 },
      { name: 'Pão', category: 'Padaria', confidence: 0.5 }
    ];
  }

  // 2. Buscar itens atuais (para não sugerir o que já está na lista)
  const { data: current } = await supabase
    .from('shopping_list')
    .select('name')
    .eq('user_id', userId)
    .eq('completed', false);

  const currentNames = new Set(current?.map(i => i.name.toLowerCase()));

  // 3. Contabilizar frequência e filtrar
  const freqMap: Record<string, { count: number; category: string }> = {};
  
  history.forEach(item => {
    const name = item.name;
    if (!currentNames.has(name.toLowerCase())) {
      if (!freqMap[name]) {
        freqMap[name] = { count: 0, category: item.category || 'Geral' };
      }
      freqMap[name].count++;
    }
  });

  // 4. Transformar em lista de sugestões ordenadas por frequência
  const suggestions: Suggestion[] = Object.entries(freqMap)
    .map(([name, data]) => ({
      name,
      category: data.category,
      confidence: Math.min(1, data.count / 3) // Ex: Se comprou 3x, confiança máxima
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return suggestions;
};
