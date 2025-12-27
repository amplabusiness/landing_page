-- =====================================================
-- NOTICIAS DA REFORMA TRIBUTARIA
-- Sistema de atualizacoes diarias automaticas
-- =====================================================

-- Tabela principal de noticias
CREATE TABLE IF NOT EXISTS noticias_reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados originais da fonte
  titulo_original TEXT NOT NULL,
  resumo_original TEXT,
  url_fonte TEXT NOT NULL UNIQUE,
  fonte TEXT NOT NULL, -- ex: "Ministério da Fazenda", "Receita Federal", "Valor Econômico"
  data_publicacao TIMESTAMPTZ,

  -- Interpretacao da IA
  titulo_simplificado TEXT NOT NULL,
  explicacao_simples TEXT NOT NULL, -- Explicacao em linguagem clara
  impacto_empresas TEXT, -- Como afeta as empresas
  exemplos_praticos TEXT, -- Exemplos concretos
  pontos_atencao TEXT[], -- Lista de pontos importantes

  -- Categorizacao
  categoria TEXT CHECK (categoria IN (
    'legislacao',      -- Nova lei, decreto, IN
    'regulamentacao',  -- Detalhes de implementacao
    'cronograma',      -- Datas e prazos
    'aliquotas',       -- Mudancas em aliquotas
    'setorial',        -- Impacto por setor
    'tecnologia',      -- Sistemas, NF-e, etc
    'orientacao',      -- Guias e manuais
    'opiniao'          -- Analises e artigos
  )),

  -- Tags para filtro
  tags TEXT[] DEFAULT '{}',

  -- Relevancia e destaque
  relevancia INTEGER DEFAULT 5 CHECK (relevancia BETWEEN 1 AND 10),
  destaque BOOLEAN DEFAULT false,

  -- Metadados
  processado_por TEXT DEFAULT 'gemini', -- gemini, claude, gpt
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  publicado BOOLEAN DEFAULT true
);

-- Indice para busca por data
CREATE INDEX IF NOT EXISTS idx_noticias_data ON noticias_reforma(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias_reforma(categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_destaque ON noticias_reforma(destaque) WHERE destaque = true;

-- Tabela de fontes monitoradas
CREATE TABLE IF NOT EXISTS fontes_monitoradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  url_base TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('governo', 'imprensa', 'especializada', 'oficial')),
  query_serper TEXT, -- Query para buscar no Serper
  ativo BOOLEAN DEFAULT true,
  ultima_verificacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir fontes principais
INSERT INTO fontes_monitoradas (nome, url_base, tipo, query_serper) VALUES
  ('Ministério da Fazenda', 'gov.br/fazenda', 'governo', 'site:gov.br/fazenda reforma tributária'),
  ('Receita Federal', 'gov.br/receitafederal', 'governo', 'site:gov.br/receitafederal IBS CBS'),
  ('Comitê Gestor IBS', 'gov.br', 'oficial', 'Comitê Gestor IBS reforma tributária'),
  ('Planalto Legislação', 'planalto.gov.br', 'oficial', 'site:planalto.gov.br lei complementar 214'),
  ('Valor Econômico', 'valor.globo.com', 'imprensa', 'site:valor.globo.com reforma tributária IBS CBS'),
  ('Jota', 'jota.info', 'especializada', 'site:jota.info reforma tributária'),
  ('Consultor Jurídico', 'conjur.com.br', 'especializada', 'site:conjur.com.br reforma tributária 2025')
ON CONFLICT DO NOTHING;

-- Tabela de execucoes do CRON
CREATE TABLE IF NOT EXISTS cron_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'busca_noticias', 'interpretacao', etc
  status TEXT CHECK (status IN ('sucesso', 'erro', 'parcial')),
  noticias_encontradas INTEGER DEFAULT 0,
  noticias_processadas INTEGER DEFAULT 0,
  erro_mensagem TEXT,
  duracao_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE noticias_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE fontes_monitoradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_execucoes ENABLE ROW LEVEL SECURITY;

-- Todos podem ler noticias publicadas
CREATE POLICY "Noticias publicas para todos" ON noticias_reforma
  FOR SELECT USING (publicado = true);

-- Service role pode tudo
CREATE POLICY "Service role full access noticias" ON noticias_reforma
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access fontes" ON fontes_monitoradas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access cron" ON cron_execucoes
  FOR ALL USING (auth.role() = 'service_role');

-- Funcao para atualizar updated_at
CREATE OR REPLACE FUNCTION update_noticias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_noticias_updated_at
  BEFORE UPDATE ON noticias_reforma
  FOR EACH ROW
  EXECUTE FUNCTION update_noticias_updated_at();

-- Comentarios
COMMENT ON TABLE noticias_reforma IS 'Noticias da Reforma Tributaria processadas por IA';
COMMENT ON TABLE fontes_monitoradas IS 'Fontes de noticias monitoradas pelo sistema';
COMMENT ON TABLE cron_execucoes IS 'Log de execucoes do job de busca de noticias';
