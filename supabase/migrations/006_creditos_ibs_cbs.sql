-- =====================================================
-- SISTEMA DE CREDITOS IBS/CBS
-- Controle completo de créditos para trás e para frente
-- Baseado na LC 214/2025, Arts. 47-53
-- =====================================================

-- Categorias de despesas que geram crédito
CREATE TABLE IF NOT EXISTS categorias_credito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,

  -- Regras de crédito
  gera_credito BOOLEAN DEFAULT true,
  percentual_credito DECIMAL(5,2) DEFAULT 100, -- % do crédito aproveitável
  aliquota_aplicavel TEXT, -- 'padrao', 'reduzida_60', 'reduzida_30', 'zero'

  -- Condições especiais
  requer_documento_fiscal BOOLEAN DEFAULT true,
  requer_pagamento BOOLEAN DEFAULT true, -- Art. 47: crédito vinculado à extinção do débito
  condicoes_especiais TEXT, -- Ex: "acordo coletivo de trabalho"

  -- Legislação
  artigo_lc214 TEXT,
  observacoes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir categorias de despesa
INSERT INTO categorias_credito (codigo, nome, descricao, gera_credito, percentual_credito, aliquota_aplicavel, condicoes_especiais, artigo_lc214) VALUES
-- Despesas operacionais com crédito integral
('ALUGUEL', 'Aluguel de imóveis', 'Aluguel de escritório, galpão, loja', true, 100, 'padrao', NULL, 'Art. 47'),
('ENERGIA', 'Energia elétrica', 'Conta de luz do estabelecimento', true, 100, 'padrao', NULL, 'Art. 47'),
('TELECOM', 'Internet e telefonia', 'Serviços de telecomunicações', true, 100, 'padrao', NULL, 'Art. 47'),
('MATERIAL', 'Material de escritório', 'Papelaria, suprimentos', true, 100, 'padrao', NULL, 'Art. 47'),
('SOFTWARE', 'Software e licenças', 'Sistemas, ERPs, licenças', true, 100, 'padrao', NULL, 'Art. 47'),
('MANUTENCAO', 'Manutenção', 'Manutenção de equipamentos e instalações', true, 100, 'padrao', NULL, 'Art. 47'),
('LIMPEZA', 'Limpeza e conservação', 'Serviços de limpeza', true, 100, 'padrao', NULL, 'Art. 47'),
('MARKETING', 'Marketing e comunicação', 'Publicidade, propaganda, marketing digital', true, 100, 'padrao', NULL, 'Art. 47'),
('CAPACITACAO', 'Capacitação e treinamentos', 'Cursos, treinamentos de funcionários', true, 100, 'padrao', NULL, 'Art. 47'),
('TERCEIRIZADOS', 'Serviços terceirizados', 'Serviços de terceiros PJ', true, 100, 'padrao', NULL, 'Art. 47'),
('CONSULTORIA', 'Consultoria', 'Consultorias técnicas e especializadas', true, 100, 'padrao', NULL, 'Art. 47'),

-- Despesas com condições especiais
('VT', 'Vale transporte', 'Vale transporte para funcionários', true, 100, 'padrao', 'Apenas se previsto em acordo ou convenção coletiva de trabalho', 'Art. 47, §3º'),
('VR', 'Vale refeição', 'Vale refeição/alimentação para funcionários', true, 100, 'padrao', 'Apenas se previsto em acordo ou convenção coletiva de trabalho', 'Art. 47, §3º'),

-- Despesas com alíquota reduzida
('PLANO_SAUDE', 'Plano de saúde', 'Plano de saúde empresarial', true, 100, 'reduzida_60', 'Alíquota reduzida em 60%', 'Art. 7º, I'),

-- Despesas SEM crédito
('FOLHA', 'Folha de pagamento', 'Salários e encargos trabalhistas', false, 0, NULL, 'Não incide IVA - não gera créditos', 'Art. 47'),
('USO_PESSOAL', 'Uso ou consumo pessoal', 'Despesas pessoais de sócios', false, 0, NULL, 'Expressamente vedado', 'Art. 47, caput'),

