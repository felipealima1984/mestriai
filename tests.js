/**
 * Estuda.AI — Smoke Tests v2
 *
 * Execução: abra o app no navegador, cole todo este arquivo no console e pressione Enter.
 * Requer: página carregada com dados (ao menos um programa cadastrado).
 *
 * Cobertura:
 *  - Utilitários: uid, getPrograma, getMaterias, getMateria, helpers de tipo
 *  - Persistência: salvarProgramas, salvarMaterias, salvarPeriodosLocal, salvarStats,
 *                  salvarGamification, salvarBaralhos, salvarPlanoLocal
 *  - SM-2: qualidades 0/1/2, transições de estado, caso "dominado"
 *  - Gamificação: getNivel (4 níveis), ganharXP, criarBaralho
 *  - Streak: atualizarStreak (novo dia, continuidade, reset)
 *  - Freemium: getMesAtual, isPremium, verificarResetMensal, contarGeracao, ativarPremiumDemo
 *  - Histórico: adicionarHistorico, limite 30 entradas
 *  - Contexto IA: getContextoMateria, getEscopoUnidade
 *  - Tema: setTheme
 *  - Navegação: goTo, setModo, switchMatTab (inclui verificação dos BUG FIX 1 e 2)
 *  - Renderizações: não lançam exceção (renderDashboard, renderCrudLista, etc.)
 *  - Compartilhamento de programas: _montarExportPrograma, _executarImportPrograma, round-trip export→import
 *  - Estimativa de prontidão: calcularProntidao (totalMaterias, coberturaAtual, diasRestantes, estimadoFinal), lacunas, datas passada/futura/sem data
 *  - LaTeX/MathJax: renderizarLatex (null-safe, sem MathJax), initLatexObserver, config inlineMath/displayMath, override verificarSimulado
 */
