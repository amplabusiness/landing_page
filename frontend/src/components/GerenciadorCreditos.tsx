import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt, Plus, Trash2, Calculator, TrendingUp, TrendingDown,
  DollarSign, FileText, CheckCircle, AlertCircle, Info,
  ChevronDown, ChevronUp, Loader2, PieChart
} from 'lucide-react'
import { supabase } from '../lib/supabase'

// Categorias de despesas padrão
const CATEGORIAS = [
  { codigo: 'FOLHA', nome: 'Folha de pagamento', geraCredito: false, icone: '👥' },
  { codigo: 'ALUGUEL', nome: 'Aluguel', geraCredito: true, aliquota: 26.5, icone: '🏢' },
  { codigo: 'ENERGIA', nome: 'Energia elétrica', geraCredito: true, aliquota: 26.5, icone: '⚡' },
  { codigo: 'TELECOM', nome: 'Internet e telefonia', geraCredito: true, aliquota: 26.5, icone: '📱' },
  { codigo: 'MATERIAL', nome: 'Material de escritório', geraCredito: true, aliquota: 26.5, icone: '📎' },
  { codigo: 'SOFTWARE', nome: 'Softwares e licenças', geraCredito: true, aliquota: 26.5, icone: '💻' },
  { codigo: 'MANUTENCAO', nome: 'Manutenção', geraCredito: true, aliquota: 26.5, icone: '🔧' },
  { codigo: 'LIMPEZA', nome: 'Limpeza e conservação', geraCredito: true, aliquota: 26.5, icone: '🧹' },
  { codigo: 'MARKETING', nome: 'Marketing', geraCredito: true, aliquota: 26.5, icone: '📢' },
  { codigo: 'CAPACITACAO', nome: 'Capacitação', geraCredito: true, aliquota: 26.5, icone: '📚' },
  { codigo: 'VT', nome: 'Vale transporte', geraCredito: true, aliquota: 26.5, condicao: 'Acordo coletivo', icone: '🚌' },
  { codigo: 'VR', nome: 'Vale refeição', geraCredito: true, aliquota: 26.5, condicao: 'Acordo coletivo', icone: '🍽️' },
  { codigo: 'PLANO_SAUDE', nome: 'Plano de saúde', geraCredito: true, aliquota: 10.6, reducao: 60, icone: '🏥' },
  { codigo: 'TERCEIRIZADOS', nome: 'Serviços terceirizados', geraCredito: true, aliquota: 26.5, icone: '🤝' },
]

interface Despesa {
  id: string
  categoria: string
  descricao: string
  valorSemTributos: number
  valorComTributos: number
  creditoIva: number
}

interface Resultado {
  totalDespesas: number
  totalCreditos: number
  receita: number
  debitoIva: number
  valorRecolher: number
  aliquotaEfetiva: number
  reducaoPercentual: number
  comparativoAtual: {
    pisCofinsCumulativo: number
    iss: number
    irpjCsll: number
    totalAtual: number
  }
  aumento: number
  aumentoPercentual: number
}

