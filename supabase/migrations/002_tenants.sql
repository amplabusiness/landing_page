-- =============================================
-- CONTTA - Tabela de Tenants (Multi-tenant)
-- Execute APÓS o supabase_setup.sql
-- =============================================

-- TABELA DE TENANTS (Escritórios/Clientes do Contta)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificação
  cnpj TEXT UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  slug TEXT UNIQUE NOT NULL,              -- Ex: "ampla" (usado na URL)

  -- Tipo de cliente
  tipo TEXT NOT NULL CHECK (tipo IN ('escritorio', 'empresario')),

  -- Dados do responsável
  responsavel_nome TEXT,
  responsavel_email TEXT,
  responsavel_whatsapp TEXT,

  -- Plano e limites
  plano TEXT DEFAULT 'free' CHECK (plano IN ('free', 'profissional', 'escritorio', 'enterprise')),
  limite_empresas INTEGER DEFAULT 5,
  limite_usuarios INTEGER DEFAULT 1,

  -- Configurações visuais
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#10b981',

  -- Status
  ativo BOOLEAN DEFAULT true,
  trial_ate TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX IF NOT EXISTS idx_tenants_plano ON tenants(plano);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tenants_updated ON tenants;
CREATE TRIGGER trigger_tenants_updated
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at();

-- RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants visíveis para usuários autenticados
CREATE POLICY "Tenants select autenticado" ON tenants
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- INSERIR AMPLA CONTABILIDADE COMO PRIMEIRO TENANT
-- =============================================

INSERT INTO tenants (
  cnpj,
  razao_social,
  nome_fantasia,
  slug,
  tipo,
  responsavel_nome,
  responsavel_email,
  plano,
  limite_empresas,
  limite_usuarios
) VALUES (
  '03832285000115',
  'AMPLA CONTABILIDADE LTDA',
  'AMPLA Contabilidade',
  'ampla',
  'escritorio',
  'Sérgio Carneiro Leão',
  'sergio@amplabusiness.com.br',
  'enterprise',
  999,
  50
) ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- ADICIONAR COLUNA tenant_id NA TABELA DE LEADS
-- (para vincular leads a tenants no futuro)
-- =============================================

ALTER TABLE leads_reforma
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

CREATE INDEX IF NOT EXISTS idx_leads_reforma_tenant ON leads_reforma(tenant_id);

-- =============================================
-- VIEW: Estatísticas por tenant
-- =============================================

CREATE OR REPLACE VIEW vw_tenant_stats AS
SELECT
  t.id,
  t.razao_social,
  t.nome_fantasia,
  t.plano,
  t.limite_empresas,
  COUNT(DISTINCT l.id) as total_leads
FROM tenants t
LEFT JOIN leads_reforma l ON l.tenant_id = t.id
GROUP BY t.id, t.razao_social, t.nome_fantasia, t.plano, t.limite_empresas;

-- =============================================
-- PRONTO! AMPLA cadastrada como primeiro tenant
-- =============================================
