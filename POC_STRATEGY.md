# Estratégia de POCs — MediaShelf Evolution

Este documento descreve a estratégia de validação por Proof of Concept (POC) para a reestruturação do MediaShelf, visando transformar um monolito multifuncional em produtos focados e de alto valor.

---

## 🎯 Objetivo Central
Isolar os domínios do MediaShelf para validar se cada módulo se sustenta como uma ferramenta independente de elite ou se deve ser descartado/integrado de forma mais leve.

---

## 🏗️ POC 1: MediaShelf Pure (O Hub Criativo)
**Status:** ✅ Concluída (Isolamento de Interface)

### Visão
Remover tudo o que não é "Core Criativo" (Suno, Manga, Audiobooks, Cursos) para testar se a experiência focada gera mais engajamento e clareza.

### Critérios de Sucesso
- [x] Interface sem widgets de utilitários (Finanças/Mercado).
- [x] Navegação 100% dedicada a mídias e projetos criativos.
- [ ] **Validação:** A percepção do app mudou de "canivete suíço" para "estúdio premium"?

---

## 💰 POC 2: Finance Standalone (Mini-App)
**Status:** ✅ Concluída (Mini-App Standalone)

### Visão
Extrair o módulo financeiro como uma aplicação web separada, focada em velocidade e automação (OCR de notas).

### Critérios de Sucesso
- [ ] Performance de carregamento < 1.5s.
- [ ] Fluxo de inserção de despesa mais rápido que o app do banco.
- [ ] **Validação:** Ele resolve um problema real de controle familiar que o Nubank/Mobills não resolvem?

---

## 🏠 POC 3: Family Collab Layer (Real-time)
**Status:** ⏳ Planejada

### Visão
Isolar a lista de compras e quadros compartilhados em uma interface ultra-simples com foco em sincronização instantânea.

### Critérios de Sucesso
- [ ] Sincronização Real-time via Supabase (sem refresh).
- [ ] UI amigável para usuários não-técnicos (ex: esposa).
- [ ] **Validação:** A ferramenta substitui o WhatsApp/Notion para a organização doméstica diária?

---

## 📝 Roadmap de Decisão
Após a conclusão das 3 POCs, cada módulo seguirá um destes caminhos:

1.  **Promover:** Tornar-se um app independente (ex: `finance.mediashelf.app`).
2.  **Reintegrar:** Voltar ao core como uma feature secundária/leve.
3.  **Descartar:** Remover do ecossistema por falta de diferencial competitivo.
