import { motion } from 'framer-motion'
import {
  FileSpreadsheet,
  Calculator,
  TrendingUp,
  Shield,
  Clock,
  RefreshCw,
  FileText,
  BarChart3
} from 'lucide-react'

const recursos = [
  {
    icon: Calculator,
    titulo: 'Simulador NF-e',
    descricao: 'Simule o impacto da reforma em qualquer nota fiscal. Compare ICMS, PIS, COFINS com CBS e IBS.',
    destaque: true
  },
  {
    icon: FileSpreadsheet,
    titulo: 'Importador PGDAS-D',
    descricao: 'Importe o PDF do PGDAS-D e veja automaticamente como seus impostos mudarao no Simples Nacional.'
  },
  {
    icon: FileText,
    titulo: 'SPED Fiscal e Contribuicoes',
    descricao: 'Analise seus arquivos SPED para uma visao completa da transicao tributaria.'
  },
  {
    icon: TrendingUp,
    titulo: 'Dashboard Comparativo',
    descricao: 'Visualize graficos e relatorios comparando o cenario atual com 2026, 2029 e 2033.'
  },
  {
    icon: Clock,
    titulo: 'Cronograma de Transicao',
    descricao: 'Acompanhe o calendario oficial da reforma: 2026 (teste), 2027-2032 (transicao), 2033 (definitivo).'
  },
  {
    icon: RefreshCw,
    titulo: 'Atualizacoes Automaticas',
    descricao: 'Sistema atualizado conforme novas regulamentacoes e decretos da Receita Federal.'
  },
  {
    icon: BarChart3,
    titulo: 'Relatorios Personalizados',
    descricao: 'Gere relatorios em PDF para apresentar aos clientes com sua marca e logotipo.'
  },
  {
    icon: Shield,
    titulo: 'Seguranca LGPD',
    descricao: 'Dados criptografados e em conformidade com a Lei Geral de Protecao de Dados.'
  }
]

export function Recursos() {
  return (
    <section id="recursos" className="py-20 bg-dark-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-4">
            <BarChart3 size={16} />
            Recursos Completos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tudo que voce precisa para a Reforma
          </h2>
          <p className="text-dark-300 max-w-2xl mx-auto">
            Ferramentas profissionais para contadores e empresarios se prepararem
            para a maior mudanca tributaria do Brasil.
          </p>
        </motion.div>

        {/* Grid de recursos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recursos.map((recurso, index) => (
            <motion.div
              key={recurso.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 ${
                recurso.destaque
                  ? 'bg-gradient-to-br from-primary-600/20 to-primary-700/20 border-primary-500/30'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                recurso.destaque ? 'bg-primary-500' : 'bg-dark-700'
              }`}>
                <recurso.icon size={24} className={recurso.destaque ? 'text-white' : 'text-primary-400'} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{recurso.titulo}</h3>
              <p className="text-dark-300 text-sm leading-relaxed">{recurso.descricao}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="#simulador"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
          >
            <Calculator size={20} />
            Experimentar Gratis
          </a>
        </motion.div>
      </div>
    </section>
  )
}
