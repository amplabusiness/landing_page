import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, Info, ChevronRight, FileText,
  Calendar, DollarSign, HelpCircle, Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface RegraAtividade {
  id: string
  codigo_cnae: string
  grupo_atividade: string
  nome_atividade: string
  tratamento_reforma: string
  aliquota_total: number
  aliquota_cbs: number
  aliquota_ibs: number
  direito_credito_integral: boolean
  pis_cumulativo: number
  cofins_cumulativo: number
  pis_nao_cumulativo: number
  cofins_nao_cumulativo: number
  presuncao_irpj: number
  presuncao_csll: number
  explicacao_simples: string
  impacto_esperado: string
  exemplos_praticos: string
  pontos_atencao: string[]
}

interface ResultadoCalculo {
  // Atual
  pis_atual: number
  cofins_atual: number
  irpj_atual: number
  csll_atual: number
  iss_atual: number
  total_atual: number
  carga_atual_pct: number

  // Novo
  cbs_novo: number
  ibs_novo: number
  is_novo: number
  creditos: number
  total_novo: number
  carga_nova_pct: number

  // Impacto
  diferenca: number
  variacao_pct: number
  classificacao: 'muito_favoravel' | 'favoravel' | 'neutro' | 'desfavoravel' | 'muito_desfavoravel'

  // Transição por ano
  transicao: {
    ano: number
    cbs: number
    ibs: number
    pis_cofins: number
    icms_iss: number
    total: number
  }[]
}

// Alíquotas de transição (LC 214/2025)
const TRANSICAO = {
  2026: { cbs: 0.9, ibs: 0.1, pis_cofins: 100, icms_iss: 100 },
  2027: { cbs: 0.9, ibs: 0.1, pis_cofins: 100, icms_iss: 100 },
  2028: { cbs: 0.9, ibs: 0.1, pis_cofins: 100, icms_iss: 100 },
  2029: { cbs: 8.8, ibs: 17.7 * 0.1, pis_cofins: 90, icms_iss: 90 },
  2030: { cbs: 8.8, ibs: 17.7 * 0.2, pis_cofins: 80, icms_iss: 80 },
  2031: { cbs: 8.8, ibs: 17.7 * 0.4, pis_cofins: 60, icms_iss: 60 },
  2032: { cbs: 8.8, ibs: 17.7 * 0.7, pis_cofins: 30, icms_iss: 30 },
  2033: { cbs: 8.8, ibs: 17.7, pis_cofins: 0, icms_iss: 0 },
}

const REGIMES = [
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'simples_nacional', label: 'Simples Nacional' },
]

const CLASSIFICACAO_CORES = {
  muito_favoravel: { bg: 'bg-green-500/20', text: 'text-green-400', icon: TrendingDown },
  favoravel: { bg: 'bg-green-500/10', text: 'text-green-300', icon: TrendingDown },
  neutro: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: Minus },
  desfavoravel: { bg: 'bg-red-500/10', text: 'text-red-300', icon: TrendingUp },
  muito_desfavoravel: { bg: 'bg-red-500/20', text: 'text-red-400', icon: TrendingUp },
}

const CLASSIFICACAO_LABELS = {
  muito_favoravel: 'Muito Favorável',
  favoravel: 'Favorável',
  neutro: 'Neutro',
  desfavoravel: 'Desfavorável',
  muito_desfavoravel: 'Muito Desfavorável',
}