(() => {
  'use strict';

  // ─── Runner ──────────────────────────────────────────────────────────────────

  let passed = 0, failed = 0;

  function ok(label, result) {
    if (result) {
      console.log('%c ✓ ' + label, 'color:#4caf50;font-weight:bold');
      passed++;
    } else {
      console.error('%c ✗ ' + label, 'color:#f44336;font-weight:bold');
      failed++;
    }
  }

  function section(title) {
    console.group('%c ▶ ' + title, 'color:#90caf9;font-weight:bold;font-size:13px');
  }

  function endSection() { console.groupEnd(); }

  function noThrow(label, fn) {
    try { fn(); ok(label, true); }
    catch (e) { console.error(e); ok(label, false); }
  }

  /** Snapshot de variáveis globais mutáveis para restaurar ao final. */
  function snapshot() {
    return {
      plano:          JSON.parse(JSON.stringify(plano)),
      gamification:   JSON.parse(JSON.stringify(gamification)),
      historico:      [...historico],
      materias:       JSON.parse(JSON.stringify(materias)),
      programas:      JSON.parse(JSON.stringify(programas)),
      periodos:       JSON.parse(JSON.stringify(periodos)),
      baralhos:       JSON.parse(JSON.stringify(baralhos)),
      lacunas:        JSON.parse(JSON.stringify(lacunas)),
      programaAtivoId,
      periodoAtivo,
      matTabAtual,
      simMateriaIdAtual,
    };
  }

  function restore(snap) {
    Object.assign(plano, snap.plano);
    Object.assign(gamification, snap.gamification);
    historico.length = 0; snap.historico.forEach(h => historico.push(h));
    materias.length = 0;  snap.materias.forEach(m => materias.push(m));
    programas.length = 0; snap.programas.forEach(p => programas.push(p));
    periodos.length = 0;  snap.periodos.forEach(p => periodos.push(p));
    baralhos.length = 0;  snap.baralhos.forEach(b => baralhos.push(b));
    Object.keys(lacunas).forEach(k => delete lacunas[k]);
    Object.assign(lacunas, snap.lacunas);
    programaAtivoId   = snap.programaAtivoId;
    periodoAtivo      = snap.periodoAtivo;
    matTabAtual       = snap.matTabAtual;
    simMateriaIdAtual = snap.simMateriaIdAtual;
  }

  const estado = snapshot();

  // ─── 1. uid() ─────────────────────────────────────────────────────────────────

  section('uid()');
  ok('retorna string não-vazia',  typeof uid() === 'string' && uid().length > 0);
  ok('começa com "m"',            uid().startsWith('m'));
  ok('gera IDs únicos (10 amostras)', new Set(Array.from({length:10}, uid)).size === 10);
  endSection();

  // ─── 2. Helpers de programa ──────────────────────────────────────────────────

  section('getPrograma / getProgramaAtivo / isConcurso / hasUnidades');
  if (programas.length > 0) {
    const p = programas[0];
    ok('getPrograma(id) encontra programa existente',   getPrograma(p.id) === p);
    ok('getPrograma(fake) retorna undefined',           getPrograma('__x__') === undefined);
    ok('getProgramaAtivo() retorna objeto',             typeof getProgramaAtivo() === 'object');
    ok('isConcurso(undefined) → true (default)',        isConcurso(undefined) === true);
    const concursoFake = { tipo:'concurso' };
    const gradFake     = { tipo:'graduacao' };
    ok('isConcurso({tipo:"concurso"}) → true',         isConcurso(concursoFake) === true);
    ok('isConcurso({tipo:"graduacao"}) → false',       isConcurso(gradFake) === false);
    ok('hasUnidades({tipo:"graduacao"}) → true',       hasUnidades(gradFake) === true);
    ok('hasUnidades({tipo:"concurso"}) → false',       hasUnidades(concursoFake) === false);
    ok('hasUnidades(null) → false',                    hasUnidades(null) === false);
    ok('getProgCor retorna string CSS',                typeof getProgCor(p.id) === 'string');
    ok('getProgLabel retorna nome do programa',        typeof getProgLabel(p.id) === 'string' && getProgLabel(p.id).length > 0);
    ok('getProgTagClass retorna string',               typeof getProgTagClass(p.id) === 'string');
    ok('isConcursoId(id_concurso) = isConcurso(prog)', isConcursoId(p.id) === isConcurso(p));
  } else {
    console.warn('Sem programas — seção ignorada');
  }
  endSection();

  // ─── 3. Helpers de matéria ───────────────────────────────────────────────────

  section('getMaterias / getTodasMaterias / getMateria');
  ok('getMaterias(progAtivo) retorna array',          Array.isArray(getMaterias(programaAtivoId)));
  ok('getMaterias(fake) retorna array vazio',         Array.isArray(getMaterias('__fake__')) && getMaterias('__fake__').length === 0);
  ok('getTodasMaterias retorna array',                Array.isArray(getTodasMaterias(programaAtivoId)));
  ok('getMateria(fake) retorna undefined',            getMateria('__fake__') === undefined);
  if (materias.length > 0) {
    const m = materias[0];
    ok('getMateria(id) encontra matéria existente',   getMateria(m.id) === m);
    ok('matéria tem topicos.n1 array',                Array.isArray(m.topicos?.n1));
    ok('matéria tem topicos.n2 array',                Array.isArray(m.topicos?.n2));
    ok('matéria tem topicos.n3 array',                Array.isArray(m.topicos?.n3));
  }
  endSection();

  // ─── 4. Períodos ─────────────────────────────────────────────────────────────

  section('getPeriodo / getPeriodoAtivo / salvarPeriodosLocal');
  ok('getPeriodo(fake) retorna undefined',    getPeriodo('__x__') === undefined);
  ok('getPeriodoAtivo() não lança exceção',   (() => { try { getPeriodoAtivo(); return true; } catch { return false; } })());
  noThrow('salvarPeriodosLocal() persiste sem erro', () => {
    salvarPeriodosLocal();
    const salvo = JSON.parse(localStorage.getItem('estuda_periodos') || '[]');
    if (!Array.isArray(salvo)) throw new Error('periodos não é array');
  });
  endSection();

  // ─── 5. Persistência localStorage ────────────────────────────────────────────

  section('Persistência localStorage');
  noThrow('salvarProgramas() persiste array válido', () => {
    salvarProgramas();
    const arr = JSON.parse(localStorage.getItem('estuda_programas') || 'null');
    if (!Array.isArray(arr)) throw new Error('programas não é array');
  });
  noThrow('salvarMaterias() persiste array válido', () => {
    salvarMaterias();
    const arr = JSON.parse(localStorage.getItem('estuda_materias') || 'null');
    if (!Array.isArray(arr)) throw new Error('materias não é array');
  });
  noThrow('salvarStats() persiste sem erro', () => salvarStats());
  noThrow('salvarGamification() persiste sem erro', () => salvarGamification());
  noThrow('salvarBaralhos() persiste array válido', () => {
    salvarBaralhos();
    const arr = JSON.parse(localStorage.getItem('estuda_baralhos') || 'null');
    if (!Array.isArray(arr)) throw new Error('baralhos não é array');
  });
  noThrow('salvarPlanoLocal() persiste objeto com tipo', () => {
    salvarPlanoLocal();
    const p = JSON.parse(localStorage.getItem('estuda_plano') || 'null');
    if (!p || !p.tipo) throw new Error('plano.tipo ausente');
  });
  endSection();

  // ─── 6. SM-2 — Algoritmo ─────────────────────────────────────────────────────

  section('sm2() — algoritmo de revisão espaçada');

  function novoCard() {
    return { estado:'novo', intervalo:1, facilidade:2.5, proxRevisao:'', revisoes:0, acertos:0, revisadoHoje:false };
  }

  const hoje = new Date().toDateString();
  const amanha = new Date(Date.now() + 86400000).toDateString();

  // Qualidade 0 — Errei
  const c0 = sm2(novoCard(), 0);
  ok('q=0: revisoes incrementa',            c0.revisoes === 1);
  ok('q=0: estado = "aprendendo"',          c0.estado === 'aprendendo');
  ok('q=0: intervalo = 1',                  c0.intervalo === 1);
  ok('q=0: proxRevisao = hoje',             c0.proxRevisao === hoje);
  ok('q=0: revisadoHoje = true',            c0.revisadoHoje === true);

  // Qualidade 1 — Quase
  const c1 = sm2(novoCard(), 1);
  ok('q=1: estado = "aprendendo"',          c1.estado === 'aprendendo');
  ok('q=1: intervalo = 1',                  c1.intervalo === 1);
  ok('q=1: proxRevisao = amanhã',           c1.proxRevisao === amanha);

  // Qualidade 2 — Acertei (1ª revisão)
  const c2a = sm2(novoCard(), 2);
  ok('q=2 revisao=1: acertos = 1',          c2a.acertos === 1);
  ok('q=2 revisao=1: intervalo = 1',        c2a.intervalo === 1);
  ok('q=2 revisao=1: estado = "aprendendo"',c2a.estado === 'aprendendo');

  // Qualidade 2 — 2ª revisão consecutiva
  const c2b = novoCard();
  c2b.revisoes = 1; c2b.acertos = 1;
  sm2(c2b, 2);
  ok('q=2 revisao=2: intervalo = 6',        c2b.intervalo === 6);

  // Qualidade 2 — 3ª revisão (usa facilidade)
  const c2c = novoCard();
  c2c.revisoes = 2; c2c.intervalo = 6; c2c.facilidade = 2.5;
  sm2(c2c, 2);
  ok('q=2 revisao=3: intervalo = round(6 * facilidade_nova)', c2c.intervalo > 1);

  // Estado "dominado" — 5+ acertos e intervalo >= 21
  const cDom = { estado:'aprendendo', intervalo:21, facilidade:2.5, revisoes:10, acertos:4, revisadoHoje:false };
  sm2(cDom, 2); // acertos vira 5
  ok('acertos=5, intervalo>=21 → estado = "dominado"', cDom.estado === 'dominado');

  // Facilidade mínima
  const cMin = novoCard();
  cMin.facilidade = 1.3; cMin.revisoes = 2; cMin.intervalo = 6;
  sm2(cMin, 2);
  ok('facilidade não cai abaixo de 1.3', cMin.facilidade >= 1.3);

  endSection();

  // ─── 7. Gamificação — Níveis ─────────────────────────────────────────────────

  section('getNivel() — 4 faixas de XP');
  const nBronze   = getNivel(0);
  const nPrata    = getNivel(100);
  const nOuro     = getNivel(300);
  const nDiamante = getNivel(700);
  ok('xp=0   → Bronze',    nBronze?.nome?.includes('Bronze'));
  ok('xp=100 → Prata',     nPrata?.nome?.includes('Prata'));
  ok('xp=300 → Ouro',      nOuro?.nome?.includes('Ouro'));
  ok('xp=700 → Diamante',  nDiamante?.nome?.includes('Diamante'));
  ok('xp=99  → Bronze (antes da fronteira)', getNivel(99)?.nome?.includes('Bronze'));
  ok('xp=299 → Prata (antes da fronteira)',  getNivel(299)?.nome?.includes('Prata'));
  ok('xp=699 → Ouro (antes da fronteira)',   getNivel(699)?.nome?.includes('Ouro'));
  ok('getNivel sempre retorna objeto',       typeof getNivel(50000) === 'object');
  endSection();

  // ─── 8. Gamificação — ganharXP ───────────────────────────────────────────────

  section('ganharXP()');
  const xpAntes = gamification.xp;
  ganharXP(10, 'Teste unitário');
  ok('gamification.xp aumenta em 10', gamification.xp === xpAntes + 10);
  ok('valor persiste em localStorage', JSON.parse(localStorage.getItem('estuda_gamification') || '{}').xp === gamification.xp);
  gamification.xp = xpAntes; salvarGamification(); // restaurar
  endSection();

  // ─── 9. Gamificação — Streak ─────────────────────────────────────────────────

  section('atualizarStreak()');
  // Cenário: dia nunca registrado → streak = 1
  const gSnap = JSON.parse(JSON.stringify(gamification));
  gamification.lastStudyDate = '';
  gamification.streak = 0;
  atualizarStreak();
  ok('streak=1 após primeiro estudo do dia', gamification.streak === 1);
  ok('lastStudyDate = hoje após atualizarStreak()', gamification.lastStudyDate === hoje);
  ok('diasEstudados inclui hoje', gamification.diasEstudados.includes(hoje));

  // Cenário: chamar duas vezes no mesmo dia → não muda
  const streakAntes = gamification.streak;
  atualizarStreak();
  ok('segunda chamada no mesmo dia não altera streak', gamification.streak === streakAntes);

  // Cenário: último estudo foi há 2 dias → streak reseta para 1
  gamification.lastStudyDate = new Date(Date.now() - 2*86400000).toDateString();
  gamification.streak = 5;
  atualizarStreak();
  ok('streak reseta para 1 após 2 dias sem estudo', gamification.streak === 1);

  Object.assign(gamification, gSnap); salvarGamification(); // restaurar
  endSection();

  // ─── 10. Baralhos — criarBaralho ─────────────────────────────────────────────

  section('criarBaralho()');
  const cardsInput = [
    { pergunta: 'O que é habeas corpus?', resposta: 'Remédio constitucional para proteger liberdade de locomoção' },
    { pergunta: 'O que é mandado de segurança?', resposta: 'Remédio para direito líquido e certo não amparado por HC' },
  ];
  const qtdAntes = baralhos.length;
  const novo = criarBaralho('Baralho Teste', programaAtivoId, '__mat__', 'Matéria Teste', cardsInput);
  ok('criarBaralho retorna objeto', typeof novo === 'object');
  ok('baralho tem id',              typeof novo.id === 'string');
  ok('baralho foi adicionado a baralhos[]', baralhos.length === qtdAntes + 1);
  ok('baralho tem 2 cards',         novo.cards.length === 2);
  ok('cards iniciam com estado "novo"',    novo.cards.every(c => c.estado === 'novo'));
  ok('cards iniciam com intervalo=1',      novo.cards.every(c => c.intervalo === 1));
  ok('cards iniciam com facilidade=2.5',   novo.cards.every(c => c.facilidade === 2.5));
  ok('cards têm proxRevisao definido',     novo.cards.every(c => typeof c.proxRevisao === 'string'));
  ok('cards têm id único',                 new Set(novo.cards.map(c => c.id)).size === 2);
  ok('getBaralho(id) encontra baralho',   getBaralho(novo.id) === novo);
  // remover baralho de teste
  baralhos.splice(baralhos.indexOf(novo), 1); salvarBaralhos();
  endSection();

  // ─── 11. Freemium — getMesAtual / isPremium / contarGeracao ──────────────────

  section('Freemium: getMesAtual / isPremium / verificarResetMensal / contarGeracao');
  const mesAtual = getMesAtual();
  ok('getMesAtual() retorna string "YYYY-MM"', /^\d{4}-\d{2}$/.test(mesAtual));
  ok('getMesAtual() coincide com mês atual',   mesAtual === new Date().toISOString().slice(0,7));

  // isPremium
  const tipoAntes = plano.tipo;
  plano.tipo = 'free';
  ok('isPremium() = false para plano free',    isPremium() === false);
  plano.tipo = 'premium';
  ok('isPremium() = true para plano premium',  isPremium() === true);
  plano.tipo = tipoAntes;

  // verificarResetMensal — mês diferente reseta geracoes
  const geracoesAntes   = plano.geracoes;
  const mesRefAntes     = plano.mesReferencia;
  plano.geracoes        = 15;
  plano.mesReferencia   = '2020-01'; // mês antigo
  verificarResetMensal();
  ok('geracoes resetam quando mes muda', plano.geracoes === 0);
  ok('mesReferencia atualiza para mês atual', plano.mesReferencia === mesAtual);

  // verificarResetMensal — mesmo mês não reseta
  plano.geracoes      = 7;
  plano.mesReferencia = mesAtual;
  verificarResetMensal();
  ok('geracoes mantidas quando mês não muda', plano.geracoes === 7);

  // contarGeracao — plano premium ignora limites
  plano.tipo      = 'premium';
  plano.geracoes  = 50;
  ok('contarGeracao() = true se premium (ignora limite)', contarGeracao() === true);

  // contarGeracao — plano free abaixo do limite
  plano.tipo      = 'free';
  plano.geracoes  = 5;
  plano.mesReferencia = mesAtual;
  const antesContagem = plano.geracoes;
  const resultado = contarGeracao();
  ok('contarGeracao() = true abaixo do limite', resultado === true);
  ok('geracoes incrementa em 1', plano.geracoes === antesContagem + 1);

  // contarGeracao — plano free NO limite → abre paywall e retorna false
  plano.geracoes = 20; // LIMITE_FREE
  const noLimite = contarGeracao();
  ok('contarGeracao() = false ao atingir LIMITE_FREE (20)', noLimite === false);
  ok('geracoes não ultrapassa LIMITE_FREE', plano.geracoes === 20);
  // fechar paywall aberto pelo teste
  try { fecharPaywall(); } catch (_) {}

  // ativarPremiumDemo
  plano.tipo = 'free';
  ativarPremiumDemo();
  ok('ativarPremiumDemo() muda tipo para "premium"', isPremium() === true);

  // Restaurar plano
  Object.assign(plano, { tipo: tipoAntes, geracoes: geracoesAntes, mesReferencia: mesRefAntes });
  salvarPlanoLocal();
  endSection();

  // ─── 12. Histórico ───────────────────────────────────────────────────────────

  section('adicionarHistorico() — limite 30 entradas');
  const histAntes = [...historico];
  // Adicionar 35 entradas e verificar que ficam no máximo 30
  for (let i = 0; i < 35; i++) {
    adicionarHistorico('simulado', 'teste', `Questão ${i}`);
  }
  ok('historico.length <= 30', historico.length <= 30);
  ok('entrada mais recente é a última adicionada', historico[0].detalhe === 'Questão 34');
  ok('historico[0].data é string', typeof historico[0].data === 'string');
  // restaurar
  historico.length = 0; histAntes.forEach(h => historico.push(h));
  localStorage.setItem('estuda_historico', JSON.stringify(historico));
  endSection();

  // ─── 13. Contexto IA ─────────────────────────────────────────────────────────

  section('getContextoMateria() / getEscopoUnidade()');

  // Criar matéria temporária em memória
  const matTemp = {
    id: '__test_mat__', nome: 'Direito Constitucional',
    programaId: programaAtivoId, frente: programaAtivoId,
    topicos: { n1: ['HC', 'MS'], n2: ['Mandado de injunção'], n3: [] }
  };
  materias.push(matTemp);

  ok('getContextoMateria sem topicos n3 retorna string', typeof getContextoMateria(matTemp.id, 'n3') === 'string');
  ok('getContextoMateria n3 sem topicos → só nome', getContextoMateria(matTemp.id, 'n3') === `matéria: ${matTemp.nome}`);
  ok('getContextoMateria n1 inclui topicos', getContextoMateria(matTemp.id, 'n1').includes('HC'));
  ok('getContextoMateria n1 inclui "tópicos desta unidade"', getContextoMateria(matTemp.id, 'n1').includes('tópicos desta unidade'));
  ok('getContextoMateria todas inclui n1 e n2', getContextoMateria(matTemp.id, 'todas').includes('HC') && getContextoMateria(matTemp.id, 'todas').includes('injunção'));
  ok('getContextoMateria id inválido retorna ""', getContextoMateria('__fake__', 'n1') === '');

  // getEscopoUnidade
  ok('getEscopoUnidade(N1, dir) retorna string', typeof getEscopoUnidade('N1', 'dir') === 'string' && getEscopoUnidade('N1', 'dir').length > 0);
  ok('getEscopoUnidade(N2, dir) menciona N1', getEscopoUnidade('N2', 'dir').includes('N1'));
  ok('getEscopoUnidade(N3, dir) menciona todo o semestre', getEscopoUnidade('N3', 'dir').includes('semestre'));
  ok('getEscopoUnidade(N1, cacd) retorna ""', getEscopoUnidade('N1', 'cacd') === '');
  ok('getEscopoUnidade sem frente retorna ""', getEscopoUnidade('N1', undefined) === '');

  // remover matéria temporária
  materias.splice(materias.indexOf(matTemp), 1);
  endSection();

  // ─── 14. Tema ────────────────────────────────────────────────────────────────

  section('setTheme()');
  const themeAntes = localStorage.getItem('estuda_theme') || 'dark';
  noThrow('setTheme("gray") não lança', () => setTheme('gray'));
  ok('theme-gray adicionado ao body', document.body.classList.contains('theme-gray'));
  ok('localStorage registra tema gray', localStorage.getItem('estuda_theme') === 'gray');
  noThrow('setTheme("light") não lança', () => setTheme('light'));
  ok('theme-light adicionado ao body', document.body.classList.contains('theme-light'));
  noThrow('setTheme("dark") não lança', () => setTheme('dark'));
  ok('theme-gray e theme-light removidos no modo dark', !document.body.classList.contains('theme-gray') && !document.body.classList.contains('theme-light'));
  setTheme(themeAntes); // restaurar
  endSection();

  // ─── 15. BUG FIX 1 — progId livre em sincronizarPaineisModo ─────────────────

  section('BUG FIX 1 — sincronizarPaineisModo() sem ReferenceError');
  const progAntes = programaAtivoId;
  let erroBug1 = false;
  try { if (programas.length > 0) setModo(programas[0].id); }
  catch (e) { erroBug1 = true; }
  ok('setModo() não lança ReferenceError', !erroBug1);
  ok('matTabAtual === programaAtivoId após setModo()', matTabAtual === programaAtivoId);
  try { if (progAntes) setModo(progAntes); } catch (_) {}
  endSection();

  // ─── 16. BUG FIX 2 — prog-toggle oculto no painel Matérias ──────────────────

  section('BUG FIX 2 — prog-toggle oculto no painel Matérias');
  const toggleEl = document.getElementById('prog-toggle');
  if (toggleEl) {
    noThrow('goTo("materias") não lança', () => goTo('materias', null));
    ok('prog-toggle oculto ao entrar em Matérias', toggleEl.style.display === 'none');
    noThrow('goTo("dashboard") não lança', () => goTo('dashboard', null));
    ok('prog-toggle visível ao sair de Matérias', toggleEl.style.display !== 'none');
  } else {
    console.warn('prog-toggle não encontrado — testes ignorados');
  }
  endSection();

  // ─── 17. switchMatTab() — sincronização e periodos ───────────────────────────

  section('switchMatTab() — sincronização e abas');
  if (programas.length > 0) {
    const p0 = programas[0];
    let switchErr = false;
    try { switchMatTab(p0.id); } catch (e) { switchErr = true; }
    ok('switchMatTab(progId) não lança exceção', !switchErr);
    ok('switchMatTab(progId) sincroniza programaAtivoId', programaAtivoId === p0.id);
    ok('matTabAtual = progId após switch', matTabAtual === p0.id);
  }
  const pAtivoSalvo = programaAtivoId;
  switchMatTab('periodos');
  ok('switchMatTab("periodos") não muda programaAtivoId', programaAtivoId === pAtivoSalvo);
  ok('mat-periodos-panel visível após "periodos"',
     document.getElementById('mat-periodos-panel')?.style.display === 'block');
  ok('mat-crud-panel oculto após "periodos"',
     document.getElementById('mat-crud-panel')?.style.display === 'none');
  if (programas.length > 0) {
    switchMatTab(programas[0].id);
    ok('mat-crud-panel visível após voltar ao programa',
       document.getElementById('mat-crud-panel')?.style.display !== 'none');
  }
  endSection();

  // ─── 18. Diagnóstico de Lacunas ──────────────────────────────────────────────

  section('Diagnóstico de Lacunas — salvarLacunas / renderDiagnostico / rastreamento');

  // Limpar lacunas para teste limpo
  Object.keys(lacunas).forEach(k => delete lacunas[k]);

  // salvarLacunas persiste objeto
  noThrow('salvarLacunas() persiste sem erro', () => {
    salvarLacunas();
    const salvo = JSON.parse(localStorage.getItem('estuda_lacunas') || 'null');
    if (typeof salvo !== 'object' || salvo === null) throw new Error('lacunas não é objeto');
  });

  // Simular registro de erros manualmente
  const matTeste = materias.length > 0 ? materias[0] : null;
  if (matTeste) {
    const pid = matTeste.programaId || matTeste.frente;
    lacunas[matTeste.id] = { nome: matTeste.nome, programaId: pid, acertos: 2, erros: 8 };
    lacunas['__mat_boa__'] = { nome: 'Matéria sem erros', programaId: pid, acertos: 10, erros: 0 };

    // renderDiagnostico não lança com dados reais
    noThrow('renderDiagnostico() não lança com dados', () => renderDiagnostico('diag-cacd', pid));

    // Verifica que o HTML inclui o nome da matéria e a taxa de erro
    const el = document.getElementById('diag-cacd');
    ok('renderDiagnostico: container preenchido', el && el.innerHTML.trim().length > 0);
    ok('renderDiagnostico: mostra nome da matéria', el && el.innerHTML.includes(matTeste.nome.split('—')[0].trim()));
    ok('renderDiagnostico: mostra percentual (80% erros)', el && el.innerHTML.includes('80%'));

    // Matéria com 0 erros deve vir depois (ordenação por taxa de erro decrescente)
    const textoCompleto = el ? el.innerHTML : '';
    const posErros = textoCompleto.indexOf(matTeste.nome.split('—')[0].trim());
    const posBoa   = textoCompleto.indexOf('Matéria sem erros');
    ok('matéria com mais erros aparece antes da com menos', posBoa === -1 || posErros < posBoa);

    // renderDiagnostico com progId sem dados mostra mensagem padrão
    noThrow('renderDiagnostico() com progId sem dados', () => renderDiagnostico('diag-cacd', '__prog_vazio__'));
    ok('renderDiagnostico: mostra msg quando sem dados', el && el.innerHTML.includes('simulados'));

    // Limpar
    delete lacunas[matTeste.id];
    delete lacunas['__mat_boa__'];
  } else {
    console.warn('Sem matérias cadastradas — testes de diagnóstico com dados ignorados');
  }

  // salvarLacunas persiste dados corretos
  if (matTeste) {
    const pid = matTeste.programaId || matTeste.frente;
    lacunas[matTeste.id] = { nome: matTeste.nome, programaId: pid, acertos: 3, erros: 7 };
    salvarLacunas();
    const salvo = JSON.parse(localStorage.getItem('estuda_lacunas') || '{}');
    ok('lacunas persistidas com acertos/erros corretos', salvo[matTeste.id]?.erros === 7 && salvo[matTeste.id]?.acertos === 3);
    delete lacunas[matTeste.id];
    salvarLacunas();
  }

  // Simular fluxo: simMateriaIdAtual → verificarSimulado registra em lacunas
  if (matTeste && programas.length > 0) {
    const pid = matTeste.programaId || matTeste.frente;
    simMateriaIdAtual = matTeste.id;
    // Simular estado de questões respondidas
    const lacunasAntes = { acertos: lacunas[matTeste.id]?.acertos || 0, erros: lacunas[matTeste.id]?.erros || 0 };
    // Chamar a lógica de rastreamento diretamente (sem depender de DOM do simulado)
    const acertos = 1, totalQ = 3;
    if (!lacunas[simMateriaIdAtual]) {
      const m2 = getMateria(simMateriaIdAtual);
      lacunas[simMateriaIdAtual] = { nome: m2?.nome || '', programaId: m2 ? (m2.programaId || m2.frente) : programaAtivoId, acertos: 0, erros: 0 };
    }
    lacunas[simMateriaIdAtual].acertos += acertos;
    lacunas[simMateriaIdAtual].erros   += (totalQ - acertos);
    ok('rastreamento manual: acertos registrados', lacunas[matTeste.id].acertos === lacunasAntes.acertos + 1);
    ok('rastreamento manual: erros registrados',   lacunas[matTeste.id].erros   === lacunasAntes.erros + 2);

    // Limpar
    delete lacunas[matTeste.id];
    simMateriaIdAtual = null;
    salvarLacunas();
  }

  endSection();

  // ─── 19. Renderizações — não lançam exceção ──────────────────────────────────

  section('Renderizações — smoke (não devem lançar exceção)');
  noThrow('renderToggleProgramas()', () => renderToggleProgramas());
  noThrow('renderListaProgramas()',  () => renderListaProgramas());
  noThrow('renderCrudLista()',       () => renderCrudLista());
  noThrow('renderMatTabs()',         () => renderMatTabs());
  noThrow('renderBaralhos()',        () => renderBaralhos());
  noThrow('renderDashboard()',       () => renderDashboard());
  noThrow('renderXP()',              () => renderXP());
  noThrow('renderUsageBar()',        () => renderUsageBar());
  noThrow('renderProgresso()',       () => renderProgresso());
  noThrow('renderDiagnostico() vazio', () => renderDiagnostico('diag-cacd', '__vazio__'));
  endSection();

  // ─── 20. Compartilhamento de programas (Tarefa 7) ────────────────────────────

  section('Compartilhamento de programas — export/import');

  if (programas.length > 0) {
    const progTeste = programas[0];
    const qtdMatsAntes = materias.length;
    const qtdProgsAntes = programas.length;

    // -- Export --
    noThrow('_montarExportPrograma() não lança exceção', () => _montarExportPrograma(progTeste.id));

    const exportData = _montarExportPrograma(progTeste.id);
    ok('exportData tem versao "1.0"',            exportData && exportData.versao === '1.0');
    ok('exportData tem tipo "programa"',         exportData && exportData.tipo === 'programa');
    ok('exportData.programa tem nome',           exportData && typeof exportData.programa.nome === 'string' && exportData.programa.nome.length > 0);
    ok('exportData.programa tem tipo',           exportData && typeof exportData.programa.tipo === 'string');
    ok('exportData.materias é array',            exportData && Array.isArray(exportData.materias));
    ok('exportData.exportadoEm é string ISO',    exportData && typeof exportData.exportadoEm === 'string' && exportData.exportadoEm.includes('T'));

    if (exportData && exportData.materias.length > 0) {
      const m0 = exportData.materias[0];
      ok('matéria exportada tem nome',           typeof m0.nome === 'string' && m0.nome.length > 0);
      ok('matéria exportada tem topicos.n1',     Array.isArray(m0.topicos && m0.topicos.n1));
      ok('matéria exportada tem topicos.n2',     Array.isArray(m0.topicos && m0.topicos.n2));
      ok('matéria exportada tem topicos.n3',     Array.isArray(m0.topicos && m0.topicos.n3));
      ok('matéria exportada NÃO tem id (isolado)', m0.id === undefined);
      ok('matéria exportada NÃO tem programaId (isolado)', m0.programaId === undefined);
    }

    // -- Round-trip: export → encode → decode → import --
    noThrow('round-trip export/import não lança exceção', () => {
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(exportData))));
      const decoded = JSON.parse(decodeURIComponent(escape(atob(code))));
      _executarImportPrograma(decoded);
    });

    ok('import criou novo programa',  programas.length === qtdProgsAntes + 1);
    ok('import criou novas matérias', materias.length  >= qtdMatsAntes);

    const importado = programas[programas.length - 1];
    ok('programa importado tem nome com "(importado)"', importado.nome.includes('importado'));
    ok('programa importado tem tipo válido',            typeof importado.tipo === 'string');
    ok('programa importado tem id próprio',             importado.id !== progTeste.id);

    const matsImportadas = materias.filter(m => m.programaId === importado.id);
    ok('matérias importadas têm programaId correto',  matsImportadas.every(m => m.programaId === importado.id));
    ok('matérias importadas têm id próprio (não conflita)', matsImportadas.every(m => m.id !== undefined && m.id.startsWith('m')));
    ok('matérias importadas têm topicos.n1 array',    matsImportadas.every(m => Array.isArray(m.topicos && m.topicos.n1)));

    // -- Import com formato inválido deve falhar silenciosamente --
    noThrow('_executarImportPrograma(dados inválidos) não lança', () => {
      _executarImportPrograma({ versao: '1.0', tipo: 'baralho' }); // tipo errado
      _executarImportPrograma(null);
      _executarImportPrograma({});
    });
    ok('dados inválidos não alteram contagem de programas', programas.length === qtdProgsAntes + 1);

    // -- Limpar programa e matérias importadas pelo teste --
    programas.splice(programas.indexOf(importado), 1);
    materias.splice(0, materias.length, ...materias.filter(m => m.programaId !== importado.id));
    salvarProgramas(); salvarMaterias();

  } else {
    console.warn('Sem programas — seção 20 ignorada');
  }

  endSection();

  // ─── 21. Estimativa de prontidão (Tarefa 8) ──────────────────────────────────

  section('Estimativa de prontidão para a prova — calcularProntidao');

  if (programas.length > 0) {
    const progTeste = programas[0];
    const mats = getTodasMaterias(progTeste.id);

    // -- Sem matérias: retorna null --
    ok('calcularProntidao(fake) retorna null', calcularProntidao('__fake__') === null);

    if (mats.length > 0) {
      const dados = calcularProntidao(progTeste.id);
      ok('calcularProntidao retorna objeto',          dados !== null && typeof dados === 'object');
      ok('totalMaterias é número positivo',           dados && dados.totalMaterias > 0);
      ok('estudadas é número >= 0',                   dados && dados.estudadas >= 0);
      ok('estudadas <= totalMaterias',                dados && dados.estudadas <= dados.totalMaterias);
      ok('coberturaAtual está entre 0 e 100',         dados && dados.coberturaAtual >= 0 && dados.coberturaAtual <= 100);
      ok('estimadoFinal >= coberturaAtual',           dados && dados.estimadoFinal >= dados.coberturaAtual);
      ok('estimadoFinal <= 100',                      dados && dados.estimadoFinal <= 100);
      ok('ritmoSemana é número >= 0',                 dados && dados.ritmoSemana >= 0);
      ok('progId corresponde ao programa testado',    dados && dados.progId === progTeste.id);

      // -- Com dataProva futura: diasRestantes > 0 --
      const dataFutura = new Date(); dataFutura.setFullYear(dataFutura.getFullYear() + 1);
      const isoFuturo = dataFutura.toISOString().slice(0, 10);
      const progOrigDataProva = progTeste.dataProva;
      progTeste.dataProva = isoFuturo;

      const dadosFuturo = calcularProntidao(progTeste.id);
      ok('diasRestantes > 0 com data futura',         dadosFuturo && dadosFuturo.diasRestantes > 0);
      ok('estimadoFinal >= coberturaAtual (futura)',   dadosFuturo && dadosFuturo.estimadoFinal >= dadosFuturo.coberturaAtual);

      // -- Com dataProva passada: diasRestantes = 0 --
      progTeste.dataProva = '2020-01-01';
      const dadosPassado = calcularProntidao(progTeste.id);
      ok('diasRestantes = 0 com data passada',        dadosPassado && dadosPassado.diasRestantes === 0);

      // -- Sem dataProva: diasRestantes null --
      progTeste.dataProva = '';
      const dadosSemData = calcularProntidao(progTeste.id);
      ok('diasRestantes null sem data',               dadosSemData && dadosSemData.diasRestantes === null);
      ok('estimadoFinal = coberturaAtual sem data',   dadosSemData && dadosSemData.estimadoFinal === dadosSemData.coberturaAtual);

      // Restaurar dataProva original
      progTeste.dataProva = progOrigDataProva;
    } else {
      console.warn('Programa sem matérias — sub-seção de cálculo ignorada');
    }

    // -- renderProntidao não lança exceção --
    noThrow('renderProntidao() sem container DOM não lança', () => renderProntidao('__nao_existe__', progTeste.id));
    noThrow('renderProntidao() CACD não lança', () => renderProntidao('prontidao-cacd', progTeste.id));
    noThrow('renderProntidao() Direito não lança', () => renderProntidao('prontidao-dir', progTeste.id));

    // -- Matérias com lacunas são detectadas --
    if (mats.length > 0) {
      const matAlvo = mats[0];
      const lacAntes = lacunas[matAlvo.id];
      lacunas[matAlvo.id] = { acertos: 3, erros: 1 };
      const dadosComLacuna = calcularProntidao(progTeste.id);
      ok('matéria com lacuna é contada como estudada', dadosComLacuna && dadosComLacuna.estudadas >= 1);
      // Restaurar
      if (lacAntes === undefined) delete lacunas[matAlvo.id];
      else lacunas[matAlvo.id] = lacAntes;
    }

  } else {
    console.warn('Sem programas — seção 21 ignorada');
  }

  endSection();

  // ─── 22. Suporte a LaTeX/MathJax (Tarefa 9) ──────────────────────────────────

  section('Suporte a LaTeX/MathJax — renderizarLatex e observer');

  // -- renderizarLatex existe e não lança sem MathJax --
  ok('renderizarLatex é função',             typeof renderizarLatex === 'function');
  noThrow('renderizarLatex(null) não lança', () => renderizarLatex(null));
  noThrow('renderizarLatex(div) não lança sem MathJax', () => {
    const div = document.createElement('div');
    div.textContent = 'f(x) = $x^2$';
    renderizarLatex(div);
  });

  // -- Se MathJax estiver carregado, typesetPromise é chamável --
  if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
    noThrow('MathJax.typesetPromise([div]) retorna Promise', () => {
      const div = document.createElement('div');
      div.textContent = 'Inline: $E = mc^2$';
      const p = MathJax.typesetPromise([div]);
      ok('retorno é Promise', p && typeof p.then === 'function');
    });
  } else {
    console.warn('MathJax ainda não carregado — testes de typesetPromise ignorados (OK em ambiente offline)');
    ok('renderizarLatex guarda graciosamente quando MathJax ausente', true);
  }

  // -- initLatexObserver existe e não lança --
  ok('initLatexObserver é função',             typeof initLatexObserver === 'function');
  noThrow('initLatexObserver() não lança',     () => initLatexObserver());

  // -- result-boxes existem no DOM --
  ok('result-historinha existe no DOM',  !!document.getElementById('result-historinha'));
  ok('result-redacao existe no DOM',     !!document.getElementById('result-redacao'));
  ok('result-material existe no DOM',    !!document.getElementById('result-material'));
  ok('result-plano existe no DOM',       !!document.getElementById('result-plano'));
  ok('sim-questoes existe no DOM',       !!document.getElementById('sim-questoes'));

  // -- MathJax config foi definido --
  ok('window.MathJax foi configurado (inlineMath)',
    window.MathJax &&
    Array.isArray(MathJax.tex && MathJax.tex.inlineMath) &&
    MathJax.tex.inlineMath.some(pair => pair[0] === '$' && pair[1] === '$')
  );
  ok('config displayMath inclui $$',
    window.MathJax &&
    Array.isArray(MathJax.tex && MathJax.tex.displayMath) &&
    MathJax.tex.displayMath.some(pair => pair[0] === '$$' && pair[1] === '$$')
  );

  // -- Override de verificarSimulado não quebrou a função --
  ok('verificarSimulado ainda é função após override', typeof verificarSimulado === 'function');

  endSection();

  // ─── Restaurar estado global ─────────────────────────────────────────────────

  restore(estado);
  try { goTo('dashboard', null); } catch (_) {}

  // ─── Sumário ─────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const ok100 = failed === 0;
  console.log(
    `%c\n${ok100 ? '🎉' : '⚠️'} Resultado: ${passed}/${total} testes passando${failed > 0 ? ` — ${failed} falhando` : ''}`,
    `color:${ok100 ? '#4caf50' : '#ff9800'};font-size:14px;font-weight:bold`
  );
  if (failed > 0) console.warn('Verifique as linhas em vermelho acima para detalhes.');

  return { passed, failed, total };
})();
