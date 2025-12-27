import { motion } from 'framer-motion'
import { Check, Zap, Building2, Rocket, ArrowRight } from 'lucide-react'
import { PLANOS } from '../lib/stripe'

const icones = {
  profissional: Zap,
  escritorio: Building2,
  enterprise: Rocket
}

export function Planos() {
  const planosArray = Object.values(PLANOS)

  return (
    <section id="planos" className="py-20 bg-dark-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Badge de promocao */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 border border-accent-500/30 rounded-full mb-4">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            <span className="text-accent-300 text-sm font-bold">
              LANCAMENTO - 50% OFF em todos os planos
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-dark-300 max-w-2xl mx-auto">
            Todos os planos incluem acesso completo a calculadora IBS/CBS 2026,
            atualizacoes automaticas e suporte tecnico.
          </p>
        </motion.div>

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planosArray.map((plano, index) => {
            const Icone = icones[plano.id as keyof typeof icones]
            const isDestaque = 'destaque' in plano && plano.destaque

            return (
              <motion.div
                key={plano.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  isDestaque
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 border-2 border-primary-400'
                    : 'bg-dark-800 border border-dark-700'
                }`}
              >
                {/* Badge destaque */}
                {isDestaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-accent-500 text-white text-sm font-bold rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}

                {/* Icone e nome */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isDestaque ? 'bg-white/20' : 'bg-primary-500/20'}`}>
                    <Icone size={24} className={isDestaque ? 'text-white' : 'text-primary-400'} />
                  </div>
                  <h3 className={`text-xl font-bold ${isDestaque ? 'text-white' : 'text-white'}`}>
                    {plano.nome}
                  </h3>
                </div>

                {/* Preco */}
                <div className="mb-6">
                  {/* Preco original riscado */}
                  {'precoOriginal' in plano && (
                    <p className={`text-sm line-through ${isDestaque ? 'text-white/50' : 'text-dark-400'}`}>
                      De R$ {plano.precoOriginal}/mes
                    </p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${isDestaque ? 'text-white' : 'text-white'}`}>
                      R$ {plano.preco}
                    </span>
                    <span className={isDestaque ? 'text-white/70' : 'text-dark-400'}>/mes</span>
                  </div>
                  <p className={`text-sm mt-1 ${isDestaque ? 'text-primary-200' : 'text-dark-400'}`}>
                    {plano.empresas === 999 ? 'Empresas ilimitadas' : `Ate ${plano.empresas} empresas`}
                  </p>
                </div>

                {/* Recursos */}
                <ul className="space-y-3 mb-8">
                  {plano.recursos.map((recurso, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${
                          isDestaque ? 'text-accent-300' : 'text-primary-400'
                        }`}
                      />
                      <span className={isDestaque ? 'text-white/90' : 'text-dark-200'}>
                        {recurso}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Botao */}
                <a
                  href={`#checkout-${plano.id}`}
                  className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    isDestaque
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  Assinar Agora
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            )
          })}
        </div>

        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-dark-400 text-sm">
            Garantia de 7 dias. Cancele a qualquer momento. Sem fidelidade.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
