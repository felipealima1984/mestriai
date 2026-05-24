# Estuda.AI — Guia de Deploy em Produção

**Última atualização:** 24/05/2026  
**Público-alvo:** Felipe Lima (owner do projeto)

---

## Arquitetura em produção

O Estuda.AI é uma SPA single-file (index.html). O frontend **não precisa de servidor pago** — fica no GitHub Pages gratuitamente. Todo o lado servidor é coberto pelo Supabase via Edge Functions.

```
[Usuário]
    ↓ HTTPS
[GitHub Pages]  ←  frontend estático (GRÁTIS, sem necessidade de VPS)
    ↓ fetch
[Supabase]  ←  auth + banco PostgreSQL + Edge Functions (o "servidor" real)
    ├── auth            → login e sessão dos usuários
    ├── banco           → materias, stats, historico, preferencias
    ├── Edge Function: stripe-webhook   → processa eventos de pagamento
    └── Edge Function: anthropic-proxy → chama a Claude API com chave da plataforma
         ↓
    [Stripe]     ← cobra assinantes, repassa para sua conta bancária
    [Anthropic]  ← Claude Haiku gera o conteúdo
```

---

## O que contratar — apenas 4 serviços

### 1. Supabase Pro — $25/mês (~R$125)

É o único "servidor" real que você paga. O plano Pro libera as Edge Functions sem restrições de produção, garante backups diários e suporte.

| Plano | Custo/mês | Para quando usar |
|-------|----------:|-----------------|
| Free | $0 | Desenvolvimento e testes |
| **Pro** | **$25 (~R$125)** | **Produção — contratar ao lançar** |
| Team | $599 | Equipe grande, SLA garantido |

**Onde contratar:** supabase.com → seu projeto → Settings → Billing → Upgrade to Pro

---

### 2. Stripe — gratuito (cobra por transação)

Sem mensalidade. Você paga somente quando recebe.

| Modalidade | Taxa | Você recebe (R$29,90) |
|------------|------|-----------------------:|
| Cartão de crédito | 3,49% + R$0,39 | **~R$28,47** |
| PIX | 1% (mín. R$0,50) | **~R$29,40** |
| Boleto | 1,5% + R$1,50 | ~R$27,95 |

**Recomendação:** aceitar cartão e PIX. Boleto tem inadimplência alta — não compensa.

**Requisitos para ativar no Brasil:**
- CPF ou CNPJ
- Conta bancária brasileira (para receber repasses)
- Documento de identidade (verificação KYC)

**Onde contratar:** stripe.com

---

### 3. Anthropic API — pago por uso (~R$0,50/usuário premium/mês)

Custo do modelo `claude-haiku-4-5-20251001` (preços em 05/2026):

| Direção | Preço por 1M tokens |
|---------|--------------------:|
| Input (prompt) | $0,80 |
| Output (resposta) | $4,00 |

**Custo estimado por tipo de geração:**

| Geração | Input + Output | Custo |
|---------|---------------|------:|
| Historinha | ~800 + 800 tokens | ~R$0,02 |
| Simulado | ~600 + 1500 tokens | ~R$0,03 |
| Correção redação | ~1200 + 1000 tokens | ~R$0,03 |

**Projeção mensal por usuário premium (20 gerações/mês):**
- Média R$0,025 × 20 = **~R$0,50/usuário/mês**

Sem mensalidade — cobra só o que consumir.

**Onde contratar:** console.anthropic.com → API Keys → adicionar cartão de crédito

---

### 4. Domínio personalizado — ~R$40/ano (~R$3,50/mês)

| Opção | Registrador | Custo/ano |
|-------|------------|----------:|
| **estudaai.com.br** | Registro.br | **R$40** |
| estudaai.com | Cloudflare Registrar | ~R$50 |
| estuda.ai | Namecheap / GoDaddy | ~R$400–600 |

**Recomendação:** `estudaai.com.br` no Registro.br. Mais barato, .br passa mais confiança para o público brasileiro.

**Onde contratar:** registro.br (requer CPF)

---

## O que você NÃO precisa contratar

| O que parece necessário | Por que não precisa |
|-------------------------|---------------------|
| VPS (DigitalOcean, AWS EC2, Hetzner) | Supabase Edge Functions substitui |
| Hosting pago para o frontend | GitHub Pages é gratuito e suficiente para HTML estático |
| CDN pago | GitHub Pages já usa CDN global |
| Servidor de e-mail | Supabase Auth já envia confirmação de cadastro |
| Servidor Node.js/Python próprio | Toda lógica de servidor vai nas Edge Functions do Supabase |

