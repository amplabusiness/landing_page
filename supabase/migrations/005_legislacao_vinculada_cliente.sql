-- =====================================================
-- LEGISLACAO VINCULADA AO CLIENTE
-- Sistema inteligente que filtra legislacao por CNAE/atividade
-- =====================================================

-- Tabela de regras da reforma por atividade economica
CREATE TABLE IF NOT EXISTS regras_reforma_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificacao da atividade
  codigo_cnae VARCHAR(10),
  grupo_atividade TEXT NOT NULL, -- 'locacao_imoveis', 'comercio_varejo', 'servicos_saude', etc
  nome_atividade TEXT NOT NULL,
  descricao TEXT,

  -- Regime tributario aplicavel
  regime_tributario TEXT[], -- ['lucro_presumido', 'lucro_real', 'simples_nacional']

  -- === TRIBUTACAO ATUAL (antes da reforma) ===
  -- PIS/COFINS
  pis_cumulativo DECIMAL(5,2) DEFAULT 0.65,
  cofins_cumulativo DECIMAL(5,2) DEFAULT 3.00,
  pis_nao_cumulativo DECIMAL(5,2) DEFAULT 1.65,
  cofins_nao_cumulativo DECIMAL(5,2) DEFAULT 7.60,

  -- ISS (se servico)
  iss_minimo DECIMAL(5,2) DEFAULT 2.00,
  iss_maximo DECIMAL(5,2) DEFAULT 5.00,

  -- IRPJ/CSLL (lucro presumido - base de calculo)
  presuncao_irpj DECIMAL(5,2), -- % sobre receita bruta
  presuncao_csll DECIMAL(5,2),

  -- === TRIBUTACAO NOVA (pos-reforma) ===
  -- Tipo de tratamento
  tratamento_reforma TEXT CHECK (tratamento_reforma IN (
    'tributacao_padrao',      -- 26.5% CBS+IBS
    'reducao_60',             -- 60% reducao = 10.6%
    'reducao_30',             -- 30% reducao = 18.55%
    'aliquota_zero',          -- Isento
    'regime_especifico',      -- Regras proprias (financeiro, combustiveis)
    'imunidade'               -- Imune constitucionalmente
  )) DEFAULT 'tributacao_padrao',

  -- Aliquotas novas
  aliquota_cbs DECIMAL(5,2) DEFAULT 8.8,  -- Federal
  aliquota_ibs DECIMAL(5,2) DEFAULT 17.7, -- Estadual+Municipal
  aliquota_total DECIMAL(5,2) DEFAULT 26.5,

  -- Imposto Seletivo (se aplicavel)
  sujeito_is BOOLEAN DEFAULT false,
  aliquota_is DECIMAL(5,2) DEFAULT 0,

  -- Split Payment
  split_payment_obrigatorio BOOLEAN DEFAULT true,

  -- === CREDITOS ===
  direito_credito_integral BOOLEAN DEFAULT true,
  restricoes_credito TEXT,

  -- === TRANSICAO ===
  transicao_especial BOOLEAN DEFAULT false,
  detalhes_transicao TEXT,

  -- === LEGISLACAO ===
  artigos_lc214 TEXT[], -- ['Art. 7º, §2º', 'Art. 156-A']
  anexos_lc214 TEXT[],
  outras_referencias TEXT[],

  -- Texto explicativo para o cliente
  explicacao_simples TEXT NOT NULL,
  impacto_esperado TEXT, -- 'aumento', 'reducao', 'neutro'
  exemplos_praticos TEXT,
  pontos_atencao TEXT[],

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vinculo cliente x regras aplicaveis
CREATE TABLE IF NOT EXISTS cliente_regras_aplicaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,
  regra_id UUID REFERENCES regras_reforma_atividade(id),

  -- Peso/relevancia para este cliente
  relevancia INTEGER DEFAULT 10 CHECK (relevancia BETWEEN 1 AND 10),

  -- Se e a atividade principal
  atividade_principal BOOLEAN DEFAULT false,

  -- Notas especificas para o cliente
  observacoes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(empresa_id, regra_id)
);

