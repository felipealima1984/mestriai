# Mestriai — Plataforma de Estudos com IA

## Sobre o projeto
Plataforma web de estudos com IA para qualquer tipo de concurso/materia.
Originalmente focada em CACD + Direito, expandindo para qualquer tipo de estudo.
Modelo de monetizacao: freemium + premium via Stripe.

## Stack real (confirmado em 22/05/2026)
- HTML + Vanilla JS + CSS — tudo em um unico index.html (4313 linhas)
- Claude Haiku 4.5 via Anthropic API (chave do usuario ou da plataforma)
- Supabase (PostgreSQL) — auth + banco + RLS + sync
- localStorage como fallback offline
- Chart.js para graficos
- GitHub Pages para hospedagem

## Estrutura do index.html
O projeto inteiro esta em um unico arquivo. A organizacao interna e por secoes:
- Linhas 1-1493: HTML + CSS (layout, sidebar, panels, modais)
- Linhas 1494+: JavaScript (todas as funcoes)

## Banco de dados Supabase — tabelas
- materias: materias de estudo por usuario e programa
- historinhas: textos narrativos gerados pela IA
- materiais_salvos: flashcards, questoes e historinhas persistidas
- stats: contadores globais por usuario
- historico: log de atividades
- preferencias: tema, api_key cifrada

## Funcionalidades existentes
- Auth completo (Supabase Auth — email/senha)
- Sync bidirecional Supabase ↔ localStorage
- Multiplos programas de estudo (CACD, Direito, qualquer concurso)
- Materias com topicos N1/N2/N3
- Geracao via Claude: historinhas, simulados, flashcards, redacoes, planos de estudo
- Upload e processamento de PDF
- Revisao espacada com algoritmo SM2
- Gamificacao: XP, niveis, streaks, baralhos
- Dashboard com graficos (Chart.js)
- Freemium com paywall (limite de geracoes/mes)
- Temas: dark, gray, light

## Monetizacao — estado atual
- isPremium() — verifica plano do usuario
- abrirPaywall() — exibe modal de upgrade
- ativarPremiumDemo() — ativa premium para teste (SEM STRIPE REAL)
- contarGeracao() — controla limite de geracoes do plano free
- FALTA: integracao Stripe real para cobranca

## Bugs conhecidos (maio 2026)
1. ReferenceError: progId is not defined — ocorre ao duplicar abas na tela Materias
   Causa: switchMatTab() referencia progId como variavel livre em template string ou onclick
2. Dois rows de botoes de programa no painel Materias precisam unificar em um

## Variaveis globais importantes
- programas[] — lista de programas de estudo
- materias[] — lista de materias
- periodos[] — periodos de estudo
- plano{} — plano do usuario (tipo: 'free'|'premium', geracoes usadas)
- progAtivo — ID do programa ativo

## Limites do plano free (atual)
- 10 geracoes de conteudo por mes
- 1 programa de estudos
- Sem plano de estudos gerado por IA

## Regras obrigatorias
- NUNCA quebrar o sync Supabase — toda mudanca de dados passa por salvar*() + syncToSupabase()
- NUNCA hardcodar chave Anthropic — vem de preferencias.anthropic_key ou variavel de ambiente
- NUNCA remover o fallback localStorage — usuarios offline dependem dele
- Ao corrigir bugs, testar em abas duplicadas antes de commitar
- Commits semanticos: feat:, fix:, refactor:, docs:
