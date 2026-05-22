# Estuda.AI

Plataforma web de estudos com IA para qualquer concurso ou matéria — CACD, Direito, OAB, concursos públicos ou estudo livre. Single-file, sem build, sem dependências de npm.

Hospedada em **GitHub Pages** — sem backend próprio.

---

## Funcionalidades

### Múltiplos programas de estudo
Crie quantos programas quiser (CACD, Direito, qualquer concurso). Cada programa tem suas matérias, tópicos e configurações independentes. Um seletor rápido na sidebar alterna entre eles.

### Historinhas
Gera narrativas curtas para memorização. O modelo recebe a matéria, a unidade (N1/N2/N3) e os tópicos cadastrados como contexto, produzindo uma história com personagens que cristaliza os conceitos em bullet points no final.

### Simulados
Questões de múltipla escolha com gabarito comentado. Suporta três tipos de armadilha do CACD:

| Armadilha | Descrição |
|-----------|-----------|
| Cauda venenosa | Alternativa quase correta com detalhe errado no final |
| Absolutismo | Uso de "sempre", "nunca", "apenas", "exclusivamente" |
| Inversão causa-efeito | Distrator que inverte a relação causal correta |

### Redação CACD
Geração de tema dissertativo com instruções e critérios. Aceita a redação do usuário e devolve correção com notas em cinco critérios: argumentação, conhecimento de política internacional, estrutura dissertativa, coesão e perfil diplomático.

### Material de Estudo (PDF / Texto)
Upload de PDF ou texto colado manualmente. Gera à escolha:
- **Historinha** — resumo narrativo para memorização
- **Flashcards** — deck interativo, cada card abre e fecha com clique
- **Questões** — múltipla escolha com gabarito revelado

O conteúdo gerado pode ser salvo e consultado na aba "Materiais salvos".

### Revisão Espaçada (SM-2)
Deck de flashcards com algoritmo SM-2. Avalia dificuldade (fácil/médio/difícil) e agenda o próximo intervalo de revisão automaticamente.

### Gamificação
XP por atividade, níveis de progresso, streaks de dias consecutivos e baralhos desbloqueáveis. Painel de conquistas na sidebar.

### Plano de Estudos gerado por IA
Gera um cronograma semanal personalizado com base nas matérias cadastradas, data da prova e horas disponíveis por dia. Premium only.

### Matérias & Períodos (CRUD)
Gerenciamento completo de matérias com três unidades de avaliação:

| Unidade | Escopo na prova |
|---------|----------------|
| N1 | Conteúdo exclusivo da primeira avaliação |
| N2 | Conteúdo próprio + pode revisar N1 |
| N3 | Conteúdo novo + pode cobrar tudo do semestre |

Para programas de graduação: períodos (1º ao 10º) com filtro automático de matérias. Um período marcado como ativo filtra o conteúdo em Historinhas, Simulados e Material de Estudo.

### Freemium
- **Free:** 10 gerações/mês, 1 programa de estudos, sem plano gerado por IA
- **Premium:** gerações ilimitadas, múltiplos programas, plano de estudos por IA

### Autenticação e Sincronização (Supabase)
Login com email e senha. Todos os dados sincronizam em tempo real com o banco PostgreSQL do Supabase.

Estratégia offline/online:
- **Online + autenticado** → lê do Supabase ao abrir, grava a cada ação
- **Offline** → opera via localStorage sem interrupção
- **Reconexão** → sincroniza automaticamente
- **Sem login** → modo offline completo via localStorage

### Temas de interface
Três temas com preferência salva entre sessões:
- **Escuro** — padrão, fundo quase preto
- **Cinza** — bege-acinzentado, contraste reduzido para leitura longa
- **Claro** — off-white com texto escuro

### Progresso e Dashboard
Contador de historinhas, questões respondidas, taxa de acerto e redações. Histórico das últimas 30 atividades. Gráficos de evolução via Chart.js.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML + Vanilla JS + CSS (sem framework) |
| IA | Claude Haiku 4.5 via Anthropic API |
| Banco de dados | Supabase (PostgreSQL) + localStorage como fallback |
| Auth | Supabase Auth (email/senha) |
| Hospedagem | GitHub Pages |
| Dependências externas | Supabase JS SDK v2 · Chart.js · Google Fonts |

Arquivo principal: `index.html` (~4300 linhas) — sem `package.json`, sem build, sem servidor próprio.

---

## Estrutura do repositório

```
estuda-ai/
├── index.html                        # App completo (single-file)
├── README.md                         # Este arquivo
├── ROADMAP.md                        # Lista priorizada de melhorias com estimativas de horas
├── ROADMAP.docx                      # Versão impressa do roadmap
├── supabase-schema.sql               # Schema inicial do banco
├── supabase-migration-periodos.sql   # Migration: tabela periodos + periodo_id
└── SUPABASE-SETUP.md                 # Guia passo a passo de configuração
```

---

## Configuração do Supabase

