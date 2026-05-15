import { supabase } from './supabase';

export interface SmartNotification {
  id: string;
  type: 'finance' | 'task' | 'shopping' | 'system';
  title: string;
  text: string;
  color: string;
  time: string;
  icon: string;
}

export const checkSmartAlerts = async (userId: string) => {
  const alerts: SmartNotification[] = [];
  const now = new Date();

  // 1. Verificar Limites Financeiros
  const budgetLimit = 5000;
  const { data: txData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense');
  
  const totalExp = txData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  
  if (totalExp >= budgetLimit) {
    alerts.push({
      id: `fin-critical-${Date.now()}`,
      type: 'finance',
      title: 'Limite Excedido!',
      text: `Você gastou R$ ${totalExp.toLocaleString('pt-BR')}, ultrapassando o limite de R$ ${budgetLimit.toLocaleString('pt-BR')}.`,
      color: 'text-red-400',
      time: 'Agora',
      icon: 'Wallet'
    });
  } else if (totalExp >= budgetLimit * 0.8) {
    alerts.push({
      id: `fin-warning-${Date.now()}`,
      type: 'finance',
      title: 'Orçamento Apertado',
      text: `Atenção: Você já utilizou 80% do seu limite mensal (R$ ${totalExp.toLocaleString('pt-BR')}).`,
      color: 'text-gold',
      time: 'Agora',
      icon: 'TrendingUp'
    });
  }

  // 2. Verificar Tarefas Vencendo (Próximas 24h)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'done')
    .lte('due_date', tomorrow.toISOString());

  if (tasksData && tasksData.length > 0) {
    alerts.push({
      id: `task-urgent-${Date.now()}`,
      type: 'task',
      title: 'Missões Urgentes',
      text: `Você tem ${tasksData.length} tarefas vencendo nas próximas 24h. Foco total!`,
      color: 'text-emerald-400',
      time: 'Agora',
      icon: 'Calendar'
    });
  }

  return alerts;
};

export const generateDailyBriefing = async (userId: string) => {
  const { data: shopping } = await supabase.from('shopping_list').select('*').eq('user_id', userId).eq('completed', false);
  const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).neq('status', 'done');
  
  return {
    title: "🌅 Briefing Matinal",
    summary: `Hoje você tem ${tasks?.length || 0} missões pendentes e ${shopping?.length || 0} itens para comprar no mercado.`,
    tasks: tasks?.slice(0, 3).map(t => t.title),
    urgent: tasks?.filter(t => t.priority === 'high').length || 0
  };
};
