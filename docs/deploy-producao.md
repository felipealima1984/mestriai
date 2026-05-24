# Estuda.AI — Guia de Deploy em Produção

**Última atualização:** 24/05/2026  
**Público-alvo:** Felipe Lima (owner do projeto)

---

## Arquitetura recomendada

O Estuda.AI é uma SPA single-file (index.html). A arquitetura ideal para produção com custo mínimo é:

```
[Usuário]
    ↓ HTTPS
[GitHub Pages / Vercel / Cloudflare Pages]  ← frontend estático (GRÁTIS)
    ↓ fetch
[Supabase]  ← auth + banco PostgreSQL + Edge Functions
    ├── auth.supabase.co         → login/sessão
    ├── db.supabase.co           → materias, stats, historico, preferencias
    ├── Edge Function: stripe-webhook  → recebe eventos do Stripe
    └── Edge Function: anthropic-proxy → proxeia chamadas à Claude API
    ↓
[Stripe]    ← pagamentos
[Anthropic] ← Claude Haiku (via proxy)
```

---

## Serviços necessários e custos

### 1. Hospedagem do frontend

| Opção | Custo | Notas |
|-------|-------|-------|
| **GitHub Pages** (atual) | **Grátis** | Ideal para começar; domínio personalizado grátis com CNAME |
| Vercel Hobby | **Grátis** | Melhor CDN, analytics básico, domínio personalizado grátis |
| Cloudflare Pages | **Grátis** | CDN global, build automático, domínio personalizado grátis |
| Netlify Starter | **Grátis** | Similar ao Vercel |

**Recomendação:** manter GitHub Pages por enquanto. Se precisar de analytics ou SSR no futuro, migrar para Vercel.

---

### 2. Banco de dados + Auth + Edge Functions — Supabase

| Plano | Custo/mês | Limites relevantes |
|-------|----------:|--------------------|
| **Free** | **$0** | 500MB DB · 50MB armazenamento · 500K invocações Edge Function/mês · 2GB bandwidth |
| **Pro** | **$25** | 8GB DB · 100GB armazenamento · 2M invocações Edge Function/mês · 250GB bandwidth · backups diários |
| **Team** | $599 | Múltiplos membros, SLA, suporte prioritário |

**Recomendação inicial:** começar no **Free**. O plano free suporta bem até ~500 usuários ativos.  
**Quando subir para Pro:** quando ultrapassar 400 usuários cadastrados ou 400K Edge Function invocações/mês.

**Estimativa de invocações/mês (plano Free — 500K limite):**
- 500 usuários × 20 gerações/mês × 1 chamada proxy = 10.000 invocações
- Stripe webhook: ~5 eventos/assinatura × 100 assinaturas = 500 invocações
- Total estimado com 500 usuários ativos: **~11.000/mês** (bem dentro do free tier)

---

### 3. Pagamentos — Stripe

| Modalidade | Taxa | Observações |
|------------|------|-------------|
| Cartão de crédito (Brasil) | 3,49% + R$0,39 por transação | Para assinaturas recorrentes em BRL |
| PIX (via Stripe) | 1% (mín. R$0,50, máx. R$5,00) | Disponível no Stripe Brasil desde 2023 |
| Boleto bancário | 1,5% + R$1,50 | Disponível, mas taxa de inadimplência alta |

**Conta Stripe:** gratuita. Só paga quando há transações.

**Para o plano R$19,90/mês no cartão:**
- Taxa Stripe: R$0,69 + R$0,39 = R$1,08 por cobrança
- Você recebe: **R$18,82 por assinatura/mês**

**Para o plano R$19,90/mês via PIX:**
- Taxa Stripe: R$0,20 (1% de R$19,90, acima do mínimo de R$0,50 → R$0,50)
- Você recebe: **R$19,40 por assinatura/mês**

**Requisitos para ativar Stripe no Brasil:**
- CPF ou CNPJ
- Conta bancária brasileira (para receber repasses)
- Documento de identidade para verificação KYC

---

### 4. IA — Anthropic (Claude Haiku 4.5)

> Custo do modelo `claude-haiku-4-5-20251001` (preços em 05/2026):

| Direção | Preço por 1M tokens |
|---------|--------------------:|
| Input (contexto + prompt) | **$0,80** |
| Output (resposta gerada) | **$4,00** |

**Estimativa de custo por geração:**
- Historinha: ~800 input + 800 output → $0,00064 + $0,0032 = **$0,0038 (~R$0,02)**
- Simulado: ~600 input + 1500 output → $0,00048 + $0,006 = **$0,0065 (~R$0,03)**
- Correção redação: ~1200 input + 1000 output → $0,00096 + $0,004 = **$0,005 (~R$0,03)**

**Projeção de custo Anthropic por usuário premium (20 gerações/mês):**
- Média de $0,005 por geração × 20 = **$0,10/usuário/mês (~R$0,50)**
- Com 100 usuários premium: **~$10/mês (~R$50)** em API Anthropic