---

## Planos do Estuda.AI

| Plano | Preço | Valor mensal efetivo |
|-------|-------|--------------------:|
| Free | Gratuito | — |
| **Premium Mensal** | **R$29,90/mês** | **R$29,90** |
| **Premium Anual** | **R$239/ano** | **~R$19,92** (33% de desconto) |

---

## Projeção financeira

### Fase 0 — Lançamento (até 50 usuários premium)

| Item | Custo/mês |
|------|----------:|
| GitHub Pages | R$0 |
| Supabase Pro | R$125 |
| Anthropic (50 × R$0,50) | ~R$25 |
| Stripe fees (50 × R$1,43) | ~R$72 |
| Domínio (amortizado) | ~R$3,50 |
| **Custo total** | **~R$225,50** |
| **Receita bruta (50 × R$29,90)** | **R$1.495** |
| **Margem líquida** | **~R$1.269 (~85%)** |
| **Break-even** | **8 assinantes** |

### Fase 1 — Crescimento (50–500 usuários premium)

| Item | Custo/mês |
|------|----------:|
| Supabase Pro | R$125 |
| Anthropic (500 × R$0,50) | ~R$250 |
| Stripe fees (500 × R$1,43) | ~R$715 |
| Domínio | ~R$3,50 |
| **Custo total** | **~R$1.093,50** |
| **Receita bruta (500 × R$29,90)** | **R$14.950** |
| **Margem líquida** | **~R$13.856 (~93%)** |

### Fase 2 — Escala (500–2000 usuários premium)

| Item | Custo/mês |
|------|----------:|
| Vercel Pro (analytics + CDN melhorado) | ~R$100 |
| Supabase Pro | R$125 |
| Anthropic (2000 × R$0,50) | ~R$1.000 |
| Stripe fees (2000 × R$1,43) | ~R$2.860 |
| **Custo total** | **~R$4.085** |
| **Receita bruta (2000 × R$29,90)** | **R$59.800** |
| **Margem líquida** | **~R$55.715 (~93%)** |

---

## Checklist de produção

### Antes de aceitar pagamentos reais

- [ ] Stripe: criar conta em stripe.com, verificar identidade (CPF/CNPJ)
- [ ] Stripe: criar Product + Price (assinatura mensal R$29,90 e anual R$239)
- [ ] Supabase: upgrade para plano Pro
- [ ] Supabase: criar Edge Function `stripe-webhook` (processa eventos de pagamento)
- [ ] Supabase: criar Edge Function `anthropic-proxy` (proxy da API Claude)
- [ ] Supabase: adicionar colunas `plano_tipo` e `stripe_customer_id` na tabela `preferencias`
- [ ] index.html: substituir `ativarPremiumDemo()` por redirect para Stripe Checkout
- [ ] index.html: substituir chamada direta à Anthropic pelo proxy Supabase
- [ ] Supabase: adicionar trigger para rate limiting de gerações no backend
- [ ] Supabase: configurar secrets (STRIPE_SECRET, ANTHROPIC_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Domínio: registrar `estudaai.com.br` e apontar CNAME para `felipealima1984.github.io`
- [ ] Supabase Auth: adicionar domínio personalizado em Redirect URLs
- [ ] Stripe: configurar webhook URL para `https://[projeto].supabase.co/functions/v1/stripe-webhook`
- [ ] Testar fluxo completo: cadastro → paywall → checkout Stripe → webhook → premium ativo → geração via proxy

### Boas práticas de segurança

- [ ] Nunca expor `STRIPE_SECRET_KEY` no frontend (só `STRIPE_PUBLISHABLE_KEY`)
- [ ] Nunca expor `ANTHROPIC_KEY` no frontend (usar proxy)
- [ ] Verificar `stripe-signature` em todo webhook recebido
- [ ] RLS ativo em todas as tabelas do Supabase (já configurado)
- [ ] HTTPS obrigatório (GitHub Pages já força)
- [ ] Validar plano premium no backend antes de processar geração

---

## Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Checkout](https://stripe.com/docs/checkout/quickstart)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Anthropic API — preços](https://www.anthropic.com/pricing)
- [Supabase — preços](https://supabase.com/pricing)
- [Registro.br](https://registro.br)
