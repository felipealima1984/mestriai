# Estuda.AI

Plataforma web de estudos com IA para qualquer concurso ou matéria — CACD, Direito, OAB, concursos públicos ou estudo livre. Single-file, sem build, sem dependências de npm.

Hospedada em **GitHub Pages** — sem backend próprio.

---

## Funcionalidades

### Instalável como app (PWA)
O Estuda.AI é um Progressive Web App. No Chrome/Edge, clique em **"Instalar"** na barra de endereço para adicionar à tela inicial do celular ou ao desktop — abre sem barra de navegação, como um app nativo. No Safari (iOS), use **Compartilhar → Adicionar à Tela de Início**.

Funciona **offline**: o app shell (HTML/CSS/JS) é cacheado pelo Service Worker. Sem internet, você ainda pode navegar, revisar flashcards SM-2 e ler historinhas salvas. Geração de conteúdo e sync Supabase requerem rede.

### Múltiplos programas de estudo
Crie quantos programas quiser (CACD, Direito, qualquer concurso). Cada programa tem suas matérias, tópicos e configurações independentes. Um seletor rápido na sidebar alterna entre eles.

### Compartilhamento de programas
Exporte qualquer programa de estudos (incluindo todas as matérias e tópicos) como arquivo `.json` ou como código copiável. Importe programas recebidos de outros usuários com um clique — sem conflito de IDs, sem sobrescrever dados existentes. Botão **Exportar** em cada programa e **Importar** no cabeçalho da seção de Programas.

### Estimativa de prontidão para a prova
Widget no Dashboard que calcula e projeta a cobertura de conteúdo até a data do exame. Define a **data da prova** no modal de edição do programa. Exibe duas barras: cobertura atual (baseada em simulados e histórico de atividades) e estimativa na data da prova (projetada pelo ritmo semanal atual). A mensagem se adapta ao cenário: verde para cobertura alta, laranja para média, vermelho para baixa.

### Suporte a LaTeX/MathJax
Fórmulas matemáticas e econômicas renderizadas automaticamente em todo conteúdo gerado pela IA. Use `$...$` para notação inline (ex: `$E = mc^2$`, `$\frac{dQ}{dP}$`) e `$$...$$` para equações em bloco. Ativa automaticamente em historinhas, simulados, flashcards, correções de redação e material de PDF. Os prompts enviados ao Claude já incluem instrução para usar LaTeX quando o conteúdo tem fórmulas.

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

### Histórico de redações com gráfico
Todas as redações corrigidas são salvas automaticamente na aba **Histórico** do painel de redação. Um gráfico de linha (Chart.js) exibe a evolução das notas ao longo do tempo. A lista mostra nota, tema e data de cada redação — clique em qualquer entrada para rever o texto e a correção da IA. Cada item tem botão de exclusão individual. O histórico sincroniza com o Supabase quando o usuário está autenticado.

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
├── manifest.json                     # PWA manifest (nome, ícones, display, theme_color)
├── sw.js                             # Service Worker (cache-first, fallback offline)
├── icons/
│   ├── icon-192.svg                  # Ícone PWA 192×192 (any)
│   └── icon-512.svg                  # Ícone PWA 512×512 (any maskable)
├── img/
│   ├── logo_fundo_preto.png          # Logo para tema escuro (fundo dark)
│   └── logo_fundo_transparente.png   # Logo para temas claro/cinza (fundo transparente)
├── README.md                         # Este arquivo
├── ROADMAP.md                        # Lista priorizada de melhorias com estimativas de horas
├── ROADMAP.docx                      # Versão impressa do roadmap
├── tests.js                          # Smoke tests — cole no console do navegador para executar
├── supabase-schema.sql               # Schema inicial do banco
├── supabase-migration-periodos.sql   # Migration: tabela periodos + periodo_id
└── SUPABASE-SETUP.md                 # Guia passo a passo de configuração
```

---

## Testes automatizados

O arquivo `tests.js` contém smoke tests executáveis diretamente no console do navegador — sem build, sem Node, sem dependências.

**Como executar:**
1. Abra o app no navegador (GitHub Pages ou `file://`)
2. Abra o DevTools → Console (F12)
3. Cole o conteúdo de `tests.js` e pressione Enter

**Cobertura (250+ asserções, 27 seções):**

