# 📄 PRD: MediaShelf - Melhorias Contínuas & Roadmap

**Visão:** Transformar o MediaShelf no hub definitivo de consumo de mídia e gestão de projetos criativos (Manga, SaaS, Música, Cursos) com uma experiência premium e automatizada via Telegram.

---

## 🎯 Status Atual (Concluído)
- [x] **Interface Premium:** Glassmorphism, paleta Ouro/Obsidiana e tipografia editorial.
- [x] **Hub Multi-Hobby:** Categorização automática via hashtags (#manga, #saas, etc.).
- [x] **Smart Intake:** Webhook universal (Canais, Grupos, DMs) com reconhecimento flexível de artes.
- [x] **Media Player Híbrido:** Suporte otimizado para Áudio e Vídeo (MP4, MKV, MP3).
- [x] **Centro de Comando:** Integração de Kanban de projetos integrado à biblioteca.
- [x] **User Experience:** Seção "Continuar de onde parou" e sincronização com Supabase.

---

## 🚀 Roadmap de Próximas Melhorias

### 1. 🎨 UI/UX & Aesthetics
- [x] **Waveform Visualizer:** Adicionar visualizador de ondas sonoras dinâmico para projetos do Suno.AI.
- [x] **Modo Leitura Manga:** Implementar um visualizador de imagens otimizado para rascunhos de Manga.
- [x] **Micro-interações:** Adicionar animações Framer Motion ao abrir cards e trocar de colunas no Kanban.
- [x] **Temas Dinâmicos:** Permitir troca sutil entre "Obsidian Gold" (atual) e "Cyber Tactical" (neon).

### 2. 🧠 Inteligência & Automação
- [ ] **AI Transcriber:** Usar OpenAI Whisper para transcrever áudios de cursos automaticamente.
- [ ] **Resumo de Insights:** Gerar resumos automáticos de capítulos de livros usando IA.
- [ ] **Notificações Push:** Avisar no navegador quando um novo projeto for processado via Telegram.

### 3. 🛠️ Gestão & Kanban
- [x] **Drag & Drop Real:** Implementar `dnd-kit` para arrastar cards entre colunas no Kanban.
- [x] **Deadline Tracking:** Adicionar datas de entrega e alertas visuais para tarefas atrasadas.
- [ ] **Anexos de Mídia:** Permitir abrir o áudio/vídeo do projeto diretamente de um card do Kanban.

### 4. 📱 Mobile & PWA
- [ ] **PWA Full:** Garantir instalação 100% offline-ready com Service Workers.
- [ ] **Controles de Lockscreen:** Integrar com a Media Session API para controlar o player pela tela de bloqueio do celular.

---

## 📈 Checklist de Manutenção Técnica
- [ ] **Refatoração de State:** Mover estados globais para Context API ou Zustand se o app crescer muito.
- [ ] **Otimização de Imagens:** Usar `next/image` para carregar as artes de capa com prioridade.
- [ ] **Segurança:** Implementar Row Level Security (RLS) no Supabase para isolar dados de múltiplos usuários.

---

## 📌 Notas de Evolução
> O MediaShelf deve sempre priorizar a **estética** e a **velocidade**. Cada nova funcionalidade deve parecer parte de um ecossistema editorial premium.
