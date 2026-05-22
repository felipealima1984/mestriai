# Estuda.AI — Roadmap de Melhorias e Correções
**Levantamento realizado em:** 22/05/2026  
**Disponibilidade:** 15h/dia (tempo entre sessões)  
**Total estimado:** ~96h ≈ 6,5 dias de trabalho  
**Estratégia:** construir valor primeiro, monetizar por último.

> **Regra de trabalho:** cada item inicia em uma branch dedicada.
> Ao término: atualizar README.md → merge na main → push para o GitHub.

---

## FASE 1 — Fundação  *(bugs visíveis + qualidade de código)*
> Resolver o que quebra hoje e criar a base que sustenta tudo que vem depois.

| # | Atividade | Horas | Status | Notas |
|---|-----------|------:|--------|-------|
| 1 | ~~Fix bug `progId is not defined` ao duplicar aba de Matérias~~ | ~~1h~~ | **feito** | `sincronizarPaineisModo()` referenciava `progId` como variável livre — substituído por `programaAtivoId` |
| 2 | ~~Unificar os dois rows de botões de programa no painel Matérias~~ | ~~1h~~ | **feito** | `prog-toggle` da topbar ocultado no painel Matérias; `switchMatTab` sincroniza `programaAtivoId` via `setModo()` |
| 3 | ~~Testes automatizados básicos (`tests.js` no console)~~ | ~~8h~~ | **feito** | 80+ asserções em 19 seções; SM-2, gamificação, freemium, persistência, contexto IA, BUG FIXes 1+2; snapshot/restore de estado global |
| 4 | ~~Otimizar `max_tokens` por tipo de chamada à API~~ | ~~2h~~ | **feito** | `callClaude()` agora aceita `maxTokens` por feature |
| 5 | ~~Atualizar README.md~~ | ~~1h~~ | **feito** | README reflete v1.4: SM-2, gamificação, freemium, múltiplos programas |

**Subtotal Fase 1: 0h restantes — Fase 1 concluída ✓**

---

## FASE 2 — Features diferenciadoras  *(o que faz o produto valer a pena)*
> Aumentam engajamento e criam o valor percebido que justificará a cobrança futura.

| # | Atividade | Horas | Status | Notas |
|---|-----------|------:|--------|-------|
| 6 | ~~Diagnóstico de lacunas de conhecimento~~ | ~~8h~~ | **feito** | `verificarSimulado()` registra acertos/erros por matéria em `lacunas`; `renderDiagnostico()` exibe ranking com barra de erro e ações diretas (Historinha / Revisar SM-2) no Dashboard e em Progresso |
| 7 | ~~Compartilhamento de programas de estudo~~ | ~~6h~~ | **feito** | Export JSON (arquivo .json + código base64) e import (file picker ou código colado) com regeneração de IDs; modal integrado ao painel Programas |
| 8 | ~~Estimativa de prontidão para a prova~~ | ~~4h~~ | **feito** | Widget no Dashboard: cobertura atual (lacunas+histórico), ritmo semanal, projeção até `prog.dataProva`; campo de data na modal de programa; mensagem adaptativa |
| 9 | ~~Suporte a LaTeX/MathJax nas respostas~~ | ~~3h~~ | **feito** | MathJax 3 async; `$...$` inline e `$$...$$` bloco; MutationObserver nas result-boxes; override `verificarSimulado`; prompts instruem Claude a usar LaTeX |

**Subtotal Fase 2: 0h restantes — Fase 2 concluída ✓**

---

## FASE 3 — Retenção e produto completo  *(roadmap pendente)*
> Features que aumentam retorno diário e completam o que já foi prometido.

| # | Atividade | Horas | Status | Notas |
|---|-----------|------:|--------|-------|
| 10 | ~~PWA: `manifest.json` + Service Worker offline~~ | ~~6h~~ | **feito** | `manifest.json` + `sw.js` cache-first; ícones SVG 192/512 maskable; meta tags iOS; banner de nova versão |
| 11 | Push notifications para revisão SM-2 | 8h | pendente | Lembrete no dia correto; SM-2 perde metade do valor sem o alerta |
| 12 | Onboarding wizard para novos usuários | 6h | pendente | Wizard 3 passos: criar programa → matéria → primeira historinha |
| 13 | Histórico de notas das redações com gráfico | 4h | pendente | Chart.js já disponível; salvar nota por redação no Supabase |
| 14 | Exportação de historinhas e flashcards para PDF | 6h | pendente | `window.print()` + CSS de impressão ou jsPDF |
| 15 | Estatísticas por matéria e por período | 4h | pendente | Breakdown de acertos/erros por matéria no simulado |

**Subtotal Fase 3: 28h ≈ 1,9 dias**

---

## FASE 4 — Monetização  *(cobrar por um produto que já entrega valor)*
> Só faz sentido cobrar depois que o produto estiver sólido e com usuários engajados.

| # | Atividade | Horas | Status | Notas |
|---|-----------|------:|--------|-------|
| 16 | Integração Stripe real (substituir `ativarPremiumDemo()`) | 16h | pendente | Checkout session, webhook, atualização de plano no Supabase |
| 17 | Proxy API via Supabase Edge Function | 8h | pendente | Plataforma chama Anthropic com chave própria; controle por plano; fim da dependência da chave do usuário |
| 18 | Rate limiting real no backend (Supabase) | 4h | pendente | Contador de gerações via RLS/trigger — não só frontend; impede burla via console |

**Subtotal Fase 4: 28h ≈ 1,9 dias**

---

## Resumo geral

| Fase | Horas restantes | Dias (15h/dia) |
|------|----------------:|---------------:|
| Fase 1 — Fundação | **0h** | **concluída ✓** |
| Fase 2 — Features diferenciadoras | **0h** | **concluída ✓** |
| Fase 3 — Retenção e produto completo | 28h | 1,9 dias |
| Fase 4 — Monetização | 28h | 1,9 dias |
| **TOTAL RESTANTE** | **56h** | **~3,7 dias** |

*(40h já entregues: token optimization + README + fix progId + unificação botões + testes + diagnóstico lacunas + compartilhamento de programas + prontidão para a prova + LaTeX/MathJax + PWA)*

---

## Regra de execução de cada item

```
1. git checkout -b <tipo>/<descricao-curta>
2. Implementar
3. Atualizar README.md com a melhoria/correção
4. git commit -m "tipo: descricao"
5. git checkout main && git merge <branch>
6. git push origin main
```

---

*Atualizado em 22/05/2026 — estratégia invertida: valor antes de monetização.*
