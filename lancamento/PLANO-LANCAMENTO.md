# Plano de Lançamento — Mestriai

**Escrito em:** 08/09/2026
**Ponto de partida:** app funcionalmente completo (Fases 1–3 do `ROADMAP.md` = 100% feitas), parado desde 24/05/2026 — **3,5 meses sem commit**.
**O que falta não é produto, é cobrança.** Fase 4 do próprio roadmap (Stripe + proxy + rate limit) nunca começou.

---

## Estimativa de prazo

| Marco | Data alvo | Semanas a partir de hoje |
|---|---|---|
| Volta a mexer no código, ambiente confirmado | 08–14/set | semana 0 |
| Fim do BYOK + proxy funcionando | ~28/set | semana 3 |
| Stripe funcionando ponta a ponta | ~05/out | semana 4 |
| **Primeiro pagante real** | **~13–20/out** | **semana 5–6** |
| Lançamento aberto a comunidades de concurso | ~09–16/nov | semana 9–10 |

**Resumo: dá pra ter o primeiro real de receita em ~5–6 semanas, e um lançamento público de verdade em ~9–10 semanas — outubro e novembro, com folga confortável antes de janeiro/2027.**

Essa conta assume ritmo realista de projeto paralelo (algumas horas por dia, não as "15h/dia" otimistas do `ROADMAP.md` de maio) e ~40h de trabalho técnico ao todo. Se você conseguir dedicar mais horas por semana, os marcos acima puxam pra trás — mas não force: o gargalo real é validar com gente de verdade, não escrever código mais rápido.

---

## Por que essa ordem (e não outra)

O pré-mortem que fizemos identificou dois problemas, não um:

1. **Fricção de ativação** — hoje, pra gerar um único flashcard, o usuário precisa criar conta na Anthropic, cadastrar cartão e colar uma API key (`callClaude()`, `index.html:2535` — chama `api.anthropic.com` direto do navegador com `apiKey` do usuário). Ninguém do público-alvo (concurseiro, não-dev) passa por isso.
2. **Sem cobrança nenhuma** — `isPremium()`, `contarGeracao()`, `ativarPremiumDemo()` (`index.html:4147–4193`) vivem só no `localStorage` do navegador. Qualquer pessoa abre o DevTools, digita `plano.tipo = 'premium'` e tem tudo liberado de graça, pra sempre.

**Os dois se resolvem com a mesma peça de infraestrutura**: uma Supabase Edge Function que guarda a sua chave Anthropic no servidor (nunca no navegador — é exatamente o erro que matou o Flashly) e decide, a cada chamada, se aquele usuário ainda tem geração disponível. Por isso ela vem antes do Stripe: sem isso, integrar pagamento seria cobrar por um controle de acesso que não existe de verdade.

---

## Semana 0 (08–14/set) — Retomada

Antes de escrever qualquer código novo, confirme que nada apodreceu em 3,5 meses parado:

- [ ] Rodar `tests.js` no console do app publicado (GitHub Pages) — as 340+ asserções ainda devem passar
- [ ] Conferir se o projeto Supabase ainda está ativo (projetos free ficam inativos após 1 semana sem uso — pode precisar "acordar" no painel)
- [ ] Conferir se a chave Anthropic pessoal usada em testes ainda é válida e tem crédito
- [ ] Reler `CLAUDE.md`, `ROADMAP.md` e os 4 skills em `.claude/skills/` (estudaai-domain, stripe-monetization, supabase-patterns, vanilla-js-patterns) — é a memória do projeto, mais barato reler do que redescobrir
- [ ] Decidir se o preço continua R$29,90/mês (valor já documentado no guia de deploy) ou se muda antes do primeiro teste real
- [ ] Criar branch `feature/monetizacao` a partir de `main` — regra de execução do próprio `ROADMAP.md`

---

## Fase A — Fim do BYOK + proxy (semanas 1–3, até ~28/set)

Substitui o item 17 do `ROADMAP.md` ("Proxy API via Supabase Edge Function").

- [ ] Criar Edge Function no Supabase (Deno) que recebe `{ prompt, maxTokens, feature }` autenticado pelo JWT do Supabase Auth
- [ ] A função guarda `ANTHROPIC_API_KEY` como **secret do Supabase** (`supabase secrets set`) — nunca em código, nunca no `index.html`. Essa é a lição do Flashly: se a chave aparece em qualquer arquivo que vai para o GitHub Pages, ela vaza.
- [ ] Função consulta a tabela `stats`/`plano` do usuário autenticado, decrementa geração disponível, só então chama `api.anthropic.com` com a chave do servidor
- [ ] Trocar `callClaude()` (`index.html:2535`) para chamar essa Edge Function em vez de `api.anthropic.com` direto
- [ ] Manter o fluxo de "colar sua própria chave" (`⚙ Configurar API`) como opção **avançada/oculta**, não mais obrigatória no onboarding — usuário novo nunca deveria ver esse campo antes de usar o app
- [ ] Atualizar o wizard de onboarding (`initOnboarding`) pra não pedir chave Anthropic no primeiro contato