-- Aquisição de mercadorias (comércio/indústria)
('MERCADORIAS', 'Compra de mercadorias', 'Mercadorias para revenda', true, 100, 'padrao', NULL, 'Art. 47'),
('MATERIA_PRIMA', 'Matéria-prima', 'Insumos para produção', true, 100, 'padrao', NULL, 'Art. 47'),
('EMBALAGENS', 'Embalagens', 'Material de embalagem', true, 100, 'padrao', NULL, 'Art. 47'),

-- Imobilizado
('IMOBILIZADO', 'Ativo imobilizado', 'Máquinas, equipamentos, veículos', true, 100, 'padrao', 'Crédito integral na aquisição', 'Art. 48')

ON CONFLICT (codigo) DO NOTHING;

-- Despesas mensais da empresa (input para cálculo)
CREATE TABLE IF NOT EXISTS despesas_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Período
  competencia DATE NOT NULL, -- Mês/ano de competência

  -- Categoria
  categoria_id UUID REFERENCES categorias_credito(id),
  categoria_codigo VARCHAR(20) REFERENCES categorias_credito(codigo),

  -- Valores
  valor_sem_tributos DECIMAL(15,2) NOT NULL,
  valor_com_tributos DECIMAL(15,2),
  aliquota_aplicada DECIMAL(5,2), -- Alíquota efetiva (considerando reduções)

  -- Crédito calculado
  credito_ibs DECIMAL(15,2) DEFAULT 0,
  credito_cbs DECIMAL(15,2) DEFAULT 0,
  credito_total DECIMAL(15,2) DEFAULT 0,

  -- Documento fiscal
  numero_nfe VARCHAR(50),
  chave_nfe VARCHAR(44),
  data_nfe DATE,
  fornecedor_cnpj VARCHAR(18),
  fornecedor_nome TEXT,

  -- Status
  documento_validado BOOLEAN DEFAULT false,
  pago BOOLEAN DEFAULT false, -- Condição para apropriação
  data_pagamento DATE,

  -- Metadados
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Receitas mensais da empresa (para cálculo de débitos)
CREATE TABLE IF NOT EXISTS receitas_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Período
  competencia DATE NOT NULL,

  -- Tipo de receita
  tipo_receita TEXT NOT NULL, -- 'servicos', 'vendas', 'outros'
  descricao TEXT,

  -- Valores
  valor_bruto DECIMAL(15,2) NOT NULL,

  -- Alíquotas aplicáveis
  aliquota_ibs DECIMAL(5,2) DEFAULT 17.7,
  aliquota_cbs DECIMAL(5,2) DEFAULT 8.8,
  reducao_aplicada DECIMAL(5,2) DEFAULT 0, -- 0, 30, 60, 100

  -- Débitos calculados
  debito_ibs DECIMAL(15,2) DEFAULT 0,
  debito_cbs DECIMAL(15,2) DEFAULT 0,
  debito_total DECIMAL(15,2) DEFAULT 0,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Apuração mensal (consolidação créditos x débitos)
