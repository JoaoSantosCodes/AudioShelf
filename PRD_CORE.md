# PRD — MediaShelf Core (Pure Hub)

## 🎯 Visão do Produto
Transformar o MediaShelf no hub criativo definitivo para consumo imersivo de mídias de nicho (Manga, Suno Audiobooks e Cursos), eliminando qualquer ruído utilitário.

---

## 🚀 POC 1: Layout Imersivo (Inspirado em Immersive Shelf)
**Objetivo:** Criar uma experiência de "Estúdio" que valorize o conteúdo.

### Funcionalidades:
- [ ] **Bento Grid Library:** Organização visual de ativos por relevância e tipo.
- [ ] **Modo Pure Real:** Toggle que esconde menus e foca 100% no player/leitor.
- [ ] **Tactical Navigation:** Navbar fixa com efeito glassmorphism e transparência dinâmica.

---

## 📦 GMUD 1: Transição para Player Premium
**Mudanças Planejadas:**
- Substituir o player padrão por um player com **Feedback Haptico** no scrub.
- Implementar transições de página "Noir" (fade-out profundo).
- Adicionar suporte a capítulos via gestos.

---

## 🛠️ Requisitos Técnicos
- **Frontend:** Next.js 15+ (App Router).
- **Styling:** Tailwind CSS + Framer Motion para micro-interações.
- **Data:** Supabase (tabelas: `books`, `manga_progress`, `courses`).