-- Simulacoes de impacto por cliente
CREATE TABLE IF NOT EXISTS simulacoes_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas_analise(id) ON DELETE CASCADE,

  -- Dados de entrada
  receita_mensal DECIMAL(15,2) NOT NULL,
  receita_anual DECIMAL(15,2),
  regime_atual TEXT NOT NULL,

  -- Custos/despesas (para creditos)
  custos_mensais DECIMAL(15,2) DEFAULT 0,
  despesas_operacionais DECIMAL(15,2) DEFAULT 0,

  -- === RESULTADO ATUAL ===
  pis_atual DECIMAL(15,2),
  cofins_atual DECIMAL(15,2),
  iss_atual DECIMAL(15,2),
  irpj_atual DECIMAL(15,2),
  csll_atual DECIMAL(15,2),
  total_tributos_atual DECIMAL(15,2),
  carga_atual_percentual DECIMAL(5,2),

  -- === RESULTADO NOVO ===
  cbs_novo DECIMAL(15,2),
  ibs_novo DECIMAL(15,2),
  is_novo DECIMAL(15,2),
  creditos_estimados DECIMAL(15,2),
  total_tributos_novo DECIMAL(15,2),
  carga_nova_percentual DECIMAL(5,2),

  -- === IMPACTO ===
  diferenca_absoluta DECIMAL(15,2),
  diferenca_percentual DECIMAL(5,2),
  classificacao TEXT CHECK (classificacao IN (
    'muito_favoravel',  -- reducao > 15%
    'favoravel',        -- reducao 5-15%
    'neutro',           -- -5% a +5%
    'desfavoravel',     -- aumento 5-15%
    'muito_desfavoravel' -- aumento > 15%
  )),

  -- Interpretacao IA
  analise_ia TEXT,
  recomendacoes TEXT[],

  -- Cronograma de impacto (2026-2033)
  impacto_por_ano JSONB, -- {"2026": {...}, "2027": {...}, ...}

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_regras_cnae ON regras_reforma_atividade(codigo_cnae);
CREATE INDEX IF NOT EXISTS idx_regras_grupo ON regras_reforma_atividade(grupo_atividade);
CREATE INDEX IF NOT EXISTS idx_cliente_regras ON cliente_regras_aplicaveis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_simulacoes ON simulacoes_cliente(empresa_id);

-- RLS
ALTER TABLE regras_reforma_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_regras_aplicaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulacoes_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regras publicas" ON regras_reforma_atividade FOR SELECT USING (true);
CREATE POLICY "Service regras" ON regras_reforma_atividade FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service vinculo" ON cliente_regras_aplicaveis FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service simulacoes" ON simulacoes_cliente FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- DADOS: LOCACAO DE IMOVEIS PROPRIOS
-- Exemplo especifico para cliente Murano
-- =====================================================