CREATE TABLE IF NOT EXISTS apuracao_mensal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Período
  competencia DATE NOT NULL,
  regime_tributario TEXT,

  -- DÉBITOS (sobre receitas)
  receita_bruta DECIMAL(15,2) DEFAULT 0,
  debito_ibs DECIMAL(15,2) DEFAULT 0,
  debito_cbs DECIMAL(15,2) DEFAULT 0,
  debito_total DECIMAL(15,2) DEFAULT 0,

  -- CRÉDITOS (sobre despesas)
  total_despesas DECIMAL(15,2) DEFAULT 0,
  credito_ibs DECIMAL(15,2) DEFAULT 0,
  credito_cbs DECIMAL(15,2) DEFAULT 0,
  credito_total DECIMAL(15,2) DEFAULT 0,

  -- SALDO
  saldo_ibs DECIMAL(15,2) DEFAULT 0, -- Débito - Crédito
  saldo_cbs DECIMAL(15,2) DEFAULT 0,
  saldo_total DECIMAL(15,2) DEFAULT 0,

  -- Se saldo negativo = CRÉDITO ACUMULADO
  credito_acumulado_ibs DECIMAL(15,2) DEFAULT 0,
  credito_acumulado_cbs DECIMAL(15,2) DEFAULT 0,

  -- VALORES A RECOLHER
  valor_recolher_ibs DECIMAL(15,2) DEFAULT 0,
  valor_recolher_cbs DECIMAL(15,2) DEFAULT 0,
  valor_recolher_total DECIMAL(15,2) DEFAULT 0,

  -- Alíquota efetiva (após créditos)
  aliquota_efetiva DECIMAL(5,2) DEFAULT 0,

  -- Comparativo com regime atual
  tributos_regime_atual DECIMAL(15,2) DEFAULT 0, -- ISS+PIS+COFINS atual
  variacao_absoluta DECIMAL(15,2) DEFAULT 0,
  variacao_percentual DECIMAL(5,2) DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'calculado', -- calculado, revisado, fechado
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(empresa_id, competencia)
);

-- Histórico de créditos acumulados
CREATE TABLE IF NOT EXISTS creditos_acumulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Período de origem
  competencia_origem DATE NOT NULL,

  -- Valores
  credito_ibs DECIMAL(15,2) DEFAULT 0,
  credito_cbs DECIMAL(15,2) DEFAULT 0,

  -- Utilização
  utilizado_ibs DECIMAL(15,2) DEFAULT 0,
  utilizado_cbs DECIMAL(15,2) DEFAULT 0,
  competencia_utilizacao DATE,

  -- Saldo
  saldo_ibs DECIMAL(15,2) DEFAULT 0,
  saldo_cbs DECIMAL(15,2) DEFAULT 0,

  -- Ressarcimento
  pedido_ressarcimento BOOLEAN DEFAULT false,
  data_pedido DATE,
  valor_ressarcido DECIMAL(15,2) DEFAULT 0,
  data_ressarcimento DATE,

  -- Status
  status TEXT DEFAULT 'disponivel', -- disponivel, utilizado, ressarcido
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_despesas_empresa ON despesas_empresa(empresa_id, competencia);
CREATE INDEX IF NOT EXISTS idx_receitas_empresa ON receitas_empresa(empresa_id, competencia);
CREATE INDEX IF NOT EXISTS idx_apuracao_empresa ON apuracao_mensal(empresa_id, competencia);
CREATE INDEX IF NOT EXISTS idx_creditos_acumulados ON creditos_acumulados(empresa_id, status);

-- RLS
ALTER TABLE categorias_credito ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE apuracao_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos_acumulados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias publicas" ON categorias_credito FOR SELECT USING (true);
CREATE POLICY "Service categorias" ON categorias_credito FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service despesas" ON despesas_empresa FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service receitas" ON receitas_empresa FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service apuracao" ON apuracao_mensal FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service creditos_acum" ON creditos_acumulados FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- FUNÇÃO: Calcular crédito de uma despesa
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_credito_despesa(
  p_valor_com_tributos DECIMAL,
  p_categoria_codigo VARCHAR,
  p_aliquota_ibs DECIMAL DEFAULT 17.7,
  p_aliquota_cbs DECIMAL DEFAULT 8.8
)
RETURNS TABLE (
  credito_ibs DECIMAL,
  credito_cbs DECIMAL,
  credito_total DECIMAL,
  valor_sem_tributos DECIMAL
) AS $$
DECLARE
  v_cat RECORD;
  v_aliquota_total DECIMAL;
  v_fator DECIMAL;