export function CalculadoraImpacto() {
  const [cnae, setCnae] = useState('')
  const [regime, setRegime] = useState('lucro_presumido')
  const [receita, setReceita] = useState('')
  const [custos, setCustos] = useState('')

  const [loading, setLoading] = useState(false)
  const [regra, setRegra] = useState<RegraAtividade | null>(null)
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false)

  // Buscar regra quando CNAE mudar
  useEffect(() => {
    if (cnae.length >= 7) {
      buscarRegra(cnae.replace(/\D/g, ''))
    } else {
      setRegra(null)
    }
  }, [cnae])

  async function buscarRegra(codigoCnae: string) {
    try {
      const { data } = await supabase
        .from('regras_reforma_atividade')
        .select('*')
        .or(`codigo_cnae.eq.${codigoCnae},codigo_cnae.like.${codigoCnae.substring(0, 4)}%`)
        .limit(1)
        .single()

      if (data) {
        setRegra(data)
      }
    } catch (error) {
      console.log('Regra não encontrada, usando padrão')
    }
  }

  function calcular() {
    setLoading(true)

    const receitaMensal = parseFloat(receita.replace(/\D/g, '')) / 100
    const custosMensal = parseFloat(custos.replace(/\D/g, '') || '0') / 100

    // Parâmetros baseados na regra ou padrão
    const aliquotaCbs = regra?.aliquota_cbs || 8.8
    const aliquotaIbs = regra?.aliquota_ibs || 17.7
    const aliquotaTotal = regra?.aliquota_total || 26.5
    const temCredito = regra?.direito_credito_integral !== false

    // CÁLCULO ATUAL (Lucro Presumido)
    let pis_atual = receitaMensal * 0.0065
    let cofins_atual = receitaMensal * 0.03
    let irpj_atual = receitaMensal * 0.32 * 0.15 // 32% base x 15%
    let csll_atual = receitaMensal * 0.32 * 0.09 // 32% base x 9%
    let iss_atual = 0

    if (regime === 'lucro_real') {
      pis_atual = receitaMensal * 0.0165
      cofins_atual = receitaMensal * 0.076
      // Créditos sobre custos
      const creditoPisCofins = custosMensal * 0.0925
      pis_atual = Math.max(0, pis_atual - creditoPisCofins * 0.178)
      cofins_atual = Math.max(0, cofins_atual - creditoPisCofins * 0.822)
    }

    const total_atual = pis_atual + cofins_atual + irpj_atual + csll_atual + iss_atual
    const carga_atual_pct = (total_atual / receitaMensal) * 100

    // CÁLCULO NOVO (CBS + IBS)
    // Créditos (se aplicável)
    let creditos = 0
    if (temCredito) {
      creditos = custosMensal * (aliquotaTotal / 100) * 0.8 // 80% aproveitável
    }

    const cbs_novo = receitaMensal * (aliquotaCbs / 100)
    const ibs_novo = receitaMensal * (aliquotaIbs / 100)
    const is_novo = 0 // Imposto seletivo se aplicável

    const total_novo = cbs_novo + ibs_novo + is_novo - creditos
    const carga_nova_pct = (total_novo / receitaMensal) * 100

    // IMPACTO
    const diferenca = total_novo - total_atual
    const variacao_pct = ((total_novo - total_atual) / total_atual) * 100

    let classificacao: ResultadoCalculo['classificacao'] = 'neutro'
    if (variacao_pct < -15) classificacao = 'muito_favoravel'
    else if (variacao_pct < -5) classificacao = 'favoravel'
    else if (variacao_pct <= 5) classificacao = 'neutro'
    else if (variacao_pct <= 15) classificacao = 'desfavoravel'
    else classificacao = 'muito_desfavoravel'

    // TRANSIÇÃO ANO A ANO
    const transicao = Object.entries(TRANSICAO).map(([ano, taxas]) => {
      const cbsAno = receitaMensal * (taxas.cbs / 100)
      const ibsAno = receitaMensal * (taxas.ibs / 100)
      const pisCofinsMantido = (pis_atual + cofins_atual) * (taxas.pis_cofins / 100)
      const icmsIssMantido = iss_atual * (taxas.icms_iss / 100)

      return {
        ano: parseInt(ano),
        cbs: cbsAno,
        ibs: ibsAno,
        pis_cofins: pisCofinsMantido,
        icms_iss: icmsIssMantido,
        total: cbsAno + ibsAno + pisCofinsMantido + icmsIssMantido + irpj_atual + csll_atual,
      }
    })

    setResultado({
      pis_atual, cofins_atual, irpj_atual, csll_atual, iss_atual,
      total_atual, carga_atual_pct,
      cbs_novo, ibs_novo, is_novo, creditos, total_novo, carga_nova_pct,
      diferenca, variacao_pct, classificacao,
      transicao,
    })

    setLoading(false)
    setMostrarDetalhes(true)
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarInputMoeda(valor: string) {
    const numero = valor.replace(/\D/g, '')
    const valorNumerico = parseInt(numero || '0') / 100
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <section id="calculadora" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-contta-500/20 text-contta-300 px-4 py-2 rounded-full text-sm mb-4">
            <Calculator size={16} />
            <span>Calculadora Inteligente</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calcule o Impacto na Sua Empresa
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Descubra quanto sua empresa vai pagar a mais (ou a menos) com a Reforma Tributária.
            Cálculo personalizado por atividade econômica.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 md:p-8">
            {/* Formulário */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* CNAE */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CNAE Principal
                  <HelpCircle size={14} className="inline ml-1 text-slate-500" />
                </label>
                <input
                  type="text"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  placeholder="Ex: 6810-2/02"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-contta-500 focus:ring-1 focus:ring-contta-500 outline-none"
                />
                {regra && (
                  <p className="text-contta-400 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle size={14} />
                    {regra.nome_atividade}
                  </p>
                )}
              </div>

              {/* Regime Tributário */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Regime Tributário Atual
                </label>
                <select
                  value={regime}
                  onChange={(e) => setRegime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-contta-500 focus:ring-1 focus:ring-contta-500 outline-none"
                >
                  {REGIMES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Receita Mensal */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Receita Mensal
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={receita}
                    onChange={(e) => setReceita(formatarInputMoeda(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-contta-500 focus:ring-1 focus:ring-contta-500 outline-none"
                  />
                </div>
              </div>

              {/* Custos/Despesas */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custos/Despesas Mensais
                  <span className="text-slate-500 text-xs ml-1">(para créditos)</span>
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={custos}
                    onChange={(e) => setCustos(formatarInputMoeda(e.target.value))}
                    placeholder="R$ 0,00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-contta-500 focus:ring-1 focus:ring-contta-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botão Calcular */}
            <button
              onClick={calcular}
              disabled={!receita || loading}
              className="w-full py-4 bg-gradient-to-r from-contta-500 to-contta-400 hover:from-contta-600 hover:to-contta-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Calcular Impacto
                </>
              )}
            </button>
          </div>

          {/* Resultado */}
          <AnimatePresence>
            {resultado && mostrarDetalhes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 space-y-6"
              >
                {/* Card Principal */}
                <div className={`rounded-2xl border p-6 ${CLASSIFICACAO_CORES[resultado.classificacao].bg} border-slate-700`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Resultado da Análise</h3>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${CLASSIFICACAO_CORES[resultado.classificacao].bg}`}>
                      {(() => {
                        const Icon = CLASSIFICACAO_CORES[resultado.classificacao].icon
                        return <Icon size={18} className={CLASSIFICACAO_CORES[resultado.classificacao].text} />
                      })()}
                      <span className={`font-semibold ${CLASSIFICACAO_CORES[resultado.classificacao].text}`}>
                        {CLASSIFICACAO_LABELS[resultado.classificacao]}
                      </span>
                    </div>
                  </div>

                  {/* Comparativo */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Atual */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Tributos Atuais</p>
                      <p className="text-2xl font-bold text-white">{formatarMoeda(resultado.total_atual)}</p>
                      <p className="text-slate-500 text-sm">{resultado.carga_atual_pct.toFixed(2)}% da receita</p>
                    </div>

                    {/* Seta */}
                    <div className="flex items-center justify-center">
                      <ChevronRight size={32} className="text-slate-600" />
                    </div>

                    {/* Novo */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <p className="text-slate-400 text-sm mb-1">Tributos com Reforma</p>
                      <p className="text-2xl font-bold text-white">{formatarMoeda(resultado.total_novo)}</p>
                      <p className="text-slate-500 text-sm">{resultado.carga_nova_pct.toFixed(2)}% da receita</p>
                    </div>
                  </div>

                  {/* Diferença */}
                  <div className="mt-6 p-4 bg-slate-900/50 rounded-xl text-center">
                    <p className="text-slate-400 text-sm mb-1">Diferença Mensal</p>
                    <p className={`text-3xl font-bold ${resultado.diferenca > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {resultado.diferenca > 0 ? '+' : ''}{formatarMoeda(resultado.diferenca)}
                    </p>
                    <p className={`text-lg ${resultado.variacao_pct > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ({resultado.variacao_pct > 0 ? '+' : ''}{resultado.variacao_pct.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                {/* Detalhamento */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Detalhamento dos Tributos
                  </h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Atual */}
                    <div>
                      <p className="text-contta-400 font-medium mb-3">Sistema Atual</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>PIS</span>
                          <span>{formatarMoeda(resultado.pis_atual)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>COFINS</span>
                          <span>{formatarMoeda(resultado.cofins_atual)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>IRPJ</span>
                          <span>{formatarMoeda(resultado.irpj_atual)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>CSLL</span>
                          <span>{formatarMoeda(resultado.csll_atual)}</span>
                        </div>
                        <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-700">
                          <span>Total</span>
                          <span>{formatarMoeda(resultado.total_atual)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Novo */}
                    <div>
                      <p className="text-contta-400 font-medium mb-3">Sistema Novo (2033)</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>CBS (Federal)</span>
                          <span>{formatarMoeda(resultado.cbs_novo)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>IBS (Estadual/Municipal)</span>
                          <span>{formatarMoeda(resultado.ibs_novo)}</span>
                        </div>
                        <div className="flex justify-between text-green-400">
                          <span>(-) Créditos</span>
                          <span>-{formatarMoeda(resultado.creditos)}</span>
                        </div>
                        <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-700">
                          <span>Total Líquido</span>
                          <span>{formatarMoeda(resultado.total_novo)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cronograma de Transição */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Cronograma de Transição (2026-2033)
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-400">
                          <th className="text-left py-2">Ano</th>
                          <th className="text-right py-2">CBS</th>
                          <th className="text-right py-2">IBS</th>
                          <th className="text-right py-2">PIS/COFINS</th>
                          <th className="text-right py-2 font-semibold">Total Mensal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.transicao.map((t) => (
                          <tr key={t.ano} className="border-t border-slate-700">
                            <td className="py-3 text-white font-medium">{t.ano}</td>
                            <td className="py-3 text-right text-slate-300">{formatarMoeda(t.cbs)}</td>
                            <td className="py-3 text-right text-slate-300">{formatarMoeda(t.ibs)}</td>
                            <td className="py-3 text-right text-slate-300">{formatarMoeda(t.pis_cofins)}</td>
                            <td className="py-3 text-right text-white font-semibold">{formatarMoeda(t.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Explicação da atividade */}
                {regra && (
                  <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Info size={20} />
                      Entenda o Impacto para {regra.nome_atividade}
                    </h4>

                    <div className="prose prose-invert prose-sm max-w-none">
                      <p className="text-slate-300 whitespace-pre-line">
                        {regra.explicacao_simples}
                      </p>

                      {regra.exemplos_praticos && (
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
                          <p className="text-contta-400 font-medium mb-2">Exemplo Prático:</p>
                          <p className="text-slate-300 whitespace-pre-line text-sm">
                            {regra.exemplos_praticos}
                          </p>
                        </div>
                      )}

                      {regra.pontos_atencao && regra.pontos_atencao.length > 0 && (
                        <div className="mt-4">
                          <p className="text-orange-400 font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Pontos de Atenção:
                          </p>
                          <ul className="space-y-2">
                            {regra.pontos_atencao.map((ponto, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                <span className="text-orange-400 mt-1">•</span>
                                {ponto}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-r from-contta-600 to-contta-500 rounded-2xl p-6 text-center">
                  <h4 className="text-xl font-bold text-white mb-2">
                    Quer uma análise completa para sua empresa?
                  </h4>
                  <p className="text-contta-100 mb-4">
                    Nossos especialistas podem ajudar com planejamento tributário personalizado.
                  </p>
                  <a
                    href="#contato"
                    className="inline-flex items-center gap-2 bg-white text-contta-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all"
                  >
                    Falar com Especialista
                    <ChevronRight size={20} />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