### 1. Criar projeto
Acesse [supabase.com](https://supabase.com) → New project → região São Paulo.

### 2. Executar o schema
No SQL Editor, execute em ordem:
1. `supabase-schema.sql` — cria todas as tabelas com RLS
2. `supabase-migration-periodos.sql` — adiciona períodos e vínculo com matérias

### 3. Obter credenciais
Project Settings → API:
- **Project URL** → `https://xxxxxxxxxxx.supabase.co`
- **Anon public key** → `eyJ...`

### 4. Configurar no app
⚙ Configurar API → preencher Supabase URL, Anon Key e chave Anthropic.

O guia completo está em `SUPABASE-SETUP.md`.

---

## Configuração da API Anthropic

1. Acesse [console.anthropic.com](https://console.anthropic.com) → API Keys → criar nova chave
2. No app: ⚙ Configurar API → campo "Chave Anthropic" → salvar

**Modelo:** `claude-haiku-4-5-20251001` — mais econômico da família Claude.  
**max_tokens por tipo:** historinha 800 · simulado 1500 · tema redação 400 · correção redação 1000 · flashcards 1000 · plano de estudos 3000.

---

## Publicação no GitHub Pages

```bash
git add .
git commit -m "feat: descrição"
git push origin main
# Repositório → Settings → Pages → Branch: main → Save
```

URL pública: `https://felipealima1984.github.io/estuda-ai`

Lembre de adicionar essa URL em **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

## Banco de dados — tabelas

| Tabela | Conteúdo |
|--------|----------|
| `materias` | Matérias por usuário e programa com tópicos N1/N2/N3 e vínculo de período |
| `periodos` | Períodos de graduação (1º ao 10º) com flag de ativo |
| `historinhas` | Historinhas salvas manualmente |
| `materiais_salvos` | Conteúdo gerado de PDF/texto (historinha, flashcards, questões) |
| `stats` | Contadores de uso por usuário |
| `historico` | Últimas 30 atividades por usuário |
| `preferencias` | Tema visual, chave Anthropic e período ativo |

Todas as tabelas têm **Row Level Security** ativo — cada usuário acessa apenas seus próprios dados.

---

## localStorage (modo offline / fallback)

| Chave | Conteúdo |
|-------|----------|
| `estuda_api_key` | Chave Anthropic |
| `estuda_materias` | Matérias e tópicos |
| `estuda_periodos` | Períodos cadastrados |
| `estuda_periodo_ativo` | ID do período ativo |
| `estuda_stats` | Contadores |
| `estuda_historico` | Histórico de atividades |
| `estuda_historinhas` | Até 50 historinhas salvas |
| `estuda_materiais_salvos` | Materiais gerados de PDF/texto |
| `estuda_theme` | Tema visual |
| `sb_url` / `sb_key` | Credenciais Supabase |

Para limpar tudo localmente: `localStorage.clear()` no console do navegador.

---

## Histórico de versões

### v1.4 — Programas dinâmicos, SM-2, gamificação e freemium
- Múltiplos programas de estudo (CACD, Direito, qualquer concurso)
- Revisão espaçada com algoritmo SM-2
- Gamificação: XP, níveis, streaks, baralhos
- Quiz interativo por matéria
- Dashboard com gráficos de progresso (Chart.js)
- Modelo freemium: plano free (10 gerações/mês, 1 programa) e premium
- Plano de estudos gerado por IA (premium)

### v1.3 — Períodos de graduação
- CRUD de períodos (1º ao 10º) vinculados às matérias de Direito
- Seletor rápido de período ativo na sidebar
- Filtro automático de matérias por período em Historinhas, Simulados e Material de Estudo
- Migration SQL `supabase-migration-periodos.sql`
- Sync de períodos e `periodo_id` nas matérias com o Supabase

### v1.2 — Supabase Auth + Sync
- Login com email e senha via Supabase Auth
- Sincronização em tempo real de matérias, stats, histórico, historinhas, materiais e preferências
- Estratégia offline/online com localStorage como fallback
- Badge de status de sincronização na topbar
- Schema SQL completo com RLS por usuário

### v1.1 — Material de Estudo + Períodos base
- Upload de PDF (extração de texto) e entrada de texto manual
- Geração de historinha, flashcards e questões a partir do material
- Materiais salvos com visualização e exclusão
- CRUD de matérias com períodos N1/N2/N3 por matéria
- Seleção de período filtrando conteúdo gerado pela IA

### v1.0 — Versão inicial
- Historinhas por matéria e unidade (CACD e Direito)
- Simulados com armadilhas CACD
- Redação dissertativa com correção
- CRUD de matérias com tópicos por N1/N2/N3
- Três temas de interface (escuro, cinza, claro)
- Persistência via localStorage

---

## Roadmap

Ver [ROADMAP.md](ROADMAP.md) para a lista completa com estimativas de horas.

**Próximos passos prioritários:**
- [ ] Integração Stripe real (substituir `ativarPremiumDemo()`)
- [ ] Proxy API via Supabase Edge Function (chave da plataforma, não do usuário)
- [ ] PWA + Service Worker (instalação no celular, offline real)
- [ ] Push notifications para revisão SM-2
- [ ] Onboarding wizard para novos usuários
- [ ] Exportação de historinhas e flashcards para PDF
- [ ] Histórico de notas das redações com gráfico de evolução
- [ ] Diagnóstico de lacunas de conhecimento (tópicos com mais erros)

---

## Licença

Projeto pessoal. Sem licença open source definida.