BEGIN
  -- Buscar categoria
  SELECT * INTO v_cat FROM categorias_credito WHERE codigo = p_categoria_codigo;

  -- Se não gera crédito, retornar zeros
  IF v_cat IS NULL OR NOT v_cat.gera_credito THEN
    RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, p_valor_com_tributos;
    RETURN;
  END IF;

  -- Ajustar alíquota se categoria tem redução
  IF v_cat.aliquota_aplicavel = 'reduzida_60' THEN
    p_aliquota_ibs := p_aliquota_ibs * 0.4; -- 60% de redução
    p_aliquota_cbs := p_aliquota_cbs * 0.4;
  ELSIF v_cat.aliquota_aplicavel = 'reduzida_30' THEN
    p_aliquota_ibs := p_aliquota_ibs * 0.7; -- 30% de redução
    p_aliquota_cbs := p_aliquota_cbs * 0.7;
  END IF;

  v_aliquota_total := p_aliquota_ibs + p_aliquota_cbs;

  -- Calcular valor sem tributos (por dentro)
  valor_sem_tributos := p_valor_com_tributos / (1 + v_aliquota_total / 100);

  -- Calcular créditos
  credito_ibs := valor_sem_tributos * (p_aliquota_ibs / 100) * (v_cat.percentual_credito / 100);
  credito_cbs := valor_sem_tributos * (p_aliquota_cbs / 100) * (v_cat.percentual_credito / 100);
  credito_total := credito_ibs + credito_cbs;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Apurar mês completo
-- =====================================================
CREATE OR REPLACE FUNCTION apurar_mes(
  p_empresa_id UUID,
  p_competencia DATE
)
RETURNS UUID AS $$
DECLARE
  v_apuracao_id UUID;
  v_receita_bruta DECIMAL := 0;
  v_debito_ibs DECIMAL := 0;
  v_debito_cbs DECIMAL := 0;
  v_total_despesas DECIMAL := 0;
  v_credito_ibs DECIMAL := 0;
  v_credito_cbs DECIMAL := 0;
  v_reducao DECIMAL := 0;
  v_empresa RECORD;
