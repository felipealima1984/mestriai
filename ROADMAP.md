# Estuda.AI — Roadmap de Melhorias e Correções
**Levantamento realizado em:** 22/05/2026  
**Disponibilidade:** 15h/dia (tempo entre sessões)  
**Total estimado:** ~96h ≈ 6,5 dias de trabalho

---

## TIER 1 — Crítico (bugs + dívida de produto)
> Prioridade máxima. Bloqueiam monetização ou causam erros visíveis ao usuário.

| # | Atividade | Horas | Notas |
|---|-----------|------:|-------|
| 1 | Fix bug `progId is not defined` ao duplicar aba de Matérias | 1h | `switchMatTab()` referencia `progId` como variável livre em template string/onclick |
| 2 | Unificar os dois rows de botões de programa no painel Matérias | 1h | Remover duplicidade de renderização |
| 3 | Integração Stripe real (substituir `ativarPremiumDemo()`) | 16h | Checkout session, webhook, atualização de plano no Supabase |
| 4 | Proxy API via Supabase Edge Function | 8h | Plataforma chama Anthropic com chave própria; controle por plano; fim da dependência da chave do usuário |
| 5 | Rate limiting real no backend (Supabase) | 4h | Contador de gerações via RLS/trigger — não só frontend; impede burla via console |

**Subtotal Tier 1: 30h ≈ 2 dias**

---

## TIER 2 — Roadmap pendente (estava no README, ainda não feito)
> Features prometidas ou planejadas que aumentam retenção e percepção de valor.

| # | Atividade | Horas | Notas |
|---|-----------|------:|-------|
| 6 | PWA: `manifest.json` + Service Worker offline | 6h | Instalação na tela inicial do celular; funciona offline real |
| 7 | Push notifications para revisão SM-2 | 8h | Lembrete no dia correto de revisar; o SM-2 perde metade do valor sem o alerta |
| 8 | Onboarding wizard para novos usuários | 6h | Wizard 3 passos: criar programa → matéria → primeira historinha |
| 9 | Histórico de notas das redações com gráfico de evolução | 4h | Chart.js já disponível; salvar nota por redação no Supabase |
| 10 | Exportação de historinhas e flashcards para PDF | 6h | `window.print()` + CSS de impressão ou jsPDF |
| 11 | Estatísticas por matéria e por período | 4h | Breakdown de acertos/erros por matéria no simulado |

**Subtotal Tier 2: 34h ≈ 2,3 dias**

---

## TIER 3 — Novas features de valor
> Diferenciam o produto; aumentam engajamento e conversão para premium.

| # | Atividade | Horas | Notas |
|---|-----------|------:|-------|
| 12 | Diagnóstico de lacunas de conhecimento | 8h | Identifica tópicos com mais erros no simulado → sugere historinha ou revisão espaçada |
| 13 | Compartilhamento de programas de estudo | 6h | Export/import de programa com matérias e tópicos (JSON); dois candidatos ao CACD podem compartilhar estrutura |
| 14 | Estimativa de prontidão para a prova | 4h | "Com seu ritmo atual, você cobrirá X% do conteúdo até a data da prova" |
| 15 | Suporte a LaTeX/MathJax nas respostas | 3h | Essencial para Economia (fórmulas em texto puro degradam o conteúdo) |
| 16 | Testes automatizados básicos (assertions no console) | 8h | Arquivo `tests.js` separado com smoke tests para as funções críticas; 4313 linhas sem teste é risco alto |

**Subtotal Tier 3: 29h ≈ 2 dias**

---

## TECH DEBT — Documentação e qualidade
> Não bloqueiam produto mas afetam manutenção e onboarding de colaboradores.

| # | Atividade | Horas | Notas |
|---|-----------|------:|-------|
| 17 | Atualizar README.md (v1.4 + freemium + múltiplos programas) | 1h | README ainda descreve v1.1/v1.2; roadmap lista SM-2 como pendente mas já foi feito |
| 18 | Otimização de tokens por tipo de chamada (`maxTokens` por feature) | 2h | `callClaude()` usa max_tokens fixo de 1200; plano de estudos precisa de 3000; historinha precisa de 800 |

**Subtotal Tech Debt: 3h**

---

## Resumo geral

| Tier | Horas | Dias (15h/dia) |
|------|------:|---------------:|
| Tier 1 — Crítico | 30h | 2,0 dias |
| Tier 2 — Roadmap pendente | 34h | 2,3 dias |
| Tier 3 — Novas features | 29h | 1,9 dias |
| Tech Debt | 3h | 0,2 dias |
| **TOTAL** | **96h** | **~6,5 dias** |

---

## Ordem recomendada de execução

```
Semana 1 (Dias 1-2):  Items 1, 2, 17, 18 → bugs + dívida técnica
                       Items 3, 4, 5      → monetização real
Semana 2 (Dias 3-4):  Items 6, 7, 8      → retenção mobile + onboarding
                       Items 9, 10, 11    → roadmap pendente
Semana 3 (Dias 5-7):  Items 12, 13, 14   → features diferenciadores
                       Items 15, 16       → qualidade e suporte
```

---

*Gerado automaticamente pela análise do projeto em 22/05/2026.*
