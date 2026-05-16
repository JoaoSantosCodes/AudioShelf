# PRD: Refinamento de Elite — MediaShelf Core (Hub)

## 🎯 Visão do Projeto
Transformar o MediaShelf Hub de um gerenciador de mídias em um **Sistema Operacional Criativo (Creative OS)**. O foco é eliminar o atrito entre o desejo de consumir e o ato de aprender/ler, utilizando automação e design sensorial.

---

## 💎 1. Refinamento Estético & Sensorial (UI/UX)

### GMUD 6: Transições Cinematográficas
*   **Objetivo:** Eliminar o "pulo" entre páginas.
*   **Implementação:** Utilizar `Framer Motion` (Shared Layout Transitions) para que o card do livro se expanda suavemente até se tornar o leitor/player.
*   **Efeito:** "Glassmorphism Dinâmico" que muda de cor sutilmente baseado na capa da mídia ativa.

### GMUD 7: Micro-Interações Bento
*   **Objetivo:** Tornar a interface "viva".
*   **Implementação:** Efeitos de *Glimmer* (brilho) ao passar o mouse, e *Haptic Feedback* virtual em botões críticos.

---

## 🛠️ 2. Melhorias Funcionais (Power Features)

### POC 5: Player Universal Adaptativo
*   **Objetivo:** Um único componente que detecta o tipo de mídia e muda o motor (PDF.js para Mangas, Wavesurfer para Audiobooks, Shaka Player para Vídeos).
*   **Status:** Pendente.

### POC 6: Modo Offline (PWA)
*   **Objetivo:** Acesso total à biblioteca mesmo em ambientes sem conexão.
*   **Implementação:** Service Workers para cache de capas e metadados.

---

## ⚡ 3. Otimização de Performance

### GMUD 8: Turbo Loading & Asset Optimization
*   **Objetivo:** Carregamento instantâneo do Bento Grid.
*   **Implementação:** 
    *   Migração total para `next/image` com placeholders blur.
    *   Implementação de `Dynamic Imports` para o Brain Layer e Media Player (só carregam quando necessários).

---

## 🤖 4. Automação & Inteligência (The Brain Extension)

### GMUD 9: Auto-Catalogação por IA
*   **Objetivo:** O usuário sobe um arquivo e a IA preenche Título, Autor, Categoria e busca a Capa automaticamente.
*   **Implementação:** Integração com APIs de metadados (Google Books, Open Library).

### GMUD 10: Sincronização Neural Silenciosa
*   **Objetivo:** O Brain Layer se atualiza em segundo plano via Web Workers, sem impactar a fluidez do UI principal.

---

## 📈 Critérios de Sucesso
1.  **Lighthouse Score:** 95+ em todas as métricas.
2.  **Time to Interaction:** < 1.2s.
3.  **Engajamento:** Redução no tempo de busca por mídia em 40%.
