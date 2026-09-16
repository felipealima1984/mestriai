---
name: vanilla-js-patterns
description: Ativar quando implementar qualquer funcionalidade JavaScript no Estuda.AI — renderizacao de listas, modais, eventos, estado global, template strings com onclick, ou qualquer codigo JS do index.html.
---

# Padroes Vanilla JS — Estuda.AI

## Regra mais importante do projeto
Todo onclick gerado em template string deve usar VALORES LITERAIS,
nunca variaveis do escopo externo.

## ERRADO vs CORRETO

```javascript
// ERRADO — progId e variavel livre, quebra em abas duplicadas
function render() {
  return items.map(i => `
    <button onclick="acao('${i.id}', progId)">  // progId pode ser undefined
  `).join('');
}

// CORRETO — capturar progId como valor literal antes do template
function render() {
  const progId = progAtivo || '';  // capturar no escopo da funcao
  return items.map(i => `
    <button onclick="acao('${i.id}', '${progId}')">  // valor literal string
  `).join('');
}
```

## Padrao de renderizacao de lista

```javascript
function renderLista(containerId, items, renderItem) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.length
    ? items.map(renderItem).join('')
    : '<p class="empty-state">Nenhum item encontrado.</p>';
}
```

## Padrao de estado global + persistencia

```javascript
// Estado em memoria
let items = JSON.parse(localStorage.getItem('estuda_items') || '[]');

// Salvar
function salvarItems() {
  localStorage.setItem('estuda_items', JSON.stringify(items));
}

// Modificar + persistir + re-renderizar (SEMPRE os 3 passos)
function adicionarItem(item) {
  items.push(item);
  salvarItems();
  if (sbUser) syncToSupabase();
  renderLista('container-items', items, renderItemCard);
  toast('Item adicionado!');
}
```

## Padrao de modal

```javascript
function abrirModal(id, dados) {
  const modal = document.getElementById(`modal-${id}`);
  if (dados) preencherModal(id, dados);
  modal.style.display = 'flex';
}

function fecharModal(id) {
  document.getElementById(`modal-${id}`).style.display = 'none';
  limparCamposModal(id);
}
```

## Padrao de chamada Claude API

```javascript
async function callClaude(prompt) {
  const apiKey = await getApiKey();  // da preferencias ou env
  if (!apiKey) { abrirSetup(); return null; }
  if (!contarGeracao()) return null;  // verifica limite free

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  return data.content?.[0]?.text || null;
}
```

## Nunca fazer

- Variaveis livres em template strings de onclick
- fetch direto sem verificar contarGeracao() antes
- Modificar arrays globais sem chamar salvar*() depois
- Renderizar sem limpar o container antes (innerHTML acumula)