**Margem por usuário premium (R$19,90/mês cartão):**
- Stripe fee: -R$1,08
- Anthropic: -R$0,50
- **Margem líquida: ~R$18,32/usuário/mês**

---

### 5. Domínio personalizado

| Domínio | Registrador | Custo/ano |
|---------|------------|----------:|
| estudaai.com.br | Registro.br | R$40,00 |
| estudaai.com | Cloudflare Registrar | ~$10,00 (~R$50) |
| estuda.ai | Namecheap / GoDaddy | ~$80-120/ano |

**Recomendação:** `estudaai.com.br` no Registro.br — mais barato, .br passa mais confiança para o público brasileiro.

---

## Resumo de custos mensais

### Fase 0 — Lançamento (0–50 usuários premium)

| Serviço | Custo/mês |
|---------|----------:|
| GitHub Pages | R$0 |
| Supabase Free | R$0 |
| Stripe (sem assinaturas ativas) | R$0 |
| Anthropic API (50 usuários × R$0,50) | ~R$25 |
| Domínio (amortizado/mês) | ~R$3,50 |
| **TOTAL** | **~R$28,50/mês** |
| **Receita (50 assinantes)** | **R$941/mês** |
| **Margem** | **~97%** |

### Fase 1 — Crescimento (50–500 usuários premium)

| Serviço | Custo/mês |
|---------|----------:|
| GitHub Pages ou Vercel | R$0 |
| Supabase Free (até ~400 usuários) | R$0 |
| Anthropic API (500 usuários × R$0,50) | ~R$250 |
| Stripe fees (500 × R$1,08) | ~R$540 |
| Domínio | ~R$3,50 |
| **TOTAL** | **~R$793/mês** |
| **Receita bruta (500 × R$19,90)** | **R$9.950/mês** |
| **Margem líquida** | **~R$9.157/mês (~92%)** |

### Fase 2 — Escala (500–2000 usuários premium)

| Serviço | Custo/mês |
|---------|----------:|
| Vercel Pro (analytics, maior CDN) | ~R$100 |
| **Supabase Pro** ($25) | ~R$125 |
| Anthropic API (2000 usuários × R$0,50) | ~R$1.000 |
| Stripe fees (2000 × R$1,08) | ~R$2.160 |
| **TOTAL** | **~R$3.385/mês** |
| **Receita bruta** | **R$39.800/mês** |
| **Margem líquida** | **~R$36.415/mês (~91%)** |

---

## Checklist de produção

### Obrigatório antes de abrir para usuários pagantes

- [ ] Stripe: criar conta em stripe.com, verificar identidade (CPF/CNPJ)
- [ ] Stripe: criar Product + Price (assinatura mensal R$19,90)
- [ ] Supabase: criar Edge Function `stripe-webhook` (recebe eventos de pagamento)
- [ ] Supabase: criar Edge Function `anthropic-proxy` (proxy da API Claude)
- [ ] Supabase: adicionar coluna `plano` e `stripe_customer_id` na tabela `preferencias`
- [ ] index.html: substituir `ativarPremiumDemo()` por redirect para Stripe Checkout
- [ ] index.html: substituir chamada direta à Anthropic pelo proxy Supabase
- [ ] Supabase: adicionar trigger/RLS para rate limiting de gerações no backend
- [ ] GitHub: adicionar variáveis de ambiente no repositório (STRIPE_SECRET_KEY, ANTHROPIC_KEY)
- [ ] Supabase: configurar secrets para Edge Functions (STRIPE_SECRET, ANTHROPIC_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Domínio: apontar CNAME para `felipealima1984.github.io`
- [ ] Supabase Auth: adicionar domínio personalizado em Redirect URLs
- [ ] Stripe: configurar webhook URL para `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
- [ ] Testar fluxo completo: cadastro → paywall → checkout → webhook → premium ativo → geração via proxy

### Boas práticas de segurança

- [ ] Nunca expor `STRIPE_SECRET_KEY` no frontend (apenas `STRIPE_PUBLISHABLE_KEY`)
- [ ] Nunca expor `ANTHROPIC_KEY` no frontend (usar proxy)
- [ ] Verificar `stripe-signature` em todo webhook recebido
- [ ] RLS ativo em todas as tabelas do Supabase (já configurado)
- [ ] HTTPS obrigatório (GitHub Pages já força)
- [ ] Validar plano premium no backend antes de processar geração (não só no frontend)

---

## Documentos de referência

- [Supabase Edge Functions Quickstart](https://supabase.com/docs/guides/functions)
- [Stripe Checkout — documentação](https://stripe.com/docs/checkout/quickstart)
- [Stripe Webhooks — como configurar](https://stripe.com/docs/webhooks)
- [Anthropic API — preços](https://www.anthropic.com/pricing)
- [Supabase — preços](https://supabase.com/pricing)
- [Registro.br — domínios .br](https://registro.br)