**Critério de pronto:** uma conta nova, sem colar nenhuma chave, consegue gerar uma historinha.

---

## Fase B — Cobrança de verdade não confia no navegador (dentro da Fase A)

Substitui o item 18 do `ROADMAP.md` ("Rate limiting real no backend").

- [ ] O contador de gerações do plano free passa a viver **na tabela do Supabase**, verificado dentro da própria Edge Function da Fase A — não em `contarGeracao()` do frontend
- [ ] `isPremium()` (`index.html:4147`) passa a ler o plano vindo do Supabase (`carregarPlanoDoSupabase()`, já previsto no skill `stripe-monetization`) em vez de só `plano.tipo` do `localStorage`
- [ ] `localStorage` continua existindo como **cache** de exibição (pra UI não piscar), nunca mais como fonte da verdade

**Critério de pronto:** abrir o DevTools e digitar `plano.tipo = 'premium'` não libera mais nada — a Edge Function recusa a chamada se o Supabase disser que o usuário é free e já bateu o limite.

---

## Fase C — Stripe (semana 4, até ~05/out)

Substitui o item 16 do `ROADMAP.md`.

- [ ] Criar produto + preço no Stripe (R$29,90/mês, conforme guia de deploy já escrito) — considerar adicionar o plano anual R$239 já mapeado no skill `stripe-monetization` como segunda opção, não bloqueante
- [ ] Checkout Session via outra Edge Function do Supabase (mesmo projeto da Fase A — não precisa de um segundo backend)
- [ ] Webhook do Stripe (`checkout.session.completed`, `customer.subscription.deleted`) → grava/atualiza a tabela `subscriptions` no Supabase
- [ ] `ativarPremiumDemo()` (`index.html:4186`) sai de cena — o botão de upgrade no paywall (`abrirPaywall()`, `index.html:4174`) passa a abrir o Checkout real do Stripe
- [ ] `isPremium()` passa a refletir `subscriptions` (fonte da verdade), como já estava documentado no skill

**Critério de pronto:** um pagamento de teste no Stripe (modo test) libera premium sem tocar em código; cancelar a assinatura derruba de volta pro free no próximo login.

---

## Fase D — QA + instrumentação mínima (semana 5, até ~12/out)

- [ ] Fluxo ponta a ponta: cadastro → 20 gerações grátis → paywall → checkout → premium liberado → cancelamento → volta a free
- [ ] Registrar 3 eventos simples (pode ser uma tabela nova `eventos` no Supabase): `cadastro`, `primeira_geracao`, `retorno_d7` — sem isso você lança às cegas, do jeito que os quatro projetos do pré-mortem lançaram
- [ ] Rodar `tests.js` de novo depois de todas as mudanças

---

## Fase E — Lançamento fechado (semana 6, ~13–20/out)

- [ ] Convidar 15–20 pessoas do seu círculo direto de estudos (CACD/concurso — você já estuda nesse universo, ver pastas `estudos_cacd` e `cronogramaEstudos` na workspace) — é o unfair advantage deste projeto: você é o usuário mais qualificado que ele podia ter
- [ ] Acompanhar os 3 eventos da Fase D diariamente nessa semana
- [ ] Meta realista: 1–3 pagantes reais saindo desse grupo fechado — é o primeiro sinal de que alguém paga pelo produto, não só usa de graça

---

## Fase F — Iteração (semanas 7–8, ~20/out–02/nov)

- [ ] Ajustar onboarding/preço com base no que travou no grupo fechado (não adivinhar — usar os eventos registrados)
- [ ] Corrigir qualquer atrito real relatado antes de abrir pra mais gente

---

## Fase G — Abertura pública (semanas 9–10, ~03–16/nov)

- [ ] Levar para comunidades de concurso além do seu círculo direto (grupos de WhatsApp/Telegram de CACD, fóruns, Instagram de aprovados)
- [ ] Manter o app restrito a esse nicho no lançamento — "qualquer concurso ou matéria" (como está no README hoje) é ambição pra depois de ter tração, não para o dia 1

---

## Checklist final antes de cobrar de estranhos

Não avance pra Fase G sem marcar os três:

- [ ] Nenhuma chave paga (Anthropic, Supabase service role) aparece em qualquer arquivo servido pelo GitHub Pages — confira com "Exibir código-fonte" no site publicado, não só no editor
- [ ] `isPremium()` foi testado tentando burlar pelo console do navegador e não libera nada
- [ ] Um cancelamento de assinatura no Stripe realmente derruba o acesso premium no app

---

## O que fica fora deste plano de propósito

- Suporte a "qualquer concurso" além de CACD/Direito — só depois de validar com o nicho inicial
- Plano anual, cupons, período de teste gratuito de X dias — variações de preço vêm depois do primeiro sinal real de conversão, não antes
- Qualquer feature nova de produto — Fases 1–3 já estão completas; a próxima linha de código que vale a pena é a que cobra, não a que soma mais uma funcionalidade

---

*Este arquivo acompanha o `ROADMAP.md` (que mapeia o "o quê") — aqui está o "quando" e o "em que ordem". Atualize os checkboxes conforme for avançando.*
