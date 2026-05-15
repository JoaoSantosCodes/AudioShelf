export interface TelegramBriefing {
  title: string;
  summary: string;
  tasks: string[];
  urgent: number;
}

export const formatTelegramBriefing = (briefing: TelegramBriefing) => {
  const emojiHeader = "🌅 *BRIEFING MATINAL* 🌅\n\n";
  const body = `*Status:* ${briefing.summary}\n\n`;
  
  let taskSection = "*Missões de Hoje:*\n";
  if (briefing.tasks.length > 0) {
    briefing.tasks.forEach((t, i) => {
      taskSection += `${i + 1}. ${t}\n`;
    });
  } else {
    taskSection += "Nenhuma missão pendente. Dia livre!\n";
  }

  const footer = `\n🔥 *Urgência:* ${briefing.urgent} itens críticos.\n\n_Enviado via MediaShelf Second Brain_`;
  
  return `${emojiHeader}${body}${taskSection}${footer}`;
};

export const sendTelegramMessage = async (chatId: string, text: string) => {
  if (!chatId) {
    console.error("Tentativa de envio sem Chat ID configurado.");
    return { success: false, error: "Missing Chat ID" };
  }

  console.log(`[TELEGRAM MOCK] Enviando para ${chatId}:`, text);
  
  // Simulação de delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));

  return { success: true, timestamp: new Date().toISOString() };
};
