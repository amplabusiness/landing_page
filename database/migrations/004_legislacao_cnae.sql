-- =====================================================
-- LEGISLACAO POR CNAE E PRODUTOS
-- Vincula regras da reforma tributaria a CNAEs e NCMs
-- =====================================================

-- Tabela de CNAEs com regras especificas
CREATE TABLE IF NOT EXISTS cnae_reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_cnae VARCHAR(10) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,

  -- Classificacao na reforma
  setor_economico TEXT, -- Comercio, Industria, Servicos, etc
  subsetor TEXT,

  -- Aliquotas especificas
  reducao_aliquota DECIMAL(5,2) DEFAULT 0, -- % de reducao (0, 30, 60, 100)
  tipo_reducao TEXT CHECK (tipo_reducao IN (
    'padrao',           -- 26.5% (sem reducao)
    'reducao_30',       -- 30% de reducao
    'reducao_60',       -- 60% de reducao (saude, educacao, etc)
    'aliquota_zero',    -- Cesta basica, etc
    'imune',            -- Imunidades constitucionais
    'regime_especifico' -- Combustiveis, financeiro, etc
  )) DEFAULT 'padrao',

  -- Regime especifico
  regime_especifico TEXT, -- null ou nome do regime
  detalhes_regime JSONB, -- Regras especificas do regime

  -- Obrigacoes
  obrigacoes_acessorias TEXT[], -- Lista de obrigacoes
  split_payment BOOLEAN DEFAULT true, -- Sujeito a split payment

  -- Legislacao aplicavel
  legislacao_refs TEXT[], -- Referencias a artigos da LC 214

  -- Metadados
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de NCMs (produtos) com regras
CREATE TABLE IF NOT EXISTS ncm_reforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_ncm VARCHAR(10) NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  unidade_medida VARCHAR(10),

  -- Classificacao
  categoria TEXT, -- Alimentos, Bebidas, Eletronicos, etc
  subcategoria TEXT,

  -- Aliquotas
  tipo_tributacao TEXT CHECK (tipo_tributacao IN (
    'padrao',
    'cesta_basica',      -- Aliquota zero
    'reducao_60',        -- 60% reducao
    'imposto_seletivo',  -- Sujeito a IS
    'monofasico',        -- Tributacao concentrada
    'substituicao'       -- ST
  )) DEFAULT 'padrao',

  aliquota_is DECIMAL(5,2) DEFAULT 0, -- Imposto Seletivo %
  is_cesta_basica BOOLEAN DEFAULT false,
  is_bebida_alcoolica BOOLEAN DEFAULT false,
  is_tabaco BOOLEAN DEFAULT false,
  is_acucarado BOOLEAN DEFAULT false,

  -- Legislacao
  artigo_lc214 TEXT, -- Artigo especifico
  anexo_lc214 TEXT,  -- Anexo da lei

  -- Metadados
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de empresas cadastradas para analise
CREATE TABLE IF NOT EXISTS empresas_analise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),

  -- Dados basicos
  cnpj VARCHAR(18) NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,

  -- CNAE
  cnae_principal VARCHAR(10) REFERENCES cnae_reforma(codigo_cnae),
  cnaes_secundarios TEXT[],

  -- Regime tributario atual
  regime_atual TEXT CHECK (regime_atual IN (
    'simples_nacional',
    'lucro_presumido',
    'lucro_real',
    'mei'
  )),
  faturamento_anual DECIMAL(15,2),
  faturamento_mensal_medio DECIMAL(15,2),

  -- Localizacao
  uf VARCHAR(2),
  municipio TEXT,

  -- Contato
  email TEXT,
  whatsapp VARCHAR(20),

  -- Status
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(tenant_id, cnpj)
);

