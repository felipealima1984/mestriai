---
name: stripe-monetization
description: Ativar quando trabalhar com Stripe, planos de assinatura, paywall, controle de limite de geracoes, isPremium(), contarGeracao(), ou qualquer logica de monetizacao no Estuda.AI.
---

# Monetizacao Stripe — Estuda.AI

## Estado atual (maio 2026)
- isPremium(): verifica localStorage — SEM verificacao no servidor
- ativarPremiumDemo(): ativa premium sem cobranca real
- contarGeracao(): limita a 10/mes no free
- FALTA: Stripe real + verificacao server-side do plano

## Planos definidos

| Plano | Preco | Limite geracoes | Programas |
|---|---|---|---|
| Free | Gratis | 20/mes | 1 |
| Premium Mensal | R$29,90/mes | Ilimitado | Ilimitado |
| Premium Anual | R$239/ano | Ilimitado | Ilimitado |

## Fonte da verdade do plano
Apos integracao Stripe:
1. Supabase tabela `subscriptions` e a fonte da verdade
2. localStorage e apenas cache local
3. isPremium() deve verificar Supabase, nao so localStorage
4. Verificar plano apos cada login via carregarPlanoDoSupabase()

## Funcoes que exigem isPremium() === true
- gerarPlanoPremium()
- Geracoes alem de 10/mes em qualquer funcao de geracao
- Criacao de segundo programa de estudos
- Exportacao de materiais

## Paywall — quando abrir
- contarGeracao() retorna false (limite atingido)
- usuario tenta criar segundo programa
- usuario tenta gerar plano de estudos

## Paywall — como abrir
```javascript
abrirPaywall('limite');     // atingiu limite de geracoes
abrirPaywall('programas'); // tentou criar segundo programa
abrirPaywall('plano');     // tentou gerar plano premium
```
