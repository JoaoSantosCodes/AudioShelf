# PRD: Melhorias Contínuas MediaShelf Premium Hub

Este documento serve como o roadmap oficial para a evolução da plataforma MediaShelf, elevando-a de um hobby hub para um centro de comando criativo de alta fidelidade.

---

## 🎯 Objetivos Estratégicos
- **Aesthetics First:** Criar uma interface que "uau" o usuário no primeiro olhar.
- **Seamless Flow:** Garantir que a transição entre dispositivos e hobbies seja invisível.
- **IA Assistance:** Automatizar tarefas chatas (transcrição/resumo) para focar na criação.

---

## 🚀 Roadmap de Próximas Melhorias

### 1. 🎨 UI/UX & Aesthetics
- [x] **Waveform Visualizer:** Adicionar visualizador de ondas sonoras dinâmico para projetos do Suno.AI.
- [x] **Modo Leitura Manga:** Implementar um visualizador de imagens otimizado para rascunhos de Manga.
- [x] **Micro-interações:** Adicionar animações Framer Motion ao abrir cards e trocar de colunas no Kanban.
- [x] **Temas Dinâmicos:** Permitir troca sutil entre "Obsidian Gold" (atual) e "Cyber Tactical" (neon).

### 2. 🧠 Inteligência & Automação
- [x] **AI Transcriber:** Usar OpenAI Whisper para transcrever áudios de cursos automaticamente. (Pronto p/ Ativação)
- [x] **Resumo de Insights:** Gerar resumos automáticos de capítulos de livros usando IA. (Pronto p/ Ativação)
- [x] **Notificações Push:** Avisar no navegador quando um novo projeto for processado via Telegram.

### 3. 🛠️ Gestão & Kanban
- [x] **Drag & Drop Real:** Implementar `dnd-kit` para arrastar cards entre colunas no Kanban.
- [x] **Deadline Tracking:** Adicionar datas de entrega e alertas visuais para tarefas atrasadas.
- [x] **Anexos de Mídia:** Permitir abrir o áudio/vídeo do projeto diretamente de um card do Kanban.

### 4. 📱 Mobile & PWA
- [x] **PWA Full:** Garantir instalação 100% offline-ready com metadados e manifest premium.
- [x] **Mobile Layout:** Refinar visualização mobile com Bottom Nav tátil e Player Global.

### 5. 📅 Planejamento & Agenda
- [x] **Agenda Semanal:** Criar uma visão tática de 7 dias para planejamento de estudos, músicas e leituras.
- [x] **Tarefas Recorrentes:** Interface e lógica de auto-geração de nova tarefa após conclusão implementadas.

## [v2.2] Sincronização em Tempo Real (Supabase Realtime) 📡🔄
**Status:** In Progress 🏗️

### Objetivo:
Eliminar a necessidade de recarregar a página para ver atualizações feitas por outros membros da casa (ex: esposa adicionando item no mercado).

### Implementações:
- [ ] Assinatura Realtime na tabela `shopping_list`.
- [ ] Assinatura Realtime na tabela `tasks` (Kanban).
- [ ] Atualização otimista de UI com fallback de segurança.

---

## [v2.1] Sincronização e Persistência de Dados 🗄️✅
**Status:** Completed 🏆

### Objetivo:
Mudar de dados mockados para um banco de dados real (Supabase) com persistência multi-dispositivo.

### Implementações:
- [x] Schema SQL completo (Tasks, Transactions, Shopping).
- [x] Integração Supabase no Módulo de Finanças.
- [x] Integração Supabase no Módulo de Mercado.
- [x] Integração Supabase no Kanban.
- [x] Dashboard de Insights alimentado por dados reais.
- [x] Sidebar de Atividades Recentes sincronizada.