export function GerenciadorCreditos() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [receita, setReceita] = useState('')
  const [reducaoAliquota, setReducaoAliquota] = useState(0) // 0, 30 ou 60
  const [regime, setRegime] = useState('lucro_presumido')
  const [presuncao, setPresuncao] = useState(32) // Base presumida %

  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [mostrarDetalhe, setMostrarDetalhe] = useState(false)

  // Adicionar despesa
  function adicionarDespesa() {
    const novaDespesa: Despesa = {
      id: crypto.randomUUID(),
      categoria: 'ALUGUEL',
      descricao: '',
      valorSemTributos: 0,
      valorComTributos: 0,
      creditoIva: 0,
    }
    setDespesas([...despesas, novaDespesa])
  }

  // Remover despesa
  function removerDespesa(id: string) {
    setDespesas(despesas.filter(d => d.id !== id))
  }

  // Atualizar despesa
  function atualizarDespesa(id: string, campo: keyof Despesa, valor: string | number) {
    setDespesas(despesas.map(d => {
      if (d.id !== id) return d

      const updated = { ...d, [campo]: valor }

      // Recalcular crédito quando valor mudar
      if (campo === 'valorComTributos' || campo === 'categoria') {
        const cat = CATEGORIAS.find(c => c.codigo === (campo === 'categoria' ? valor : d.categoria))
        if (cat?.geraCredito) {
          const valorNum = campo === 'valorComTributos' ? Number(valor) : d.valorComTributos
          const aliquota = cat.aliquota || 26.5
          const valorSemTrib = valorNum / (1 + aliquota / 100)
          updated.valorSemTributos = valorSemTrib
          updated.creditoIva = valorNum - valorSemTrib
        } else {
          updated.valorSemTributos = Number(campo === 'valorComTributos' ? valor : d.valorComTributos)
          updated.creditoIva = 0
        }
      }

      return updated
    }))
  }

  // Calcular resultado
  function calcular() {
    setLoading(true)

    const receitaNum = parseFloat(receita.replace(/\D/g, '')) / 100

    // Alíquotas com redução
    const aliquotaIbs = 17.7 * (1 - reducaoAliquota / 100)
    const aliquotaCbs = 8.8 * (1 - reducaoAliquota / 100)
    const aliquotaTotal = aliquotaIbs + aliquotaCbs

    // Calcular débito
    const debitoIva = receitaNum * (aliquotaTotal / 100)

    // Calcular créditos
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valorComTributos, 0)
    const totalCreditos = despesas.reduce((acc, d) => acc + d.creditoIva, 0)

    // Valor a recolher
    const valorRecolher = Math.max(0, debitoIva - totalCreditos)
    const aliquotaEfetiva = receitaNum > 0 ? (valorRecolher / receitaNum) * 100 : 0

    // Comparativo com regime atual (Lucro Presumido)
    const pisCofinsCumulativo = receitaNum * 0.0365 // 0.65% + 3%
    const iss = 0 // Depende do serviço
    const irpjCsll = receitaNum * (presuncao / 100) * 0.24 // 15% IRPJ + 9% CSLL
    const totalAtual = pisCofinsCumulativo + iss + irpjCsll

    // Aumento
    const aumento = valorRecolher - totalAtual
    const aumentoPercentual = totalAtual > 0 ? (aumento / totalAtual) * 100 : 0

    setResultado({
      totalDespesas,
      totalCreditos,
      receita: receitaNum,
      debitoIva,
      valorRecolher,
      aliquotaEfetiva,
      reducaoPercentual: ((debitoIva - valorRecolher) / debitoIva) * 100,
      comparativoAtual: {
        pisCofinsCumulativo,
        iss,
        irpjCsll,
        totalAtual,
      },
      aumento,
      aumentoPercentual,
    })

    setLoading(false)
    setMostrarDetalhe(true)
  }

  // Carregar exemplo do escritório contábil
  function carregarExemplo() {
    setReceita('R$ 280.000,00')
    setReducaoAliquota(30) // 30% redução para serviços contábeis
    setPresuncao(32)
    setDespesas([
      { id: '1', categoria: 'FOLHA', descricao: 'Salários e encargos', valorSemTributos: 120000, valorComTributos: 120000, creditoIva: 0 },
      { id: '2', categoria: 'ALUGUEL', descricao: 'Aluguel escritório', valorSemTributos: 9375, valorComTributos: 12000, creditoIva: 2625 },
      { id: '3', categoria: 'ENERGIA', descricao: 'Conta de luz', valorSemTributos: 1172, valorComTributos: 1500, creditoIva: 328 },
      { id: '4', categoria: 'TELECOM', descricao: 'Internet e telefone', valorSemTributos: 625, valorComTributos: 800, creditoIva: 175 },
      { id: '5', categoria: 'MATERIAL', descricao: 'Material escritório', valorSemTributos: 938, valorComTributos: 1200, creditoIva: 262 },
      { id: '6', categoria: 'SOFTWARE', descricao: 'Sistemas contábeis', valorSemTributos: 4688, valorComTributos: 6000, creditoIva: 1312 },
      { id: '7', categoria: 'MANUTENCAO', descricao: 'Manutenção equipamentos', valorSemTributos: 391, valorComTributos: 500, creditoIva: 109 },
      { id: '8', categoria: 'LIMPEZA', descricao: 'Limpeza', valorSemTributos: 781, valorComTributos: 1000, creditoIva: 219 },
      { id: '9', categoria: 'MARKETING', descricao: 'Marketing digital', valorSemTributos: 2344, valorComTributos: 3000, creditoIva: 656 },
      { id: '10', categoria: 'CAPACITACAO', descricao: 'Cursos e treinamentos', valorSemTributos: 1563, valorComTributos: 2000, creditoIva: 437 },
      { id: '11', categoria: 'VT', descricao: 'Vale transporte', valorSemTributos: 2734, valorComTributos: 3500, creditoIva: 766 },
      { id: '12', categoria: 'VR', descricao: 'Vale refeição', valorSemTributos: 4688, valorComTributos: 6000, creditoIva: 1312 },
      { id: '13', categoria: 'PLANO_SAUDE', descricao: 'Plano de saúde', valorSemTributos: 7195, valorComTributos: 8000, creditoIva: 805 },
      { id: '14', categoria: 'TERCEIRIZADOS', descricao: 'Serviços terceiros', valorSemTributos: 3125, valorComTributos: 4000, creditoIva: 875 },
    ])
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarInputMoeda(valor: string) {
    const numero = valor.replace(/\D/g, '')
    const valorNumerico = parseInt(numero || '0') / 100
    return valorNumerico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <section id="creditos" className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-4">
            <Receipt size={16} />
            <span>Não Cumulatividade Plena - Art. 47 LC 214/2025</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simulador de Créditos IBS/CBS
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Calcule seus créditos tributários e veja o impacto real da reforma.
            O novo sistema permite compensação integral dos créditos.
          </p>

          <button
            onClick={carregarExemplo}
            className="mt-4 text-contta-400 hover:text-contta-300 text-sm underline"
          >
            Carregar exemplo: Escritório de Contabilidade
          </button>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Configuração */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Configuração</h3>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Receita */}
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-contta-500 outline-none"
                  />
                </div>
              </div>

              {/* Redução de alíquota */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Redução de Alíquota
                </label>
                <select
                  value={reducaoAliquota}
                  onChange={(e) => setReducaoAliquota(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-contta-500 outline-none"
                >
                  <option value={0}>Sem redução (26,5%)</option>
                  <option value={30}>30% redução (18,55%) - Contabilidade</option>
                  <option value={60}>60% redução (10,6%) - Saúde/Educação</option>
                </select>
              </div>

              {/* Base presumida */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Base Presumida IRPJ/CSLL
                </label>
                <select
                  value={presuncao}
                  onChange={(e) => setPresuncao(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-contta-500 outline-none"
                >
                  <option value={8}>8% - Comércio/Indústria</option>
                  <option value={16}>16% - Transporte passageiros</option>
                  <option value={32}>32% - Serviços em geral</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Despesas */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Despesas Mensais</h3>
              <button
                onClick={adicionarDespesa}
                className="flex items-center gap-2 bg-contta-500 hover:bg-contta-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar
              </button>
            </div>

            {despesas.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                <p>Nenhuma despesa cadastrada</p>
                <p className="text-sm">Clique em "Adicionar" ou carregue o exemplo</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400 text-sm border-b border-slate-700">
                      <th className="text-left py-3 px-2">Categoria</th>
                      <th className="text-left py-3 px-2">Descrição</th>
                      <th className="text-right py-3 px-2">Valor s/ Tributos</th>
                      <th className="text-right py-3 px-2">Valor c/ Tributos</th>
                      <th className="text-right py-3 px-2">Crédito IVA</th>
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas.map((despesa) => {
                      const cat = CATEGORIAS.find(c => c.codigo === despesa.categoria)
                      return (
                        <tr key={despesa.id} className="border-b border-slate-700/50">
                          <td className="py-3 px-2">
                            <select
                              value={despesa.categoria}
                              onChange={(e) => atualizarDespesa(despesa.id, 'categoria', e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm w-full"
                            >
                              {CATEGORIAS.map((c) => (
                                <option key={c.codigo} value={c.codigo}>
                                  {c.icone} {c.nome}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              value={despesa.descricao}
                              onChange={(e) => atualizarDespesa(despesa.id, 'descricao', e.target.value)}
                              placeholder="Descrição"
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm w-full"
                            />
                          </td>
                          <td className="py-3 px-2 text-right text-slate-300">
                            {formatarMoeda(despesa.valorSemTributos)}
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={despesa.valorComTributos || ''}
                              onChange={(e) => atualizarDespesa(despesa.id, 'valorComTributos', e.target.value)}
                              placeholder="0,00"
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm w-24 text-right"
                            />
                          </td>
                          <td className="py-3 px-2 text-right">
                            {cat?.geraCredito ? (
                              <span className="text-green-400 font-medium">
                                {formatarMoeda(despesa.creditoIva)}
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => removerDespesa(despesa.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-600 font-semibold">
                      <td colSpan={2} className="py-3 px-2 text-white">TOTAL</td>
                      <td className="py-3 px-2 text-right text-slate-300">
                        {formatarMoeda(despesas.reduce((acc, d) => acc + d.valorSemTributos, 0))}
                      </td>
                      <td className="py-3 px-2 text-right text-white">
                        {formatarMoeda(despesas.reduce((acc, d) => acc + d.valorComTributos, 0))}
                      </td>
                      <td className="py-3 px-2 text-right text-green-400">
                        {formatarMoeda(despesas.reduce((acc, d) => acc + d.creditoIva, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
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
                Calcular Apuração
              </>
            )}
          </button>

          {/* Resultado */}
          <AnimatePresence>
            {resultado && mostrarDetalhe && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 space-y-6"
              >
                {/* Cards de Resultado */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <p className="text-slate-400 text-sm mb-1">Débito IBS/CBS</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(resultado.debitoIva)}</p>
                    <p className="text-slate-500 text-xs">{(26.5 * (1 - reducaoAliquota / 100)).toFixed(1)}% sobre receita</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl border border-green-500/30 p-4">
                    <p className="text-green-400 text-sm mb-1">(-) Créditos</p>
                    <p className="text-2xl font-bold text-green-400">-{formatarMoeda(resultado.totalCreditos)}</p>
                    <p className="text-slate-500 text-xs">Não cumulatividade plena</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl border border-contta-400 p-4">
                    <p className="text-contta-400 text-sm mb-1">= Valor a Recolher</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(resultado.valorRecolher)}</p>
                    <p className="text-slate-500 text-xs">Alíquota efetiva: {resultado.aliquotaEfetiva.toFixed(2)}%</p>
                  </div>

                  <div className={`rounded-xl border p-4 ${resultado.aumento > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <p className={`text-sm mb-1 ${resultado.aumento > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {resultado.aumento > 0 ? 'Aumento' : 'Redução'}
                    </p>
                    <p className={`text-2xl font-bold ${resultado.aumento > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {resultado.aumento > 0 ? '+' : ''}{formatarMoeda(resultado.aumento)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {resultado.aumentoPercentual > 0 ? '+' : ''}{resultado.aumentoPercentual.toFixed(1)}% vs atual
                    </p>
                  </div>
                </div>

                {/* Comparativo Detalhado */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChart size={20} />
                    Comparativo Detalhado
                  </h4>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Regime Atual */}
                    <div>
                      <h5 className="text-contta-400 font-medium mb-3">Sistema Atual (Lucro Presumido)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">PIS (0,65%)</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * 0.0065)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">COFINS (3%)</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * 0.03)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">IRPJ ({presuncao}% x 15%)</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * (presuncao/100) * 0.15)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CSLL ({presuncao}% x 9%)</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * (presuncao/100) * 0.09)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700 font-semibold">
                          <span className="text-white">Total Atual</span>
                          <span className="text-white">{formatarMoeda(resultado.comparativoAtual.totalAtual)}</span>
                        </div>
                        <div className="text-slate-500 text-xs">
                          = {((resultado.comparativoAtual.totalAtual / resultado.receita) * 100).toFixed(2)}% da receita
                        </div>
                      </div>
                    </div>

                    {/* Novo Sistema */}
                    <div>
                      <h5 className="text-contta-400 font-medium mb-3">Novo Sistema (IBS/CBS)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">CBS (8,8%{reducaoAliquota > 0 ? ` - ${reducaoAliquota}%` : ''})</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * (8.8 * (1 - reducaoAliquota/100)) / 100)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">IBS (17,7%{reducaoAliquota > 0 ? ` - ${reducaoAliquota}%` : ''})</span>
                          <span className="text-slate-300">{formatarMoeda(resultado.receita * (17.7 * (1 - reducaoAliquota/100)) / 100)}</span>
                        </div>
                        <div className="flex justify-between text-green-400">
                          <span>(-) Créditos apropriados</span>
                          <span>-{formatarMoeda(resultado.totalCreditos)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700 font-semibold">
                          <span className="text-white">Total Novo</span>
                          <span className="text-white">{formatarMoeda(resultado.valorRecolher)}</span>
                        </div>
                        <div className="text-slate-500 text-xs">
                          = {resultado.aliquotaEfetiva.toFixed(2)}% da receita (alíquota efetiva)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explicação */}
                  <div className="mt-6 p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <Info size={18} className="text-contta-400 mt-0.5" />
                      <div className="text-sm text-slate-300">
                        <p className="font-medium text-white mb-2">Entenda o resultado:</p>
                        <p>
                          Com a não cumulatividade plena (Art. 47, LC 214/2025), sua empresa pode apropriar
                          <strong className="text-green-400"> {formatarMoeda(resultado.totalCreditos)}</strong> em créditos
                          sobre as despesas tributáveis, reduzindo a alíquota nominal de
                          <strong> {(26.5 * (1 - reducaoAliquota/100)).toFixed(1)}%</strong> para uma alíquota efetiva de
                          <strong className="text-contta-400"> {resultado.aliquotaEfetiva.toFixed(2)}%</strong>.
                        </p>
                        {resultado.aumento > 0 && (
                          <p className="mt-2 text-orange-400">
                            <AlertCircle size={14} className="inline mr-1" />
                            Mesmo assim, há um aumento de {formatarMoeda(resultado.aumento)} ({resultado.aumentoPercentual.toFixed(1)}%)
                            em relação ao sistema atual. Considere revisar a estrutura de custos para maximizar créditos.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
