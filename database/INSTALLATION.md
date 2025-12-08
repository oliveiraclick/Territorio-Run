# Guia de Instalação do Banco de Dados - Sistema de Equipes

## 📋 Pré-requisitos

- Conta no Supabase
- Projeto Territory Run já criado
- Acesso ao SQL Editor do Supabase

---

## 🚀 Instalação Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **Territory Run**

### 2. Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**

### 3. Executar o Script

1. Abra o arquivo [`team_system_schema.sql`](file:///G:/Outros%20computadores/Meu%20laptop/Antigravity/Nova%20pasta%20%286%29/territory-run_-conquista/database/team_system_schema.sql)
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 4. Verificar Criação

Após executar, você deve ver:
```
Success. No rows returned
```

Para verificar se as tabelas foram criadas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'challenges');
```

Deve retornar:
```
teams
challenges
```

---

## 📊 Tabelas Criadas

### 1. `teams`
Armazena informações das equipes.

**Colunas:**
- `id` (UUID) - ID único
- `name` (TEXT) - Nome da equipe
- `slug` (TEXT) - Slug único para URL
- `owner_id` (TEXT) - ID do dono
- `owner_name` (TEXT) - Nome do dono
- `created_at` (TIMESTAMP) - Data de criação
- `member_count` (INTEGER) - Contador de membros

### 2. `challenges`
Armazena desafios criados pelas equipes.

**Colunas:**
- `id` (UUID) - ID único
- `name` (TEXT) - Nome do desafio
- `description` (TEXT) - Descrição
- `team_id` (UUID) - ID da equipe
- `territory_id` (TEXT) - ID do território
- `points` (INTEGER) - Pontos do desafio
- `start_date` (TIMESTAMP) - Data início
- `end_date` (TIMESTAMP) - Data fim
- `is_active` (BOOLEAN) - Status ativo
- `created_at` (TIMESTAMP) - Data de criação
- `created_by` (TEXT) - ID do criador

### 3. Atualizações em `profiles`
Novos campos adicionados:
- `team_id` (UUID) - ID da equipe
- `team_name` (TEXT) - Nome da equipe
- `role` (TEXT) - Papel (owner/member/individual)

### 4. Atualizações em `territories`
Novos campos adicionados:
- `challenge_id` (UUID) - ID do desafio
- `visibility` (TEXT) - Visibilidade (public/team)
- `team_id` (UUID) - ID da equipe
- `conquest_count` (INTEGER) - Contador de conquistas
- `previous_owner_id` (TEXT) - ID do dono anterior
- `previous_owner_name` (TEXT) - Nome do dono anterior
- `original_distance` (NUMERIC) - Distância original

---

## 🔧 Funções e Triggers

### `increment_team_members(team_id)`
Incrementa o contador de membros de uma equipe.

**Uso:**
```sql
SELECT increment_team_members('uuid-da-equipe');
```

### `deactivate_expired_challenges()`
Desativa desafios expirados.

**Uso:**
```sql
SELECT deactivate_expired_challenges();
```

---

## 🔒 Segurança (RLS)

As seguintes políticas foram criadas:

### Teams
- ✅ Todos podem visualizar equipes
- ✅ Apenas donos podem atualizar suas equipes
- ✅ Qualquer um pode criar equipes

### Challenges
- ✅ Apenas membros da equipe veem desafios
- ✅ Apenas donos podem criar desafios

---

## 📈 Views Criadas

### `team_stats`
Estatísticas agregadas por equipe.

**Uso:**
```sql
SELECT * FROM team_stats WHERE slug = 'nike-running-team';
```

**Retorna:**
- Total de territórios
- Total de pontos
- Total de desafios
- Desafios ativos

### `team_member_ranking`
Ranking de membros por equipe.

**Uso:**
```sql
SELECT * FROM team_member_ranking WHERE team_id = 'uuid-da-equipe';
```

**Retorna:**
- Nome do membro
- Territórios conquistados
- Total de estrelas
- Data de entrada

---

## ✅ Verificação Final

Execute este script para verificar se tudo está OK:

```sql
-- Verificar tabelas
SELECT COUNT(*) as teams_table FROM teams;
SELECT COUNT(*) as challenges_table FROM challenges;

-- Verificar colunas adicionadas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('team_id', 'team_name', 'role');

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'territories' 
AND column_name IN ('challenge_id', 'visibility', 'team_id');

-- Verificar funções
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('increment_team_members', 'deactivate_expired_challenges');

-- Verificar views
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('team_stats', 'team_member_ranking');
```

Se todos os comandos retornarem resultados, a instalação foi bem-sucedida! ✅

---

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Solução:** Algumas tabelas já existem. Execute apenas as partes necessárias do script.

### Erro: "permission denied"
**Solução:** Verifique se você tem permissões de administrador no projeto Supabase.

### Erro: "function already exists"
**Solução:** Use `CREATE OR REPLACE FUNCTION` (já está no script).

---

## 🔄 Rollback (Desfazer)

Se precisar remover tudo:

```sql
-- CUIDADO: Isso apaga todos os dados!
DROP VIEW IF EXISTS team_member_ranking;
DROP VIEW IF EXISTS team_stats;
DROP FUNCTION IF EXISTS deactivate_expired_challenges();
DROP FUNCTION IF EXISTS increment_team_members(UUID);
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

ALTER TABLE territories 
DROP COLUMN IF EXISTS challenge_id,
DROP COLUMN IF EXISTS visibility,
DROP COLUMN IF EXISTS team_id,
DROP COLUMN IF EXISTS conquest_count,
DROP COLUMN IF EXISTS previous_owner_id,
DROP COLUMN IF EXISTS previous_owner_name,
DROP COLUMN IF EXISTS original_distance;

ALTER TABLE profiles 
DROP COLUMN IF EXISTS team_id,
DROP COLUMN IF EXISTS team_name,
DROP COLUMN IF EXISTS role;
```

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Revise o script SQL
3. Consulte a documentação do Supabase

**Pronto! Banco de dados configurado! 🎉**
