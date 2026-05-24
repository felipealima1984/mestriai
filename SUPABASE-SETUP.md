# Mestriai — Guia de Configuração Supabase

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Escolha um nome (ex: `mestriai`) e uma senha forte para o banco
3. Selecione a região mais próxima: **South America (São Paulo)**
4. Aguarde o projeto inicializar (~2 min)

---

## 2. Executar o schema

1. No painel do projeto, clique em **SQL Editor** (menu lateral)
2. Clique em **New query**
3. Cole todo o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Você verá `Success. No rows returned` — está correto

---

## 3. Configurar autenticação por email

1. Vá em **Authentication → Providers**
2. Confirme que **Email** está habilitado (já vem ativo por padrão)
3. Em **Authentication → Email Templates**, você pode personalizar os e-mails se quiser
4. Em **Authentication → URL Configuration**, adicione a URL do seu GitHub Pages:
   ```
   https://felipealima1984.github.io
   ```
   Em **Site URL** e em **Redirect URLs**

---

## 4. Obter as credenciais de conexão

1. Vá em **Project Settings → API**
2. Copie os dois valores abaixo — você vai precisar deles no app:

```
Project URL:   https://XXXXXXXXXXX.supabase.co
Anon Key:      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> A **anon key** é pública — pode ficar no código do frontend sem problema.
> Nunca use a **service_role key** no frontend.

---

## 5. Configurar no app

Ao abrir o Mestriai, clique em **⚙ Configurar API** e preencha:

- **Supabase URL** → o Project URL copiado acima
- **Supabase Anon Key** → a Anon Key copiada acima
- **Anthropic Key** → sua chave `sk-ant-...`

Salve e faça login com seu email. Na primeira vez clique em **Criar conta**.

---

## 6. Verificar se funcionou

Após fazer login, abra **SQL Editor** no Supabase e rode:

```sql
select * from materias;
select * from stats;
```

Você deve ver seus dados aparecendo após usar o app.

---

## Estrutura das tabelas

| Tabela | O que guarda |
|--------|-------------|
| `materias` | Matérias CACD e Direito com tópicos por N1/N2/N3 |
| `historinhas` | Historinhas salvas manualmente |
| `materiais_salvos` | Conteúdo gerado de PDF/texto |
| `stats` | Contadores de uso (um registro por usuário) |
| `historico` | Últimas atividades |
| `preferencias` | Tema visual e chave Anthropic |

---

## Estratégia offline / sync

O app funciona em dois modos automaticamente:

- **Online + autenticado** → lê e grava no Supabase. Dados disponíveis em qualquer dispositivo.
- **Offline ou não autenticado** → usa localStorage como fallback. Ao reconectar, os dados locais são sincronizados para o Supabase.

---

## Limites do plano gratuito Supabase

| Recurso | Limite free tier |
|---------|-----------------|
| Banco de dados | 500 MB |
| Requisições/mês | Ilimitadas (fair use) |
| Usuários auth | Ilimitados |
| Projetos ativos | 2 |

Para uso pessoal, o free tier nunca vai ser atingido.
