---
name: supabase-patterns
description: Ativar quando trabalhar com Supabase no Estuda.AI — queries, upserts, RLS, auth, sync, migrations ou Edge Functions.
---

# Padroes Supabase — Estuda.AI

## Cliente Supabase
Inicializado em initSupabase() e disponivel globalmente como `sb`.
Usuario logado disponivel como `sbUser`.

## Padrao de query segura

```javascript
// Sempre verificar sbUser antes de qualquer query
async function buscarMateriais() {
  if (!sbUser) return [];  // fallback para localStorage

  const { data, error } = await sb
    .from('materiais_salvos')
    .select('*')
    .eq('user_id', sbUser.id)
    .order('criado_em', { ascending: false });

  if (error) { console.error(error); return []; }
  return data || [];
}
```

## Padrao de upsert (insert ou update)

```javascript
// upsert com onConflict para evitar duplicatas
await sb.from('materias').upsert({
  id: m.id,
  user_id: sbUser.id,
  nome: m.nome,
  frente: m.frente,
  topicos_n1: m.topicos_n1 || [],
  topicos_n2: m.topicos_n2 || [],
  topicos_n3: m.topicos_n3 || []
}, { onConflict: 'id' });
```

## Tabelas e campos obrigatorios

| Tabela | PK | FK obrigatoria |
|---|---|---|
| materias | id (text) | user_id |
| historinhas | id (uuid) | user_id |
| materiais_salvos | id (uuid) | user_id |
| stats | user_id (pk) | user_id |
| historico | id (uuid) | user_id |
| preferencias | user_id (pk) | user_id |

## RLS — nunca contornar
Todas as tabelas tem RLS com policy `auth.uid() = user_id`.
O Supabase rejeita automaticamente qualquer acesso a dados de outro usuario.

## Ao adicionar campo novo em tabela existente

```sql
-- Migration incremental — nunca recriar a tabela
alter table materias add column if not exists novo_campo text;

-- Atualizar trigger se necessario
-- Atualizar indice se o campo for usado em queries de filtro
```
