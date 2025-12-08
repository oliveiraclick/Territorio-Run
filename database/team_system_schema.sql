-- ============================================
-- TERRITORY RUN - TEAM SYSTEM DATABASE SCHEMA
-- ============================================

-- 1. Criar tabela de equipes
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  member_count INTEGER DEFAULT 1
);

-- Índices para performance
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_owner ON teams(owner_id);

-- ============================================

-- 2. Criar tabela de desafios
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  territory_id TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Índices para performance
CREATE INDEX idx_challenges_team ON challenges(team_id);
CREATE INDEX idx_challenges_active ON challenges(is_active);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);

-- ============================================

-- 3. Atualizar tabela profiles (usuários)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS team_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'individual';

-- Índice para buscar membros de uma equipe
CREATE INDEX IF NOT EXISTS idx_profiles_team ON profiles(team_id);

-- ============================================

-- 4. Atualizar tabela territories
ALTER TABLE territories
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS conquest_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS previous_owner_id TEXT,
ADD COLUMN IF NOT EXISTS previous_owner_name TEXT,
ADD COLUMN IF NOT EXISTS original_distance NUMERIC;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_territories_visibility ON territories(visibility);
CREATE INDEX IF NOT EXISTS idx_territories_team ON territories(team_id);
CREATE INDEX IF NOT EXISTS idx_territories_challenge ON territories(challenge_id);

-- ============================================

-- 5. Função para incrementar contador de membros
CREATE OR REPLACE FUNCTION increment_team_members(team_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE teams 
  SET member_count = member_count + 1 
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================

-- 6. Trigger para desativar desafios expirados automaticamente
CREATE OR REPLACE FUNCTION deactivate_expired_challenges()
RETURNS void AS $$
BEGIN
  UPDATE challenges 
  SET is_active = false 
  WHERE is_active = true 
  AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Criar job para executar diariamente (opcional - requer pg_cron)
-- SELECT cron.schedule('deactivate-expired-challenges', '0 0 * * *', 'SELECT deactivate_expired_challenges()');

-- ============================================

-- 7. Políticas de segurança (RLS - Row Level Security)

-- Habilitar RLS nas tabelas
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler equipes
CREATE POLICY "Teams are viewable by everyone" 
ON teams FOR SELECT 
USING (true);

-- Política: Apenas o dono pode atualizar a equipe
CREATE POLICY "Team owners can update their team" 
ON teams FOR UPDATE 
USING (owner_id = current_user);

-- Política: Todos podem criar equipes
CREATE POLICY "Anyone can create a team" 
ON teams FOR INSERT 
WITH CHECK (true);

-- Política: Membros da equipe podem ver desafios
CREATE POLICY "Team members can view challenges" 
ON challenges FOR SELECT 
USING (
  team_id IN (
    SELECT team_id FROM profiles WHERE id = current_user
  )
);

-- Política: Apenas donos podem criar desafios
CREATE POLICY "Team owners can create challenges" 
ON challenges FOR INSERT 
WITH CHECK (
  created_by = current_user AND
  team_id IN (
    SELECT team_id FROM profiles 
    WHERE id = current_user AND role = 'owner'
  )
);

-- ============================================

-- 8. Views úteis

-- View: Estatísticas de equipes
CREATE OR REPLACE VIEW team_stats AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.member_count,
  COUNT(DISTINCT ter.id) as total_territories,
  SUM(ter.value) as total_points,
  COUNT(DISTINCT c.id) as total_challenges,
  COUNT(DISTINCT CASE WHEN c.is_active THEN c.id END) as active_challenges
FROM teams t
LEFT JOIN profiles p ON p.team_id = t.id
LEFT JOIN territories ter ON ter.owner_id = p.id
LEFT JOIN challenges c ON c.team_id = t.id
GROUP BY t.id, t.name, t.slug, t.member_count;

-- View: Ranking de membros por equipe
CREATE OR REPLACE VIEW team_member_ranking AS
SELECT 
  p.id as user_id,
  p.name as user_name,
  p.team_id,
  p.team_name,
  COUNT(DISTINCT t.id) as territories_count,
  SUM(t.value) as total_stars,
  p.joined_at
FROM profiles p
LEFT JOIN territories t ON t.owner_id = p.id
WHERE p.team_id IS NOT NULL
GROUP BY p.id, p.name, p.team_id, p.team_name, p.joined_at
ORDER BY p.team_id, total_stars DESC;

-- ============================================

-- 9. Dados de exemplo (opcional - para testes)
/*
-- Criar equipe de exemplo
INSERT INTO teams (name, slug, owner_id, owner_name, member_count)
VALUES ('Nike Running Team', 'nike-running-team', 'user_123', 'João Silva', 1);

-- Criar desafio de exemplo
INSERT INTO challenges (name, description, team_id, territory_id, points, start_date, end_date, created_by)
VALUES (
  'Corrida do Parque',
  'Desafio semanal no parque central',
  (SELECT id FROM teams WHERE slug = 'nike-running-team'),
  'territory_456',
  100,
  NOW(),
  NOW() + INTERVAL '7 days',
  'user_123'
);
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para executar este script no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script
-- 4. Clique em "Run"
