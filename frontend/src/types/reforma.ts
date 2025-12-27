// Tipos para a Calculadora IBS/CBS 2026

export interface CronogramaTransicao {
  ano: number
  fase: 'TESTE' | 'TRANSICAO_FEDERAL' | 'TRANSICAO' | 'DEFINITIVO'
  descricao: string
  cbs: number
  ibs: number
  total: number
  icms_iss: number
  pis_cofins: number
  observacao: string
}

export interface SimulacaoNFe {
  // Dados de entrada
  valorProduto: number
  ncm: string
  cfop: string
  uf: string
  tipoEmpresa: 'lucro_real' | 'lucro_presumido' | 'simples' | 'mei'
  setorAtividade?: string

  // Resultado antes da reforma
  tributosAtuais: {
    icms: number
    pis: number
    cofins: number
    ipi?: number
    total: number
    aliquotaEfetiva: number
  }

  // Resultado pos-reforma (por ano)
  tributosReforma: {
    [ano: number]: {
      cbs: number
      ibs: number
      is?: number // Imposto Seletivo
      total: number
      aliquotaEfetiva: number
      economia?: number
      aumentoCarga?: number
    }
  }
}

export interface AnaliseEmpresa {
  cnpj: string
  razaoSocial: string
  regime: 'lucro_real' | 'lucro_presumido' | 'simples' | 'mei'
  faturamentoAnual: number
  setor: string

  impostoAtual: {
    total: number
    detalhamento: {
      icms: number
      iss: number
      pis: number
      cofins: number
      ipi: number
    }
  }

  impostoReforma: {
    [ano: number]: {
      total: number
      cbs: number
      ibs: number
      is: number
      variacao: number // % de aumento ou reducao
    }
  }
}

export interface ResultadoComparativo {
  empresa: string
  periodoAnalise: string
  totalAtual: number
  totalReforma2026: number
  totalReforma2033: number
  impactoPercentual: number
  recomendacoes: string[]
  alertas: string[]
}

// Constantes da Reforma
export const ALIQUOTAS_REFORMA = {
  CBS_TESTE_2026: 0.009,
  IBS_TESTE_2026: 0.001,
  CBS_DEFINITIVA: 0.088,
  IBS_DEFINITIVO: 0.177,
  TOTAL_DEFINITIVO: 0.265,
  REDUCAO_SETOR_ESPECIAL: 0.6 // 60% de reducao
}

export const NCMS_CESTA_BASICA = [
  '1006.30', // Arroz
  '0713', // Feijao
  '0714', // Mandioca
  '0901', // Cafe
  '1507', // Oleo de soja
  '1517', // Margarina
  '1701', // Acucar
  '2501', // Sal
  '0401', // Leite
  '0406', // Queijos
  '0405', // Manteiga
  '0407', // Ovos
  '0201', '0202', '0203', '0207', '0302', '0303', // Carnes
  '1905.90', // Pao frances
  '0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708', '0709', // Hortalicas
  '0801', '0802', '0803', '0804', '0805', '0806', '0807', '0808', '0809', '0810', // Frutas
]

export const SETORES_REDUCAO_60 = [
  'saude',
  'educacao',
  'transporte_publico',
  'agropecuaria',
  'energia_renovavel',
  'dispositivos_pcd'
]