-- Produtos da empresa (importados de NF-e)
CREATE TABLE IF NOT EXISTS produtos_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Identificacao
  codigo_interno VARCHAR(60),
  descricao TEXT NOT NULL,
  ncm VARCHAR(10) REFERENCES ncm_reforma(codigo_ncm),

  -- Valores medios
  valor_unitario_medio DECIMAL(15,4),
  quantidade_mensal_media DECIMAL(15,4),
  faturamento_mensal DECIMAL(15,2),

  -- Tributacao atual
  icms_atual DECIMAL(5,2),
  pis_atual DECIMAL(5,2),
  cofins_atual DECIMAL(5,2),
  ipi_atual DECIMAL(5,2),

  -- Tributacao nova (calculada)
  cbs_calculado DECIMAL(5,2),
  ibs_calculado DECIMAL(5,2),
  is_calculado DECIMAL(5,2),

  -- Impacto
  variacao_carga DECIMAL(10,2), -- + ou - em R$
  variacao_percentual DECIMAL(5,2), -- + ou - %

  -- Origem dos dados
  fonte TEXT DEFAULT 'manual', -- manual, xml_nfe, planilha
  ultima_nfe_data DATE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notas fiscais importadas
CREATE TABLE IF NOT EXISTS nfe_importadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Identificacao NF-e
  chave_acesso VARCHAR(44) UNIQUE NOT NULL,
  numero_nf INTEGER,
  serie INTEGER,
  data_emissao DATE,
  natureza_operacao TEXT,

  -- Valores totais
  valor_total DECIMAL(15,2),
  valor_produtos DECIMAL(15,2),
  valor_icms DECIMAL(15,2),
  valor_pis DECIMAL(15,2),
  valor_cofins DECIMAL(15,2),
  valor_ipi DECIMAL(15,2),

  -- Itens (JSONB para flexibilidade)
  itens JSONB,

  -- Status
  processado BOOLEAN DEFAULT false,
  erro_processamento TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relatorios de impacto gerados
CREATE TABLE IF NOT EXISTS relatorios_impacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Periodo analisado
  periodo_inicio DATE,
  periodo_fim DATE,

  -- Resumo tributacao atual
  tributos_atuais JSONB, -- {icms, pis, cofins, ipi, iss, total}
  carga_atual_percentual DECIMAL(5,2),

  -- Projecao novo sistema
  tributos_novos JSONB, -- {cbs, ibs, is, total}
  carga_nova_percentual DECIMAL(5,2),

  -- Impacto
  variacao_absoluta DECIMAL(15,2),
  variacao_percentual DECIMAL(5,2),
  classificacao TEXT CHECK (classificacao IN (
    'muito_favoravel',  -- reducao > 10%
    'favoravel',        -- reducao 1-10%
    'neutro',           -- -1% a +1%
    'desfavoravel',     -- aumento 1-10%
    'muito_desfavoravel' -- aumento > 10%
  )),

  -- Detalhamento por produto
  detalhamento_produtos JSONB,

  -- Recomendacoes da IA
  recomendacoes TEXT[],
  pontos_atencao TEXT[],

  -- PDF gerado
  pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_cnae_tipo ON cnae_reforma(tipo_reducao);
CREATE INDEX IF NOT EXISTS idx_ncm_tipo ON ncm_reforma(tipo_tributacao);
CREATE INDEX IF NOT EXISTS idx_empresas_tenant ON empresas_analise(tenant_id);
CREATE INDEX IF NOT EXISTS idx_empresas_cnae ON empresas_analise(cnae_principal);
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ncm ON produtos_empresa(ncm);
CREATE INDEX IF NOT EXISTS idx_nfe_empresa ON nfe_importadas(empresa_id);

-- RLS
ALTER TABLE cnae_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncm_reforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_analise ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_importadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_impacto ENABLE ROW LEVEL SECURITY;

-- Tabelas de referencia sao publicas para leitura
CREATE POLICY "CNAE publico leitura" ON cnae_reforma FOR SELECT USING (true);
CREATE POLICY "NCM publico leitura" ON ncm_reforma FOR SELECT USING (true);