| Seção | O que testa |
|-------|-------------|
| uid() | Unicidade e formato |
| Helpers de programa | getPrograma, isConcurso, hasUnidades, getProgCor, getProgLabel |
| Helpers de matéria | getMaterias, getTodasMaterias, getMateria, estrutura de tópicos |
| Períodos | getPeriodo, salvarPeriodosLocal |
| Persistência localStorage | salvarProgramas, salvarMaterias, salvarStats, salvarGamification, salvarBaralhos, salvarPlanoLocal |
| SM-2 | Qualidades 0/1/2, transições de estado, caso "dominado", facilidade mínima |
| Níveis (getNivel) | 4 faixas: Bronze/Prata/Ouro/Diamante, fronteiras exatas |
| ganharXP | Incremento e persistência |
| Streak | Primeiro dia, continuidade, reset após 2 dias sem estudo |
| criarBaralho | Inicialização SM-2 dos cards, unicidade de ids |
| Freemium | getMesAtual, isPremium, verificarResetMensal, contarGeracao, ativarPremiumDemo |
| Histórico | adicionarHistorico, limite máximo de 30 entradas |
| Contexto IA | getContextoMateria (com/sem tópicos, unidades), getEscopoUnidade |
| Tema | setTheme (dark/gray/light) |
| BUG FIX 1 | sincronizarPaineisModo sem ReferenceError |
| BUG FIX 2 | prog-toggle oculto no painel Matérias |
| switchMatTab | Sincronização de programaAtivoId, painel de períodos |
| Renderizações | renderDashboard, renderCrudLista, renderMatTabs, renderBaralhos, renderXP, renderUsageBar |
| Diagnóstico de lacunas | salvarLacunas, renderDiagnostico, ordenação, rastreamento pós-simulado |
| Compartilhamento de programas | _montarExportPrograma (campos, isolamento de ids), round-trip export→import, validação de formato inválido |
| Estimativa de prontidão | calcularProntidao: totalMaterias, coberturaAtual, diasRestantes (futuro/passado/null), estimadoFinal, detecção de matérias com lacunas |
| LaTeX/MathJax | renderizarLatex (null-safe, sem MathJax), initLatexObserver, config inlineMath/displayMath, override verificarSimulado |
| PWA | link manifest, meta theme-color/apple/mobile, apple-touch-icon, banner de atualização, navigator.serviceWorker |
| Logo imagem | #logo-sidebar e #logo-auth (img tags), atualizarLogoTema, troca de src por tema (dark/gray/light) |
| Notificações SM-2 | contarCardsDue, atualizarBotaoNotif, ativar/desativar/toggle, verificarNotificacoes, #btn-notif |
| Onboarding wizard | initOnboarding, onbSelecionarTipo, onbRenderStep, onbNext/Back/Skip/Fechar, elementos DOM do wizard |
| Histórico de redações | extrairNotaRedacao (padrões), renderHistoricoRedacoes, renderGraficoRedacoes, switchRedTab, verRedacaoHistorico, excluirRedacaoHistorico, salvarRedacoesHist, syncRedacoesHistItem, elementos DOM |

O runner faz **snapshot/restore** do estado global: os testes não alteram dados reais do usuário.

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

### v1.12.0 — Onboarding wizard para novos usuários
- Wizard de 3 passos exibido automaticamente na primeira abertura (sem `estuda_programas` no localStorage)
- **Passo 1**: escolha do tipo de programa (Concurso / Graduação / Pós-graduação / Estudo livre) + nome + banca
- **Passo 2**: nome da matéria + tópicos principais (um por linha, vão para `topicos.n1`)
- **Passo 3**: confirmação do que foi criado + botão "Gerar primeira historinha" ou "Explorar sozinho"
- Botão "Pular" disponível em qualquer passo; `estuda_onboarding_done` impede re-exibição
- Programa criado é automaticamente definido como `programaAtivoId`; matéria vai direto para revisão
- CSS responsivo: overlay `z-index:600`, card até 460px, scroll interno em telas pequenas
- `tests.js` seção 26: 40 asserções cobrindo funções, DOM, seleção de tipo, render de steps e validação de campos

### v1.11.0 — Notificações locais para revisão SM-2
- Botão "🔔 Notificações" na sidebar ativa/desativa lembretes de revisão SM-2
- `Notification.requestPermission()` solicitado apenas no clique — sem popup automático
- `contarCardsDue()` percorre todos os baralhos e conta cards com `nextReview <= Date.now()`
- `verificarNotificacoes(forcar)` exibe notificação uma vez por dia quando há cards vencidos
- `mostrarNotificacaoRevisao(count)` envia mensagem ao Service Worker (`SHOW_NOTIFICATION`) para exibir a notificação nativa do sistema operacional
- SW: novo handler `notificationclick` foca janela aberta ou abre o app ao clicar na notificação
- SW: handler `SHOW_NOTIFICATION` chama `self.registration.showNotification()` com título, corpo, ícone e tag
- Verificação horária via `setInterval` para apps que ficam abertos em segundo plano
- Cache SW atualizado para `estudaai-v1.10.0`
- `tests.js` seção 25: 20 asserções cobrindo funções, #btn-notif, contagem de cards e estado do botão

