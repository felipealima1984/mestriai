/**
 * Estuda.AI — Smoke Tests
 * Execução: cole no console do navegador com a página aberta.
 *
 * Cobre as funções críticas e o bug progId (issue: sincronizarPaineisModo
 * referenciava progId como variável livre em vez de programaAtivoId).
 */
(() => {
  let passed = 0;
  let failed = 0;

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
    console.group('%c ' + title, 'color:#90caf9;font-weight:bold;font-size:13px');
  }

  function endSection() {
    console.groupEnd();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  section('uid()');
  ok('retorna string não vazia', typeof uid() === 'string' && uid().length > 0);
  ok('gera IDs únicos', uid() !== uid());
  endSection();

  // ─── Programa / Modo ─────────────────────────────────────────────────────────

  section('getPrograma()');
  const progs = programas;
  if (progs.length > 0) {
    const p = progs[0];
    ok('encontra programa existente por id', getPrograma(p.id) === p);
    ok('retorna undefined para id inválido', getPrograma('__inexistente__') === undefined);
  } else {
    console.warn('Nenhum programa cadastrado — testes de getPrograma() ignorados');
  }
  endSection();

  // ─── Bug fix: progId livre em sincronizarPaineisModo() ───────────────────────

  section('BUG FIX — progId is not defined (sincronizarPaineisModo)');
  const progAntes = programaAtivoId;
  let erroDetectado = false;
  try {
    if (programas.length > 0) {
      setModo(programas[0].id);
    }
  } catch (e) {
    erroDetectado = true;
    console.error('Exceção capturada:', e);
  }
  ok('setModo() não lança ReferenceError (progId não é variável livre)', !erroDetectado);
  if (programas.length > 0) {
    ok('matTabAtual == programaAtivoId após setModo()', matTabAtual === programaAtivoId);
  }
  // Restaurar
  try { if (progAntes) setModo(progAntes); } catch (_) {}
  endSection();

  // ─── switchMatTab() ───────────────────────────────────────────────────────────

  section('switchMatTab()');
  let switchErro = false;
  try {
    if (programas.length > 0) switchMatTab(programas[0].id);
    switchMatTab('periodos');
    if (programas.length > 0) switchMatTab(programas[0].id);
  } catch (e) {
    switchErro = true;
    console.error('Exceção em switchMatTab():', e);
  }
  ok('switchMatTab() não lança exceção', !switchErro);
  if (programas.length > 0) {
    const p0 = programas[0];
    switchMatTab(p0.id);
    ok('switchMatTab(progId) sincroniza programaAtivoId via setModo()', programaAtivoId === p0.id);
  }
  switchMatTab('periodos');
  ok('switchMatTab("periodos") não altera programaAtivoId', programaAtivoId !== 'periodos');
  endSection();

  // ─── BUG FIX 2 — unificação do row de botões (prog-toggle oculto no materias) ──

  section('BUG FIX 2 — prog-toggle oculto no painel Matérias');
  const toggleEl = document.getElementById('prog-toggle');
  if (toggleEl) {
    goTo('materias', null);
    ok('prog-toggle oculto ao entrar em Matérias', toggleEl.style.display === 'none');
    goTo('dashboard', null);
    ok('prog-toggle visível ao sair de Matérias', toggleEl.style.display !== 'none');
  } else {
    console.warn('prog-toggle não encontrado — testes ignorados');
  }
  endSection();

  // ─── getMaterias() ────────────────────────────────────────────────────────────

  section('getMaterias()');
  ok('retorna array', Array.isArray(getMaterias(programaAtivoId)));
  ok('retorna array com id inexistente', Array.isArray(getMaterias('__fake__')));
  endSection();

  // ─── getProgCor / getProgLabel ────────────────────────────────────────────────

  section('getProgCor() / getProgLabel()');
  ok('getProgCor retorna string', typeof getProgCor(programaAtivoId) === 'string');
  ok('getProgLabel retorna string', typeof getProgLabel(programaAtivoId) === 'string');
  endSection();

  // ─── isPremium() ─────────────────────────────────────────────────────────────

  section('isPremium()');
  ok('retorna boolean', typeof isPremium() === 'boolean');
  endSection();

  // ─── SM-2 ─────────────────────────────────────────────────────────────────────

  section('sm2()');
  const cardFake = { intervalo: 1, eficiencia: 2.5, repeticoes: 0 };
  const resultadoFacil = sm2({ ...cardFake }, 5);
  const resultadoDificil = sm2({ ...cardFake }, 1);
  ok('sm2 retorna objeto com intervalo', resultadoFacil && typeof resultadoFacil.intervalo === 'number');
  ok('qualidade alta → intervalo >= 1', resultadoFacil.intervalo >= 1);
  ok('qualidade baixa → intervalo resetado para 1', resultadoDificil.intervalo === 1);
  endSection();

  // ─── getNivel() ──────────────────────────────────────────────────────────────

  section('getNivel()');
  ok('xp 0 → nível 1', getNivel(0) >= 1);
  ok('xp alto → nível maior', getNivel(10000) > getNivel(0));
  endSection();

  // ─── contarGeracao() ─────────────────────────────────────────────────────────

  section('contarGeracao()');
  ok('retorna boolean', typeof contarGeracao() === 'boolean');
  endSection();

  // ─── Sumário ─────────────────────────────────────────────────────────────────

  const total = passed + failed;
  const emoji = failed === 0 ? '🎉' : '⚠️';
  console.log(
    `%c\n${emoji} Resultado: ${passed}/${total} testes passando`,
    `color:${failed === 0 ? '#4caf50' : '#ff9800'};font-size:14px;font-weight:bold`
  );
  if (failed > 0) {
    console.warn(`${failed} teste(s) falhando — verifique as mensagens acima.`);
  }
})();
