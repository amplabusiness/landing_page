import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, FileText, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

interface ResultadoSimulacao {
  valorProduto: number
  tributosAtuais: {
    icms: number
    pis: number
    cofins: number
    total: number
    aliquota: number
  }
  tributosReforma: {
    cbs: number
    ibs: number
    total: number
    aliquota: number
  }
  diferenca: number
  percentualMudanca: number
}

// Constantes da Reforma (simplificadas para demo)
const ALIQUOTAS = {
  // Sistema atual (estimativas medias)
  ICMS: 0.18,
  PIS: 0.0165,
  COFINS: 0.076,
  // Reforma 2033
  CBS: 0.088,
  IBS: 0.177
}

export function Simulador() {
  const [valorProduto, setValorProduto] = useState('')
  const [ncm, setNcm] = useState('')
  const [uf, setUf] = useState('GO')
  const [tipoEmpresa, setTipoEmpresa] = useState('lucro_real')
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null)
  const [simulacoesRestantes, setSimulacoesRestantes] = useState(5)

  const calcularSimulacao = () => {
    if (!valorProduto || simulacoesRestantes <= 0) return

    const valor = parseFloat(valorProduto.replace(/\D/g, '')) / 100

    // Calculo simplificado para demonstracao
    const icms = valor * ALIQUOTAS.ICMS
    const pis = valor * ALIQUOTAS.PIS
    const cofins = valor * ALIQUOTAS.COFINS
    const totalAtual = icms + pis + cofins

    const cbs = valor * ALIQUOTAS.CBS
    const ibs = valor * ALIQUOTAS.IBS
    const totalReforma = cbs + ibs

    const diferenca = totalAtual - totalReforma
    const percentualMudanca = ((totalReforma - totalAtual) / totalAtual) * 100

    setResultado({
      valorProduto: valor,
      tributosAtuais: {
        icms,
        pis,
        cofins,
        total: totalAtual,
        aliquota: (totalAtual / valor) * 100
      },
      tributosReforma: {
        cbs,
        ibs,
        total: totalReforma,
        aliquota: (totalReforma / valor) * 100
      },
      diferenca,
      percentualMudanca
    })

    setSimulacoesRestantes(prev => prev - 1)
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) {
      value = (parseInt(value) / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
    setValorProduto(value)
  }

  return (
    <section id="simulador" className="py-20 bg-dark-900">
      <div className="container mx-auto px-4">
        {/* Header da secao */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-4">
            <Calculator size={16} />
            Simulador Gratuito
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simule o Impacto da Reforma
          </h2>
          <p className="text-dark-300 max-w-2xl mx-auto">
            Compare os tributos atuais (ICMS, PIS, COFINS) com o novo sistema IBS/CBS.
            Voce tem <span className="text-accent-400 font-bold">{simulacoesRestantes} simulacoes gratuitas</span>.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-dark-800 rounded-2xl p-6 md:p-8 border border-dark-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-primary-400" />
              Dados da Nota Fiscal
            </h3>

            <div className="space-y-5">
              {/* Valor do Produto */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Valor do Produto/Servico
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">R$</span>
                  <input
                    type="text"
                    value={valorProduto}
                    onChange={handleValorChange}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* NCM */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  NCM do Produto (opcional)
                </label>
                <input
                  type="text"
                  value={ncm}
                  onChange={(e) => setNcm(e.target.value)}
                  placeholder="Ex: 8471.30.19"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                />
              </div>

              {/* UF e Tipo de Empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Estado (UF)
                  </label>
                  <select
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  >
                    <option value="GO">GO - Goias</option>
                    <option value="SP">SP - Sao Paulo</option>
                    <option value="RJ">RJ - Rio de Janeiro</option>
                    <option value="MG">MG - Minas Gerais</option>
                    <option value="PR">PR - Parana</option>
                    <option value="RS">RS - Rio Grande do Sul</option>
                    <option value="BA">BA - Bahia</option>
                    <option value="SC">SC - Santa Catarina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Regime Tributario
                  </label>
                  <select
                    value={tipoEmpresa}
                    onChange={(e) => setTipoEmpresa(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  >
                    <option value="lucro_real">Lucro Real</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="simples">Simples Nacional</option>
                    <option value="mei">MEI</option>
                  </select>
                </div>
              </div>

              {/* Botao de Simular */}
              <button
                type="button"
                onClick={calcularSimulacao}
                disabled={!valorProduto || simulacoesRestantes <= 0}
                className="w-full py-4 bg-accent-500 hover:bg-accent-600 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                {simulacoesRestantes > 0 ? 'Calcular Simulacao' : 'Limite de simulacoes atingido'}
              </button>

              {simulacoesRestantes <= 0 && (
                <div className="flex items-start gap-3 p-4 bg-accent-500/10 border border-accent-500/20 rounded-xl">
                  <AlertCircle size={20} className="text-accent-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-accent-300 font-medium">Simulacoes esgotadas</p>
                    <p className="text-dark-300 text-sm mt-1">
                      Assine um plano para simulacoes ilimitadas e relatorios completos.
                    </p>
                    <a href="#planos" className="text-accent-400 text-sm font-medium hover:underline">
                      Ver planos →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Resultado */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-dark-800 rounded-2xl p-6 md:p-8 border border-dark-700"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-400" />
              Resultado da Simulacao
            </h3>

            {resultado ? (
              <div className="space-y-6">
                {/* Valor base */}
                <div className="text-center p-4 bg-dark-700/50 rounded-xl">
                  <p className="text-dark-300 text-sm">Valor do Produto</p>
                  <p className="text-3xl font-bold text-white">{formatarMoeda(resultado.valorProduto)}</p>
                </div>

                {/* Comparativo */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Sistema Atual */}
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-300 text-sm font-medium mb-3">Sistema Atual</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-300">ICMS</span>
                        <span className="text-white">{formatarMoeda(resultado.tributosAtuais.icms)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-300">PIS</span>
                        <span className="text-white">{formatarMoeda(resultado.tributosAtuais.pis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-300">COFINS</span>
                        <span className="text-white">{formatarMoeda(resultado.tributosAtuais.cofins)}</span>
                      </div>
                      <div className="pt-2 border-t border-red-500/20 flex justify-between font-bold">
                        <span className="text-red-300">Total</span>
                        <span className="text-red-400">{formatarMoeda(resultado.tributosAtuais.total)}</span>
                      </div>
                    </div>
                    <p className="text-red-400 text-xs mt-2 text-center">
                      {resultado.tributosAtuais.aliquota.toFixed(1)}% de carga tributaria
                    </p>
                  </div>

                  {/* Reforma 2033 */}
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-300 text-sm font-medium mb-3">Reforma 2033</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-dark-300">CBS</span>
                        <span className="text-white">{formatarMoeda(resultado.tributosReforma.cbs)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-300">IBS</span>
                        <span className="text-white">{formatarMoeda(resultado.tributosReforma.ibs)}</span>
                      </div>
                      <div className="flex justify-between opacity-0">
                        <span>-</span>
                        <span>-</span>
                      </div>
                      <div className="pt-2 border-t border-green-500/20 flex justify-between font-bold">
                        <span className="text-green-300">Total</span>
                        <span className="text-green-400">{formatarMoeda(resultado.tributosReforma.total)}</span>
                      </div>
                    </div>
                    <p className="text-green-400 text-xs mt-2 text-center">
                      {resultado.tributosReforma.aliquota.toFixed(1)}% de carga tributaria
                    </p>
                  </div>
                </div>

                {/* Diferenca */}
                <div className={`p-4 rounded-xl border ${resultado.diferenca > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {resultado.diferenca > 0 ? (
                        <TrendingDown size={24} className="text-green-400" />
                      ) : (
                        <TrendingUp size={24} className="text-red-400" />
                      )}
                      <span className={resultado.diferenca > 0 ? 'text-green-300' : 'text-red-300'}>
                        {resultado.diferenca > 0 ? 'Economia' : 'Aumento'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${resultado.diferenca > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatarMoeda(Math.abs(resultado.diferenca))}
                      </p>
                      <p className={`text-sm ${resultado.diferenca > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {Math.abs(resultado.percentualMudanca).toFixed(1)}% {resultado.diferenca > 0 ? 'menor' : 'maior'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA para relatorio completo */}
                <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-primary-300 font-medium">Quer um relatorio completo?</p>
                      <p className="text-dark-300 text-sm mt-1">
                        Inclui cronograma de transicao, setores com reducao e recomendacoes personalizadas.
                      </p>
                      <a href="#planos" className="inline-block mt-2 text-primary-400 text-sm font-medium hover:underline">
                        Assinar plano →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mb-4">
                  <Calculator size={32} className="text-dark-400" />
                </div>
                <p className="text-dark-300 mb-2">Nenhuma simulacao realizada</p>
                <p className="text-dark-400 text-sm max-w-xs">
                  Preencha os dados ao lado e clique em "Calcular Simulacao" para ver o resultado.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