BEGIN
  -- Buscar dados da empresa
  SELECT * INTO v_empresa FROM empresas_analise WHERE id = p_empresa_id;

  -- Buscar redução aplicável (baseado no CNAE)
  SELECT COALESCE(reducao_aliquota, 0) INTO v_reducao
  FROM cnae_reforma WHERE codigo_cnae = v_empresa.cnae_principal;

  -- Somar receitas do mês
  SELECT
    COALESCE(SUM(valor_bruto), 0),
    COALESCE(SUM(debito_ibs), 0),
    COALESCE(SUM(debito_cbs), 0)
  INTO v_receita_bruta, v_debito_ibs, v_debito_cbs
  FROM receitas_empresa
  WHERE empresa_id = p_empresa_id
    AND competencia = p_competencia;

  -- Se não há receitas cadastradas, calcular com base no regime
  IF v_receita_bruta = 0 THEN
    -- Usar receita média se disponível
    v_receita_bruta := COALESCE(v_empresa.faturamento_mensal_medio, 0);
    v_debito_ibs := v_receita_bruta * (17.7 * (1 - v_reducao/100)) / 100;
    v_debito_cbs := v_receita_bruta * (8.8 * (1 - v_reducao/100)) / 100;
  END IF;

  -- Somar créditos do mês
  SELECT
    COALESCE(SUM(valor_com_tributos), 0),
    COALESCE(SUM(credito_ibs), 0),
    COALESCE(SUM(credito_cbs), 0)
  INTO v_total_despesas, v_credito_ibs, v_credito_cbs
  FROM despesas_empresa
  WHERE empresa_id = p_empresa_id
    AND competencia = p_competencia
    AND pago = true; -- Só considera despesas pagas

  -- Inserir ou atualizar apuração
  INSERT INTO apuracao_mensal (
    empresa_id, competencia, regime_tributario,
    receita_bruta, debito_ibs, debito_cbs, debito_total,
    total_despesas, credito_ibs, credito_cbs, credito_total,
    saldo_ibs, saldo_cbs, saldo_total,
    valor_recolher_ibs, valor_recolher_cbs, valor_recolher_total,
    aliquota_efetiva
  ) VALUES (
    p_empresa_id, p_competencia, v_empresa.regime_atual,
    v_receita_bruta, v_debito_ibs, v_debito_cbs, v_debito_ibs + v_debito_cbs,
    v_total_despesas, v_credito_ibs, v_credito_cbs, v_credito_ibs + v_credito_cbs,
    v_debito_ibs - v_credito_ibs, v_debito_cbs - v_credito_cbs, (v_debito_ibs + v_debito_cbs) - (v_credito_ibs + v_credito_cbs),
    GREATEST(0, v_debito_ibs - v_credito_ibs), GREATEST(0, v_debito_cbs - v_credito_cbs),
    GREATEST(0, (v_debito_ibs + v_debito_cbs) - (v_credito_ibs + v_credito_cbs)),
    CASE WHEN v_receita_bruta > 0
      THEN (GREATEST(0, (v_debito_ibs + v_debito_cbs) - (v_credito_ibs + v_credito_cbs)) / v_receita_bruta) * 100
      ELSE 0
    END
  )
  ON CONFLICT (empresa_id, competencia) DO UPDATE SET
    receita_bruta = EXCLUDED.receita_bruta,
    debito_ibs = EXCLUDED.debito_ibs,
    debito_cbs = EXCLUDED.debito_cbs,
    debito_total = EXCLUDED.debito_total,
    total_despesas = EXCLUDED.total_despesas,
    credito_ibs = EXCLUDED.credito_ibs,
    credito_cbs = EXCLUDED.credito_cbs,
    credito_total = EXCLUDED.credito_total,
    saldo_ibs = EXCLUDED.saldo_ibs,
    saldo_cbs = EXCLUDED.saldo_cbs,
    saldo_total = EXCLUDED.saldo_total,
    valor_recolher_ibs = EXCLUDED.valor_recolher_ibs,
    valor_recolher_cbs = EXCLUDED.valor_recolher_cbs,
    valor_recolher_total = EXCLUDED.valor_recolher_total,
    aliquota_efetiva = EXCLUDED.aliquota_efetiva,
    updated_at = now()
  RETURNING id INTO v_apuracao_id;

  -- Se há crédito acumulado (saldo negativo), registrar
  IF (v_debito_ibs - v_credito_ibs) < 0 OR (v_debito_cbs - v_credito_cbs) < 0 THEN
    INSERT INTO creditos_acumulados (
      empresa_id, competencia_origem, credito_ibs, credito_cbs, saldo_ibs, saldo_cbs
    ) VALUES (
      p_empresa_id, p_competencia,
      GREATEST(0, v_credito_ibs - v_debito_ibs),
      GREATEST(0, v_credito_cbs - v_debito_cbs),
      GREATEST(0, v_credito_ibs - v_debito_ibs),
      GREATEST(0, v_credito_cbs - v_debito_cbs)
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_apuracao_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE categorias_credito IS 'Categorias de despesas com regras de crédito IBS/CBS';
COMMENT ON TABLE despesas_empresa IS 'Despesas mensais da empresa para cálculo de créditos';
COMMENT ON TABLE receitas_empresa IS 'Receitas mensais da empresa para cálculo de débitos';
COMMENT ON TABLE apuracao_mensal IS 'Apuração consolidada mensal (créditos x débitos)';
COMMENT ON TABLE creditos_acumulados IS 'Histórico de créditos acumulados e ressarcimentos';
COMMENT ON FUNCTION calcular_credito_despesa IS 'Calcula crédito de IBS/CBS para uma despesa';
COMMENT ON FUNCTION apurar_mes IS 'Apura o mês completo de uma empresa';
