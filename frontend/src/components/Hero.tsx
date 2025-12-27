import { motion } from 'framer-motion'
import { Calculator, ArrowRight, CheckCircle, TrendingUp, Shield } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800" />

      {/* Circulos decorativos estilo Contta */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full border-4 border-primary-400/20" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border-4 border-primary-300/30" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full border-4 border-primary-400/20" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full border-4 border-primary-200/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteudo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/20 border border-accent-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              <span className="text-accent-300 text-sm font-medium">
                Reforma Tributaria 2026 - Prepare-se agora
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Calculadora
              <span className="block text-primary-200">IBS/CBS 2026</span>
            </h1>

            <p className="text-xl text-primary-100 mb-8 max-w-lg">
              Descubra o impacto da Reforma Tributaria na sua empresa.
              Simule impostos, compare cenarios e tome decisoes estrategicas.
            </p>

            {/* Features rapidas */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-2 text-primary-100">
                <CheckCircle size={20} className="text-accent-400" />
                <span>5 simulacoes gratis</span>
              </div>
              <div className="flex items-center gap-2 text-primary-100">
                <TrendingUp size={20} className="text-accent-400" />
                <span>Relatorios comparativos</span>
              </div>
              <div className="flex items-center gap-2 text-primary-100">
                <Shield size={20} className="text-accent-400" />
                <span>Dados protegidos</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#simulador"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-accent-500/30 hover:-translate-y-1"
              >
                <Calculator size={20} />
                Simular Agora - Gratis
                <ArrowRight size={20} />
              </a>
              <a
                href="#planos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
              >
                Ver Planos
              </a>
            </div>
          </motion.div>

          {/* Card Preview da Calculadora */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              {/* Header do card */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Simulacao Rapida</h3>
                <span className="px-3 py-1 bg-accent-500/20 text-accent-300 rounded-full text-sm">
                  Gratuito
                </span>
              </div>

              {/* Preview de resultado */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-primary-200 text-sm mb-1">Valor do Produto</p>
                  <p className="text-white text-2xl font-bold">R$ 1.000,00</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-primary-200 text-sm mb-1">Sistema Atual</p>
                    <p className="text-white text-xl font-bold">R$ 275,00</p>
                    <p className="text-red-400 text-sm">27,5% carga</p>
                  </div>
                  <div className="bg-accent-500/20 rounded-xl p-4 border border-accent-500/30">
                    <p className="text-primary-200 text-sm mb-1">Reforma 2033</p>
                    <p className="text-white text-xl font-bold">R$ 265,00</p>
                    <p className="text-green-400 text-sm">26,5% carga</p>
                  </div>
                </div>

                <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-green-300">Economia Potencial</span>
                    <span className="text-green-400 text-xl font-bold">R$ 10,00</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '36%' }} />
                  </div>
                </div>
              </div>

              {/* Cronograma visual */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-primary-200 text-sm mb-3">Transicao 2026-2033</p>
                <div className="flex justify-between text-xs text-primary-300">
                  <span>2026</span>
                  <span>2027</span>
                  <span>2029</span>
                  <span>2031</span>
                  <span>2033</span>
                </div>
                <div className="flex gap-1 mt-1">
                  <div className="flex-1 h-2 bg-primary-400 rounded-full" />
                  <div className="flex-1 h-2 bg-primary-500 rounded-full" />
                  <div className="flex-1 h-2 bg-primary-600 rounded-full" />
                  <div className="flex-1 h-2 bg-primary-700 rounded-full" />
                  <div className="flex-1 h-2 bg-accent-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#0f172a"
          />
        </svg>
      </div>
    </section>
  )
}
