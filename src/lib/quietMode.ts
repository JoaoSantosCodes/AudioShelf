/**
 * Smart Quiet Mode Utility
 * Responsável por gerenciar as janelas de silêncio tático do sistema.
 */

export interface QuietModeSettings {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  enabled: boolean;
}

const DEFAULT_SETTINGS: QuietModeSettings = {
  startHour: 22, // 22:00
  endHour: 7,    // 07:00
  enabled: true
};

/**
 * Verifica se o horário atual está dentro da janela de silêncio.
 */
export const isQuietModeActive = (settings: QuietModeSettings = DEFAULT_SETTINGS): boolean => {
  if (!settings.enabled) return false;

  const now = new Date();
  const currentHour = now.getHours();

  if (settings.startHour > settings.endHour) {
    // Janela que atravessa a meia-noite (ex: 22h às 07h)
    return currentHour >= settings.startHour || currentHour < settings.endHour;
  } else {
    // Janela no mesmo dia (ex: 13h às 14h)
    return currentHour >= settings.startHour && currentHour < settings.endHour;
  }
};

/**
 * Retorna uma mensagem amigável sobre o status do Quiet Mode.
 */
export const getQuietModeStatus = (): string => {
  const active = isQuietModeActive();
  return active 
    ? "🌙 Modo Silencioso Ativo: Notificações externas pausadas." 
    : "☀️ Sistema em Operação Total: Notificações ativas.";
};
