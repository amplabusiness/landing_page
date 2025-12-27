-- =============================================
-- CONTTA LANDING PAGE - Captura de Leads
-- Adiciona ao Supabase SERPRO existente
-- =============================================

-- 1. TABELA DE LEADS (captura do formulário)
CREATE TABLE IF NOT EXISTS leads_reforma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Dados do formulário
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cnpj TEXT,
  tipo_usuario TEXT CHECK (tipo_usuario IN ('empresario', 'contador')),

  -- Dados da empresa (preenchidos via CNPJá)
  razao_social TEXT,
  nome_fantasia TEXT,
  cnae_principal TEXT,
  cnae_descricao TEXT,
  regime_tributario TEXT,
  porte TEXT,
  uf TEXT,
  municipio TEXT,

  -- Origem/Marketing
  origem TEXT DEFAULT 'landing_contta',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Status do funil
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'proposta', 'convertido', 'perdido')),

  -- Metadados
  ip_origem TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contatado_em TIMESTAMPTZ,
  convertido_em TIMESTAMPTZ
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_leads_reforma_email ON leads_reforma(email);
CREATE INDEX IF NOT EXISTS idx_leads_reforma_cnpj ON leads_reforma(cnpj);
CREATE INDEX IF NOT EXISTS idx_leads_reforma_status ON leads_reforma(status);
CREATE INDEX IF NOT EXISTS idx_leads_reforma_created ON leads_reforma(created_at DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_leads_reforma_updated ON leads_reforma;
CREATE TRIGGER trigger_leads_reforma_updated
  BEFORE UPDATE ON leads_reforma
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- 2. TABELA DE ANÁLISES (resultado do cálculo de impacto)
CREATE TABLE IF NOT EXISTS analises_reforma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads_reforma(id),
  cnpj TEXT NOT NULL,
  razao_social TEXT,

  -- Dados de entrada
  dados_entrada JSONB,

  -- Resultado
  resultado JSONB,
  impacto_percentual DECIMAL(10,4),
  classificacao TEXT CHECK (classificacao IN ('muito_favoravel', 'favoravel', 'neutro', 'desfavoravel', 'muito_desfavoravel')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analises_reforma_lead ON analises_reforma(lead_id);
CREATE INDEX IF NOT EXISTS idx_analises_reforma_cnpj ON analises_reforma(cnpj);

-- 3. CACHE DE CONSULTAS CNPJ (evita bater muito na API)
CREATE TABLE IF NOT EXISTS cache_cnpj (
  cnpj TEXT PRIMARY KEY,
  dados JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_cache_cnpj_expires ON cache_cnpj(expires_at);

-- =============================================
-- SEGURANÇA (RLS)
-- =============================================

ALTER TABLE leads_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_cnpj ENABLE ROW LEVEL SECURITY;

-- Landing page pode INSERIR leads (anônimo)
CREATE POLICY "Lead insert público" ON leads_reforma
  FOR INSERT WITH CHECK (true);

-- Apenas usuários autenticados podem VER leads
CREATE POLICY "Lead select autenticado" ON leads_reforma
  FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem ATUALIZAR leads
CREATE POLICY "Lead update autenticado" ON leads_reforma
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Análises: insert público, select autenticado
CREATE POLICY "Análise insert público" ON analises_reforma
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Análise select autenticado" ON analises_reforma
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cache: totalmente público (é só cache)
CREATE POLICY "Cache select público" ON cache_cnpj
  FOR SELECT USING (true);

CREATE POLICY "Cache insert público" ON cache_cnpj
  FOR INSERT WITH CHECK (true);

-- =============================================
-- VIEW PARA DASHBOARD
-- =============================================

CREATE OR REPLACE VIEW vw_leads_dashboard AS
SELECT
  l.*,
  a.impacto_percentual,
  a.classificacao,
  a.resultado
FROM leads_reforma l
LEFT JOIN LATERAL (
  SELECT * FROM analises_reforma
  WHERE lead_id = l.id
  ORDER BY created_at DESC
  LIMIT 1
) a ON true;

-- =============================================
-- PRONTO! 3 tabelas criadas no seu Supabase SERPRO
-- =============================================
