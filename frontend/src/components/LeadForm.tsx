import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, User, Phone, Building2, Send, CheckCircle, Loader2 } from 'lucide-react'
import { capturarLead } from '../lib/supabase'

export function LeadForm() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await capturarLead({
        ...formData,
        origem: 'landing_page_contato'
      })
      setSuccess(true)
      setFormData({ nome: '', email: '', telefone: '', empresa: '' })
    } catch (err) {
      setError('Erro ao enviar. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section id="contato" className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 relative overflow-hidden">
      {/* Circulos decorativos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full border-4 border-white/10" />
        <div className="absolute top-10 right-10 w-48 h-48 rounded-full border-4 border-white/10" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Conteudo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Fale com um Especialista
              </h2>
              <p className="text-primary-100 mb-6">
                Tem duvidas sobre a Reforma Tributaria? Nossa equipe de contadores
                especializados pode ajudar sua empresa a se preparar.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-accent-300" />
                  </div>
                  <span className="text-white">Consultoria gratuita de 30 minutos</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-accent-300" />
                  </div>
                  <span className="text-white">Analise personalizada da sua empresa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-accent-300" />
                  </div>
                  <span className="text-white">Tire suas duvidas sobre IBS e CBS</span>
                </div>
              </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {success ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-dark-500 mb-4">
                    Nossa equipe entrara em contato em ate 24 horas.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-dark-900 mb-6">Solicite Contato</h3>

                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">Nome</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          placeholder="Seu nome completo"
                          className="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">E-mail</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="seu@email.com"
                          className="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">Telefone</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          placeholder="(00) 00000-0000"
                          className="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-1">Empresa</label>
                      <div className="relative">
                        <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleChange}
                          placeholder="Nome da empresa"
                          className="w-full pl-10 pr-4 py-3 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Botao */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Solicitar Contato
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-dark-400 mt-4 text-center">
                    Ao enviar, voce concorda com nossa politica de privacidade.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