-- Dados do tenant
CREATE POLICY "Empresas do tenant" ON empresas_analise
  FOR ALL USING (tenant_id IN (
    SELECT id FROM tenants WHERE id = auth.uid()::uuid
    OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Produtos da empresa do tenant" ON produtos_empresa
  FOR ALL USING (empresa_id IN (
    SELECT id FROM empresas_analise WHERE tenant_id IN (
      SELECT id FROM tenants WHERE id = auth.uid()::uuid
      OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
  ));

-- Service role acesso total
CREATE POLICY "Service CNAE" ON cnae_reforma FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service NCM" ON ncm_reforma FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Empresas" ON empresas_analise FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Produtos" ON produtos_empresa FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service NFe" ON nfe_importadas FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service Relatorios" ON relatorios_impacto FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- DADOS INICIAIS - CNAEs com reducao
-- =====================================================

-- Insercao de CNAEs com tratamento especifico
INSERT INTO cnae_reforma (codigo_cnae, descricao, setor_economico, tipo_reducao, reducao_aliquota, legislacao_refs) VALUES
-- Saude (60% reducao)
('8610-1/01', 'Atividades de atendimento hospitalar', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),
('8630-5/01', 'Atividade medica ambulatorial com recursos para realizacao de procedimentos cirurgicos', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),
('8630-5/02', 'Atividade medica ambulatorial com recursos para realizacao de exames complementares', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),
('8630-5/03', 'Atividade medica ambulatorial restrita a consultas', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),
('8640-2/01', 'Laboratorios de anatomia patologica e citologica', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),
('8640-2/02', 'Laboratorios clinicos', 'Saude', 'reducao_60', 60, ARRAY['Art. 7º, I']),

-- Educacao (60% reducao)
('8511-2/00', 'Educacao infantil - creche', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),
('8512-1/00', 'Educacao infantil - pre-escola', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),
('8513-9/00', 'Ensino fundamental', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),
('8520-1/00', 'Ensino medio', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),
('8531-7/00', 'Educacao superior - graduacao', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),
('8532-5/00', 'Educacao superior - graduacao e pos-graduacao', 'Educacao', 'reducao_60', 60, ARRAY['Art. 7º, II']),

-- Transporte coletivo (60% reducao)
('4921-3/01', 'Transporte rodoviario coletivo de passageiros, com itinerario fixo, municipal', 'Transporte', 'reducao_60', 60, ARRAY['Art. 7º, III']),
('4922-1/01', 'Transporte rodoviario coletivo de passageiros, com itinerario fixo, intermunicipal em regiao metropolitana', 'Transporte', 'reducao_60', 60, ARRAY['Art. 7º, III']),

-- Agropecuaria (30% reducao)
('0111-3/01', 'Cultivo de arroz', 'Agropecuaria', 'reducao_30', 30, ARRAY['Art. 8º']),
('0111-3/02', 'Cultivo de milho', 'Agropecuaria', 'reducao_30', 30, ARRAY['Art. 8º']),
('0115-6/00', 'Cultivo de soja', 'Agropecuaria', 'reducao_30', 30, ARRAY['Art. 8º']),
('0151-2/01', 'Criacao de bovinos para corte', 'Agropecuaria', 'reducao_30', 30, ARRAY['Art. 8º']),
('0151-2/02', 'Criacao de bovinos para leite', 'Agropecuaria', 'reducao_30', 30, ARRAY['Art. 8º']),

-- Comercio (padrao)
('4711-3/01', 'Comercio varejista de mercadorias em geral, com predominancia de produtos alimenticios - hipermercados', 'Comercio', 'padrao', 0, NULL),
('4711-3/02', 'Comercio varejista de mercadorias em geral, com predominancia de produtos alimenticios - supermercados', 'Comercio', 'padrao', 0, NULL),

-- Industria (padrao)
('1011-2/01', 'Frigorifico - abate de bovinos', 'Industria', 'padrao', 0, NULL),
('1012-1/01', 'Abate de aves', 'Industria', 'padrao', 0, NULL)

ON CONFLICT (codigo_cnae) DO NOTHING;

-- =====================================================
-- DADOS INICIAIS - NCMs Cesta Basica
-- =====================================================

INSERT INTO ncm_reforma (codigo_ncm, descricao, categoria, tipo_tributacao, is_cesta_basica, artigo_lc214) VALUES
-- Cesta basica nacional (aliquota zero)
('0207.14.00', 'Pedacos e miudezas de galos e galinhas, congelados', 'Carnes', 'cesta_basica', true, 'Anexo I'),
('0210.12.00', 'Barrigas e seus pedacos de suino, salgados ou em salmoura', 'Carnes', 'cesta_basica', true, 'Anexo I'),
('0401.10.10', 'Leite UHT', 'Laticinios', 'cesta_basica', true, 'Anexo I'),
('0401.20.10', 'Leite pasteurizado', 'Laticinios', 'cesta_basica', true, 'Anexo I'),
('0402.10.10', 'Leite em po integral', 'Laticinios', 'cesta_basica', true, 'Anexo I'),
('0405.10.00', 'Manteiga', 'Laticinios', 'cesta_basica', true, 'Anexo I'),
('0406.10.10', 'Queijo mussarela', 'Laticinios', 'cesta_basica', true, 'Anexo I'),
('0407.21.00', 'Ovos frescos de galinha', 'Ovos', 'cesta_basica', true, 'Anexo I'),
('0703.10.19', 'Cebolas frescas', 'Hortifruti', 'cesta_basica', true, 'Anexo I'),
('0703.20.10', 'Alho fresco', 'Hortifruti', 'cesta_basica', true, 'Anexo I'),
('0709.60.00', 'Pimentoes', 'Hortifruti', 'cesta_basica', true, 'Anexo I'),
('0712.20.00', 'Cebolas secas', 'Hortifruti', 'cesta_basica', true, 'Anexo I'),
('1006.30.21', 'Arroz beneficiado', 'Cereais', 'cesta_basica', true, 'Anexo I'),
('1101.00.10', 'Farinha de trigo', 'Cereais', 'cesta_basica', true, 'Anexo I'),
('1507.90.11', 'Oleo de soja refinado', 'Oleos', 'cesta_basica', true, 'Anexo I'),
('1701.99.00', 'Acucar cristal', 'Acucar', 'cesta_basica', true, 'Anexo I'),
('1902.11.00', 'Massas alimenticias nao cozidas', 'Massas', 'cesta_basica', true, 'Anexo I'),
('1905.10.00', 'Pao de forma', 'Panificacao', 'cesta_basica', true, 'Anexo I'),
('1905.90.90', 'Pao frances', 'Panificacao', 'cesta_basica', true, 'Anexo I'),
('2009.12.00', 'Suco de laranja congelado', 'Bebidas', 'cesta_basica', true, 'Anexo I'),

-- Imposto Seletivo
('2203.00.00', 'Cerveja de malte', 'Bebidas Alcoolicas', 'imposto_seletivo', false, 'Art. 393'),
('2204.21.00', 'Vinho em recipientes ate 2 litros', 'Bebidas Alcoolicas', 'imposto_seletivo', false, 'Art. 393'),
('2208.20.00', 'Aguardente de vinho ou de bagaco de uvas', 'Bebidas Alcoolicas', 'imposto_seletivo', false, 'Art. 393'),
('2208.40.00', 'Rum e outras aguardentes de cana', 'Bebidas Alcoolicas', 'imposto_seletivo', false, 'Art. 393'),
('2402.20.00', 'Cigarros contendo tabaco', 'Tabaco', 'imposto_seletivo', false, 'Art. 393'),
('2710.12.59', 'Gasolina', 'Combustiveis', 'imposto_seletivo', false, 'Art. 393'),
('2711.21.00', 'Gas natural', 'Combustiveis', 'imposto_seletivo', false, 'Art. 393'),

-- Bebidas acucaradas (IS)
('2202.10.00', 'Aguas minerais com adicao de acucar', 'Bebidas Acucaradas', 'imposto_seletivo', false, 'Art. 393'),
('2202.99.00', 'Outras bebidas nao alcoolicas com acucar', 'Bebidas Acucaradas', 'imposto_seletivo', false, 'Art. 393')

ON CONFLICT (codigo_ncm) DO NOTHING;

-- Update dos flags
UPDATE ncm_reforma SET is_bebida_alcoolica = true WHERE categoria = 'Bebidas Alcoolicas';
UPDATE ncm_reforma SET is_tabaco = true WHERE categoria = 'Tabaco';
UPDATE ncm_reforma SET is_acucarado = true WHERE categoria = 'Bebidas Acucaradas';

-- Comentarios
COMMENT ON TABLE cnae_reforma IS 'CNAEs com classificacao na Reforma Tributaria (LC 214/2025)';
COMMENT ON TABLE ncm_reforma IS 'NCMs com classificacao na Reforma Tributaria (cesta basica, IS, etc)';
COMMENT ON TABLE empresas_analise IS 'Empresas cadastradas para analise de impacto';
COMMENT ON TABLE produtos_empresa IS 'Produtos da empresa extraidos de NF-e ou cadastrados';
COMMENT ON TABLE nfe_importadas IS 'Notas fiscais importadas para analise';
COMMENT ON TABLE relatorios_impacto IS 'Relatorios de impacto da reforma gerados';