### v1.10.0 — Logo com imagem (adaptação por tema)
- Textos "Estuda.AI" no cabeçalho da sidebar e na tela de login substituídos por `<img>` tags
- `img/logo_fundo_preto.png` usado no tema escuro; `img/logo_fundo_transparente.png` nos temas cinza e claro
- `atualizarLogoTema(t)` troca `src` dos elementos `#logo-sidebar` e `#logo-auth` ao mudar tema
- `setTheme()` chama `atualizarLogoTema()` automaticamente a cada troca de tema
- `tests.js` seção 24: 13 asserções — presença dos img tags, atributos alt, troca de src por tema

### v1.9.0 — PWA: instalação e modo offline
- `manifest.json` com nome, ícones, `display: standalone`, `theme_color: #c8a96e` e atalhos de teclado (Historinha e Simulado)
- Ícones SVG em `icons/icon-192.svg` (any) e `icons/icon-512.svg` (any maskable — safe zone 80%)
- Service Worker (`sw.js`) com estratégia cache-first: pré-cacheia o app shell na instalação, cacheia CDN externos dinamicamente (jsdelivr, googleapis), nunca cacheia chamadas de API (Anthropic, Supabase)
- Cache versionado (`estudaai-v1.9.0`) — `activate` deleta caches antigos e chama `clients.claim()`; `install` chama `skipWaiting()` para transição rápida
- Fallback offline: `navigate` sem rede devolve `index.html` do cache — app abre mesmo sem conexão
- Meta tags iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon`
- Banner discreto de "Nova versão disponível" aparece quando um SW atualizado está esperando; botão Atualizar envia `SKIP_WAITING` e recarrega
- `tests.js` seção 23: 14 asserções — link manifest, theme-color, meta tags apple/mobile, banner DOM, navigator.serviceWorker

### v1.8.0 — Suporte a LaTeX/MathJax
- MathJax 3 carregado assincronamente via CDN (`tex-svg.js`) com config `startup.typeset: false` (não tipeseta automaticamente — só quando chamado)
- Delimitadores configurados: `$...$` e `\(...\)` para inline; `$$...$$` e `\[...\]` para bloco
- `renderizarLatex(el)` — função null-safe que chama `MathJax.typesetPromise([el])` quando disponível
- `initLatexObserver()` — `MutationObserver` nas result-boxes (`result-historinha`, `result-redacao`, `result-material`, `result-plano`) observa mudança de classe para `visible`; observa `sim-questoes` para mudança de `childList` (disparado por `renderQuestoes`)
- Override de `verificarSimulado` re-tipeseta o container de questões após revelar gabariotes (cobre LaTeX nos textos de explicação)
- Prompts de historinha (CACD e Direito), simulado e material de PDF/texto instruem o Claude a usar LaTeX quando o conteúdo tem fórmulas
- CSS: `mjx-container` com `overflow-x: auto` (fórmulas longas não transbordam em mobile) e `display: block` para equações em bloco
- `tests.js` seção 22: 12+ asserções cobrindo null-safety, config, existência dos containers, override de verificarSimulado

### v1.7.0 — Estimativa de prontidão para a prova
- Campo **Data da prova / conclusão** adicionado ao modal de edição/criação de programa (salvo em `prog.dataProva`)
- Nova função `calcularProntidao(progId)` calcula: cobertura atual (matérias com atividade em `lacunas` ou `historico`), ritmo semanal (sessões / janela de 14 dias), dias restantes e estimativa de cobertura final com taxa de conversão de 40% (40% das sessões adicionam uma matéria nova, o restante são revisões)
- Nova função `renderProntidao(containerId, progId)` renderiza widget no Dashboard com duas barras de progresso (cobertura atual e estimativa projetada), contadores e mensagem adaptativa (verde ≥90%, laranja ≥60%, vermelho <60%)
- Widget exibido no Dashboard para o programa ativo (CACD e Direito), com botão de atalho para editar a data da prova
- Sem data configurada: exibe cobertura atual e convida o usuário a definir a data
- `tests.js` atualizado: nova seção 21 com 14 asserções cobrindo cálculo, projeção com data futura, data passada, sem data, detecção de matérias com lacunas e smoke tests de renderização

### v1.6.0 — Compartilhamento de programas de estudo
- Novo botão **Exportar** em cada programa na seção Programas de Estudo
- Novo botão **Importar** no cabeçalho da seção, abre modal com upload de arquivo `.json` ou código colado
- Função `exportarPrograma(id)` serializa o programa + todas as matérias e tópicos em JSON; produz código base64 copiável e botão de download como arquivo `.json`
- Função `_executarImportPrograma(data)` recria o programa com IDs novos (sem conflito com dados existentes), vincula todas as matérias e sincroniza com Supabase
- Formato de exportação documentado: `{ versao, tipo:"programa", exportadoEm, programa:{nome,tipo,instituicao,ano}, materias:[{nome,topicos:{n1,n2,n3}}] }`
- IDs são sempre regenerados na importação — dados de progresso (lacunas, SM-2) não viajam no export
- `tests.js` atualizado: nova seção 20 com 15 asserções cobrindo export, round-trip, isolamento de IDs, importação de matérias e validação de formatos inválidos

### v1.5.0 — Diagnóstico de lacunas de conhecimento
- Novo sistema de rastreamento: `verificarSimulado()` registra acertos e erros por matéria no objeto `lacunas` (persiste em `localStorage.estuda_lacunas`)
- Nova função `renderDiagnostico(containerId, progId)` exibe ranking das matérias com maior taxa de erro, com barra visual colorida (verde → amarelo → vermelho) e botões de ação direta
- Botão **"↺ Historinha"** navega para o painel Historinha com a matéria pré-selecionada
- Botão **"⊛ Revisar SM-2"** navega para Revisão e carrega o baralho da matéria (exibido só quando existe baralho)
- Seção "Diagnóstico de lacunas" adicionada no Dashboard (CACD e Direito) e no painel Progresso
- `tests.js` atualizado: nova seção 18 com testes de salvarLacunas, renderDiagnostico (com e sem dados), ordenação por taxa de erro, e simulação do fluxo de rastreamento pós-simulado

### v1.4.3 — Testes automatizados (tests.js v2)
- `tests.js` reescrito com cobertura abrangente: 80+ asserções em 19 seções
- Cobre: uid, helpers de programa/matéria, períodos, persistência localStorage, SM-2 (todos os fluxos de qualidade e transições de estado), gamificação (getNivel nos 4 níveis, ganharXP, criarBaralho, streak), freemium (contarGeracao, isPremium, verificarResetMensal, ativarPremiumDemo), histórico (limite 30), contexto IA (getContextoMateria, getEscopoUnidade), tema, navegação (BUG FIX 1 + 2), renderizações (smoke)
- Runner com snapshot/restore de estado global: testes não poluem dados reais do usuário

### v1.4.2 — Unificação de botões de programa no painel Matérias
- Eliminado o row duplicado de botões de programa: o `prog-toggle` da topbar é ocultado quando o usuário está no painel Matérias, pois o `mat-tabs-container` já cobre tanto a seleção de programa quanto a navegação para Períodos
- `switchMatTab()` agora chama `setModo()` ao trocar de programa, mantendo o estado global (`programaAtivoId`) sincronizado com a aba selecionada

### v1.4.1 — Fix progId + testes
- Corrigido `ReferenceError: progId is not defined` em `sincronizarPaineisModo()`: a variável era referenciada como livre; substituída por `programaAtivoId` (que já está definido no escopo global antes da chamada)
- Adicionado `tests.js` com smoke tests executáveis no console do navegador (uid, getPrograma, setModo, switchMatTab, getMaterias, isPremium, sm2, getNivel, contarGeracao)

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

Ver [ROADMAP.md](ROADMAP.md) para a lista completa com estimativas de horas por atividade (~56h restantes).

**Estratégia:** construir valor primeiro, monetizar por último.  
**Regra de trabalho:** cada item inicia em branch dedicada → atualiza README → merge na main → push.

### Fase 1 — Fundação *(em andamento)*
- [x] Otimizar `max_tokens` por tipo de chamada à API
- [x] Atualizar README para v1.4
- [x] Fix bug `progId is not defined` ao duplicar aba de Matérias
- [x] Unificar rows de botões de programa no painel Matérias
- [x] Testes automatizados básicos (`tests.js`)

### Fase 2 — Features diferenciadoras
- [x] Diagnóstico de lacunas de conhecimento (tópicos com mais erros no simulado)
- [x] Compartilhamento de programas de estudo (export/import JSON)
- [x] Estimativa de prontidão para a prova
- [x] Suporte a LaTeX/MathJax nas respostas

### Fase 3 — Retenção e produto completo
- [x] PWA + Service Worker (instalação no celular, offline real)
- [ ] Push notifications para revisão SM-2
- [ ] Onboarding wizard para novos usuários
- [ ] Histórico de notas das redações com gráfico de evolução
- [ ] Exportação de historinhas e flashcards para PDF
- [ ] Estatísticas por matéria e por período

### Fase 4 — Monetização *(cobrar por produto que já entrega valor)*
- [ ] Integração Stripe real (substituir `ativarPremiumDemo()`)
- [ ] Proxy API via Supabase Edge Function (chave da plataforma, não do usuário)
- [ ] Rate limiting real no backend (Supabase)

---

## Licença

Projeto pessoal. Sem licença open source definida.