INSERT INTO regras_reforma_atividade (
  codigo_cnae,
  grupo_atividade,
  nome_atividade,
  descricao,
  regime_tributario,

  -- Tributacao atual
  pis_cumulativo, cofins_cumulativo,
  presuncao_irpj, presuncao_csll,

  -- Tributacao nova
  tratamento_reforma,
  aliquota_cbs, aliquota_ibs, aliquota_total,
  split_payment_obrigatorio,
  direito_credito_integral,

  -- Legislacao
  artigos_lc214,

  -- Explicacao
  explicacao_simples,
  impacto_esperado,
  exemplos_praticos,
  pontos_atencao
) VALUES (
  '6810-2/02',
  'locacao_imoveis_proprios',
  'Locação de Imóveis Próprios',
  'Aluguel de imóveis próprios residenciais e comerciais',
  ARRAY['lucro_presumido', 'lucro_real'],

  -- ATUAL: Lucro Presumido
  -- PIS 0.65% + COFINS 3% = 3.65%
  -- IRPJ: 32% x 15% = 4.8%
  -- CSLL: 32% x 9% = 2.88%
  -- TOTAL aproximado: 11.33% sobre receita bruta
  0.65, 3.00,
  32.00, 32.00, -- Base presumida 32% para locacao

  -- NOVO: Tributacao Padrao (sem reducao especifica para locacao)
  -- CBS 8.8% + IBS 17.7% = 26.5%
  -- Porem: SEM direito a credito significativo (nao tem insumos)
  'tributacao_padrao',
  8.8, 17.7, 26.5,
  true,
  false, -- Locacao pura nao gera creditos relevantes

  ARRAY['Art. 4º', 'Art. 5º', 'Art. 12'],

  -- EXPLICACAO SIMPLES
  'A locação de imóveis próprios terá um AUMENTO SIGNIFICATIVO de carga tributária com a Reforma.

SITUAÇÃO ATUAL (Lucro Presumido):
• PIS: 0,65% sobre a receita
• COFINS: 3,00% sobre a receita
• IRPJ: 4,80% (32% x 15%) sobre a receita
• CSLL: 2,88% (32% x 9%) sobre a receita
• TOTAL: aproximadamente 11,33% da receita bruta

SITUAÇÃO NOVA (a partir de 2026):
• CBS: 8,8% sobre a receita
• IBS: 17,7% sobre a receita
• TOTAL: 26,5% da receita bruta

PROBLEMA: Locação de imóveis próprios praticamente NÃO gera créditos tributários porque:
1. Não há compra de mercadorias para revenda
2. Não há insumos significativos no processo
3. Manutenção predial gera crédito mínimo

Resultado: A carga tributária mais que DOBRA.',

  'muito_desfavoravel',

  'EXEMPLO MURANO:
Se a Murano tem receita mensal de R$ 100.000 em aluguéis:

HOJE (Lucro Presumido):
• PIS: R$ 650
• COFINS: R$ 3.000
• IRPJ: R$ 4.800
• CSLL: R$ 2.880
• TOTAL: R$ 11.330/mês

COM A REFORMA (2033 - alíquota cheia):
• CBS + IBS: R$ 26.500/mês
• Créditos estimados: R$ 500 (manutenção)
• TOTAL LÍQUIDO: R$ 26.000/mês

AUMENTO: R$ 14.670/mês = +129% de carga tributária!

DURANTE A TRANSIÇÃO:
• 2026: ~R$ 12.000 (+6%)
• 2027: ~R$ 14.000 (+24%)
• 2029: ~R$ 18.000 (+59%)
• 2033: ~R$ 26.000 (+129%)',

  ARRAY[
    'Avaliar migração para Lucro Real ANTES de 2026',
    'Verificar se há como gerar créditos (reformas, manutenções)',
    'Considerar reestruturação societária',
    'Analisar impacto nos contratos de locação vigentes',
    'Verificar cláusulas de reajuste por tributos',
    'Simular repasse parcial ao locatário'
  ]
)
ON CONFLICT DO NOTHING;

-- Mais atividades comuns

INSERT INTO regras_reforma_atividade (
  codigo_cnae, grupo_atividade, nome_atividade, descricao, regime_tributario,
  pis_cumulativo, cofins_cumulativo, presuncao_irpj, presuncao_csll,
  tratamento_reforma, aliquota_cbs, aliquota_ibs, aliquota_total,
  direito_credito_integral, artigos_lc214,
  explicacao_simples, impacto_esperado, pontos_atencao
) VALUES
-- Contabilidade (servicos profissionais)
(
  '6920-6/01', 'servicos_contabilidade', 'Serviços de Contabilidade',
  'Atividades de contabilidade, auditoria e consultoria tributária',
  ARRAY['lucro_presumido', 'simples_nacional'],
  0.65, 3.00, 32.00, 32.00,
  'tributacao_padrao', 8.8, 17.7, 26.5, false,
  ARRAY['Art. 4º'],
  'Escritórios de contabilidade terão aumento de carga similar a serviços em geral. Não há redução específica. O aumento será de aproximadamente 11% para 26.5%.',
  'muito_desfavoravel',
  ARRAY['Avaliar repasse aos clientes', 'Revisar contratos de honorários', 'Considerar automação para compensar']
),