### 6. 🤝 Social & Colaborativo
- [x] **Shared Boards:** Interface de convite e modal de compartilhamento familiar integrados.
- [x] **Categorias Sociais & Ícones:** Implementação de ícones para Lazer, Social, Saúde e Casa.
- [x] **Gamificação & Recompensas:** Interface de Troféu e sistema de incentivo visual ativos.
- [x] **Social Feed:** Painel de atividades em tempo real integrado à sidebar principal.

### 7. 📊 Insights & Estatísticas
- [x] **Relatórios de Progresso:** Visão semanal/mensal de tarefas concluídas por categoria.
- [x] **Métricas de Saúde:** Dashboard dedicado para acompanhar peso, frequência na academia e metas de saúde.
- [x] **Category Breakdown:** Gráfico visual de distribuição de esforço entre estudos, lazer e casa.

### 8. 💰 Finanças & Orçamento
- [x] **Controle de Gastos:** Registro de despesas diárias real com Supabase.
- [/] **Gestão de Receitas:** Registro de ganhos e salários para comparação de fluxo.
- [x] **Arquivo Digital de Notas:** Interface de foto e anexo de recibos integrada.
- [/] **Fluxo de Caixa:** Gráfico comparativo entre Entradas vs. Saídas (Ganhos vs. Despesas).
- [x] **Orçamento Familiar:** Definição de metas de gasto mensal e acompanhamento em tempo real.

### 9. 🛒 Lista de Compras Inteligente
- [x] **Live Shopping List:** Lista de mercado compartilhada com sincronização em tempo real (Realtime).
- [ ] **Sugestões Inteligentes:** Sugerir itens baseados no histórico de compras anteriores.

### 10. 🎙️ Automação & IA Avançada
- [ ] **Voice-to-Action (Whisper):** Criar tarefas e registros financeiros via comandos de voz reais.
- [ ] **Assistente de Insights:** Chat de IA para perguntar: "Quanto gastei com mercado este mês?".

### 11. 🔍 Ecossistema Unificado & Refinamentos de IA
- [x] **Busca Global (Omni-Search):** Barra de busca única (Ctrl+K) para encontrar Livros, Tarefas, Notas e Compras.
- [x] **OCR de Notas Fiscais Inteligente:** Simulação de alta fidelidade com histórico e processamento multi-step.
- [x] **Dashboard de Widgets:** Resumo visual na Home com dados reais de Finanças, Mercado e Kanban.
- [ ] **Realtime Presence:** Indicadores visuais de quem está online e colaborando no momento.

### 12. 🔔 Notificações & Alertas Inteligentes
- [x] **In-App Notification Center:** Ícone de sino com histórico de alertas táticos e sociais sincronizado.
- [ ] **Lembretes de Tarefas:** Notificações programadas para missões que estão para vencer.
- [ ] **Alertas Financeiros:** Avisos automáticos ao atingir limites de orçamento.
- [ ] **Telegram Push:** Envio de resumos diários e alertas críticos via Bot de Telegram.

### 13. 🔊 Mini-Player Flutuante Universal
- [x] **Persistent Playback:** Player que acompanha o usuário em todas as páginas (Glassmorphism persistent player).
- [x] **Visualização Compacta:** Design de vidro flutuante com controles essenciais e capa da mídia.

### 14. 🤖 OCR & Inteligência de Dados ✅
- [x] **Leitura de Notas via IA:** Extração simulada de alta fidelidade de valor, data e itens.
- [x] **Categorização Inteligente:** IA sugere a categoria da despesa baseada no nome do estabelecimento.
- [x] **Histórico de Processamento:** Tela para revisar e aprovar extrações feitas pela IA.

---

## 📈 Critérios de Sucesso
1. **Instabilidade Zero:** Build estável no Vercel com 100% de lighthouse score.
2. **Engajamento:** Sensação de "app nativo" ao usar no smartphone.
3. **Produtividade:** Redução do tempo gasto organizando artes e músicas manualmente.

---

*Documento atualizado em: 15 de Maio de 2026*