-- Comercio varejista alimenticio
(
  '4711-3/02', 'comercio_supermercado', 'Supermercados',
  'Comércio varejista de mercadorias em geral com predominância de alimentos',
  ARRAY['lucro_presumido', 'lucro_real', 'simples_nacional'],
  1.65, 7.60, 8.00, 12.00,
  'tributacao_padrao', 8.8, 17.7, 26.5, true,
  ARRAY['Art. 4º', 'Anexo I'],
  'Supermercados terão impacto NEUTRO a FAVORÁVEL. Motivo: direito integral a créditos nas compras de mercadorias. Produtos da cesta básica terão alíquota zero, compensando o aumento geral.',
  'neutro',
  ARRAY['Mapear produtos de cesta básica (alíquota zero)', 'Organizar sistema de créditos', 'Ajustar margens por categoria']
),

-- Restaurantes
(
  '5611-2/01', 'alimentacao_restaurante', 'Restaurantes',
  'Restaurantes e similares',
  ARRAY['lucro_presumido', 'simples_nacional'],
  0.65, 3.00, 8.00, 12.00,
  'reducao_30', 6.16, 12.39, 18.55, true,
  ARRAY['Art. 7º, §3º'],
  'Restaurantes têm REDUÇÃO de 30% na alíquota (18,55% ao invés de 26,5%). Além disso, insumos alimentícios da cesta básica geram créditos. Impacto tende a ser NEUTRO ou levemente favorável.',
  'neutro',
  ARRAY['Organizar compras para maximizar créditos', 'Separar insumos de cesta básica']
),

-- Clinicas medicas
(
  '8630-5/03', 'saude_clinica', 'Clínicas Médicas',
  'Atividade médica ambulatorial restrita a consultas',
  ARRAY['lucro_presumido', 'simples_nacional'],
  0.65, 3.00, 32.00, 32.00,
  'reducao_60', 3.52, 7.08, 10.6, false,
  ARRAY['Art. 7º, I', 'Art. 8º'],
  'Serviços de SAÚDE têm REDUÇÃO de 60% na alíquota! A carga cai de 26,5% para apenas 10,6%. Comparado ao atual (~11%), ficará praticamente IGUAL. Pequena vantagem se considerar créditos em equipamentos.',
  'neutro',
  ARRAY['Verificar enquadramento correto como serviço de saúde', 'Aproveitar créditos de equipamentos médicos']
),

-- Escolas
(
  '8513-9/00', 'educacao_fundamental', 'Ensino Fundamental',
  'Educação de ensino fundamental',
  ARRAY['lucro_presumido', 'simples_nacional'],
  0.65, 3.00, 32.00, 32.00,
  'reducao_60', 3.52, 7.08, 10.6, false,
  ARRAY['Art. 7º, II'],
  'EDUCAÇÃO tem REDUÇÃO de 60%! A alíquota cai para 10,6%. Considerando a carga atual de ~11%, o impacto é praticamente NEUTRO, com pequena tendência de REDUÇÃO.',
  'favoravel',
  ARRAY['Confirmar enquadramento educacional', 'Aproveitar créditos em materiais didáticos']
)

ON CONFLICT DO NOTHING;

-- Funcao para vincular regras automaticamente baseado no CNAE
CREATE OR REPLACE FUNCTION vincular_regras_por_cnae(p_empresa_id UUID, p_cnae VARCHAR(10))
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_regra RECORD;
BEGIN
  -- Buscar regras que correspondem ao CNAE ou grupo similar
  FOR v_regra IN
    SELECT id, grupo_atividade
    FROM regras_reforma_atividade
    WHERE codigo_cnae = p_cnae
       OR codigo_cnae LIKE LEFT(p_cnae, 4) || '%'
       OR grupo_atividade IN (
         SELECT grupo_atividade FROM regras_reforma_atividade WHERE codigo_cnae = p_cnae
       )
  LOOP
    INSERT INTO cliente_regras_aplicaveis (empresa_id, regra_id, atividade_principal, relevancia)
    VALUES (p_empresa_id, v_regra.id, v_regra.grupo_atividade = (
      SELECT grupo_atividade FROM regras_reforma_atividade WHERE codigo_cnae = p_cnae LIMIT 1
    ), 10)
    ON CONFLICT (empresa_id, regra_id) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Funcao para calcular impacto para um cliente
CREATE OR REPLACE FUNCTION calcular_impacto_cliente(
  p_empresa_id UUID,
  p_receita_mensal DECIMAL,
  p_regime TEXT DEFAULT 'lucro_presumido'
)
RETURNS TABLE (
  tributo_atual DECIMAL,
  tributo_novo DECIMAL,
  diferenca DECIMAL,
  percentual_variacao DECIMAL,
  classificacao TEXT
) AS $$
DECLARE
  v_regra RECORD;
  v_tributo_atual DECIMAL := 0;
  v_tributo_novo DECIMAL := 0;
BEGIN
  -- Buscar regra principal do cliente
  SELECT r.* INTO v_regra
  FROM regras_reforma_atividade r
  JOIN cliente_regras_aplicaveis c ON c.regra_id = r.id
  WHERE c.empresa_id = p_empresa_id AND c.atividade_principal = true
  LIMIT 1;

  IF v_regra IS NULL THEN
    -- Usar tributacao padrao
    v_tributo_atual := p_receita_mensal * 0.1133; -- Aproximado LP
    v_tributo_novo := p_receita_mensal * 0.265;
  ELSE
    -- Calcular atual
    IF p_regime = 'lucro_presumido' THEN
      v_tributo_atual := p_receita_mensal * (
        v_regra.pis_cumulativo/100 +
        v_regra.cofins_cumulativo/100 +
        (v_regra.presuncao_irpj/100 * 0.15) +
        (v_regra.presuncao_csll/100 * 0.09)
      );
    ELSE
      v_tributo_atual := p_receita_mensal * (
        v_regra.pis_nao_cumulativo/100 +
        v_regra.cofins_nao_cumulativo/100
      );
    END IF;

    -- Calcular novo
    v_tributo_novo := p_receita_mensal * (v_regra.aliquota_total / 100);
  END IF;

  tributo_atual := v_tributo_atual;
  tributo_novo := v_tributo_novo;
  diferenca := v_tributo_novo - v_tributo_atual;
  percentual_variacao := ((v_tributo_novo - v_tributo_atual) / v_tributo_atual) * 100;

  IF percentual_variacao < -15 THEN
    classificacao := 'muito_favoravel';
  ELSIF percentual_variacao < -5 THEN
    classificacao := 'favoravel';
  ELSIF percentual_variacao <= 5 THEN
    classificacao := 'neutro';
  ELSIF percentual_variacao <= 15 THEN
    classificacao := 'desfavoravel';
  ELSE
    classificacao := 'muito_desfavoravel';
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE regras_reforma_atividade IS 'Regras da reforma tributária por atividade econômica/CNAE';
COMMENT ON TABLE cliente_regras_aplicaveis IS 'Vínculo entre clientes e regras aplicáveis';
COMMENT ON TABLE simulacoes_cliente IS 'Simulações de impacto salvadas por cliente';
COMMENT ON FUNCTION vincular_regras_por_cnae IS 'Vincula automaticamente regras ao cliente baseado no CNAE';
COMMENT ON FUNCTION calcular_impacto_cliente IS 'Calcula impacto da reforma para um cliente específico';
