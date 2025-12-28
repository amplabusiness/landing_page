import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { CalculadoraImpacto } from './components/CalculadoraImpacto'
import { NoticiasReforma } from './components/NoticiasReforma'
import { GerenciadorCreditos } from './components/GerenciadorCreditos'
import './index.css'

// Funcao para inserir lead
async function insertLeadReforma(data: {
  nome: string
  email: string
  whatsapp: string
  cnpj: string
  tipo_usuario: string
}) {
  const { data: result, error } = await supabase
    .from('leads_reforma')
    .insert([{
      nome: data.nome,
      email: data.email,
      telefone: data.whatsapp,
      cnpj: data.cnpj.replace(/\D/g, ''),
      origem: 'landing_page',
      created_at: new Date().toISOString()
    }])
    .select()

  if (error) {
    console.error('Erro ao inserir lead:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: result }
}

export default function App() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 })
  const [tipoUsuario, setTipoUsuario] = useState('empresario')
  const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '', cnpj: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Countdown para 01/01/2026
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date('2026-01-01T00:00:00').getTime()
      const now = new Date().getTime()
      const diff = target - now

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCNPJ = (value: string) => {
    return value.replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  const formatWhatsApp = (value: string) => {
    return value.replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formatted = value
    if (name === 'cnpj') formatted = formatCNPJ(value)
    if (name === 'whatsapp') formatted = formatWhatsApp(value)
    setFormData(prev => ({ ...prev, [name]: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await insertLeadReforma({ ...formData, tipo_usuario: tipoUsuario })

    if (result.success) {
      setSuccess(true)
      setFormData({ nome: '', email: '', whatsapp: '', cnpj: '' })
    } else {
      setError('Erro ao enviar. Tente novamente.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-contta-400 rounded-2xl p-10 text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Cadastro realizado!</h2>
          <p className="text-slate-300 mb-6">Em breve voce recebera sua analise de impacto da Reforma Tributaria.</p>
          <button type="button" onClick={() => setSuccess(false)} className="gradient-contta text-white px-6 py-3 rounded-full font-medium">
            Fazer nova analise
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg py-3 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#">
            <img src="/logo-contta.png" alt="Contta" className="h-14" />
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#calculadora" className="text-slate-300 hover:text-white transition-colors">Calculadora</a>
            <a href="#creditos" className="text-slate-300 hover:text-white transition-colors">Creditos IBS/CBS</a>
            <a href="#planos" className="text-slate-300 hover:text-white transition-colors">Planos</a>
            <a href="#teste" className="gradient-contta text-white px-5 py-2.5 rounded-full font-medium hover:opacity-90">
              Teste Gratis
            </a>
          </div>
          <a href="#teste" className="md:hidden gradient-contta text-white px-4 py-2 rounded-full text-sm font-medium">
            Teste Gratis
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-contta-900/30 to-slate-950">
          <div className="absolute top-20 left-10 w-72 h-72 border-[3px] border-contta-500/20 rounded-full"></div>
          <div className="absolute top-40 left-32 w-96 h-96 border-[3px] border-contta-400/15 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 border-[3px] border-contta-300/20 rounded-full"></div>
          <div className="absolute bottom-40 right-40 w-64 h-64 border-[3px] border-contta-400/15 rounded-full"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-contta-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-contta-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-contta-500/20 backdrop-blur-sm border border-contta-400/30 px-4 py-2 rounded-full mb-8">
              <svg className="w-4 h-4 text-contta-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-sm text-slate-200">LC 214/2025 - Reforma Tributaria</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Descubra o impacto da
              <span className="text-gradient"> Reforma Tributaria</span>
              {' '}no seu negocio
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Faca uma analise gratuita e veja como IBS, CBS e Split Payment
              vao afetar sua empresa ou seus clientes.
            </p>

            {/* Countdown */}
            <div className="mb-10">
              <p className="text-slate-400 text-sm mb-4">Tempo ate a entrada em vigor:</p>
              <div className="flex gap-3 justify-center">
                {[
                  { value: countdown.days, label: 'Dias' },
                  { value: countdown.hours, label: 'Horas' },
                  { value: countdown.mins, label: 'Min' },
                  { value: countdown.secs, label: 'Seg' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-contta-500/20 backdrop-blur-sm border border-contta-400/30 rounded-xl px-4 py-3 min-w-[70px]">
                      <span className="text-3xl font-bold text-gradient">
                        {String(item.value).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#teste" className="group gradient-contta text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-contta-500/25">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Sou Empresario
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
              <a href="#teste" className="group bg-white/10 backdrop-blur-sm border border-contta-400/30 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Sou Contador
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-contta-400 font-semibold text-sm tracking-wider uppercase mb-4 block">O Desafio</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Por que voce precisa agir <span className="text-contta-300">agora</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A Reforma Tributaria nao e ajuste - e ruptura. Quem nao se preparar vai pagar mais e perder competitividade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', title: 'Split Payment obrigatorio', desc: 'O imposto sera retido automaticamente no pagamento. Seu fluxo de caixa vai mudar.' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: '7 anos de transicao', desc: 'De 2026 a 2033, dois sistemas tributarios simultaneos. Complexidade dobrada.' },
              { icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title: 'Novas aliquotas por NCM', desc: 'Cada produto tera aliquota especifica. Precificacao errada = prejuizo certo.' },
              { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Contratos precisam mudar', desc: 'Clausulas tributarias antigas serao invalidas. Renegociacao urgente.' }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA DE IMPACTO */}
      <CalculadoraImpacto />

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-contta-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Como Funciona</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Analise em <span className="text-contta-300">3 passos</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', title: 'Informe seu CNPJ', desc: 'Buscamos automaticamente os dados da sua empresa: CNAE, regime tributario e porte.' },
              { num: '02', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', title: 'Calculamos o impacto', desc: 'Usamos a calculadora oficial do SERPRO para simular IBS e CBS no seu negocio.' },
              { num: '03', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', title: 'Receba o relatorio', desc: 'Veja o impacto estimado e recomendacoes para se preparar para a mudanca.' }
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-contta-400/50 to-transparent"></div>}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-contta-400/50 transition-all">
                  <span className="text-5xl font-bold text-contta-500/30">{item.num}</span>
                  <div className="w-14 h-14 rounded-xl bg-contta-500/10 flex items-center justify-center mt-4 mb-4">
                    <svg className="w-7 h-7 text-contta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon}/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GERENCIADOR DE CREDITOS IBS/CBS */}
      <GerenciadorCreditos />

      {/* PLANOS */}
      <section id="planos" className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-contta-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Planos</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Escolha o plano ideal</h2>
            <p className="text-slate-400 text-lg">Comece gratis e evolua conforme sua necessidade</p>
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-400 font-bold">50% OFF - Lancamento</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Teste */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600 transition-all">
              <h3 className="text-xl font-bold mb-2">Teste</h3>
              <p className="text-slate-400 text-sm mb-4">Para conhecer a ferramenta</p>
              <div className="mb-6"><span className="text-4xl font-bold">Gratis</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-contta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300 text-sm">5 analises por CNPJ</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-contta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  <span className="text-slate-300 text-sm">Resultado na tela</span>
                </li>
                <li className="flex items-center gap-2 opacity-50">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  <span className="text-slate-500 text-sm">Salvar historico</span>
                </li>
              </ul>
              <a href="#teste" className="block text-center py-3 px-6 rounded-full font-medium bg-slate-700 hover:bg-slate-600 transition-colors">
                Comecar Gratis
              </a>
            </div>

            {/* Plano Profissional */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-contta-400/50 transition-all">
              <h3 className="text-xl font-bold mb-2">Profissional</h3>
              <p className="text-slate-400 text-sm mb-4">Para empresarios</p>
              <div className="mb-6">
                <span className="text-slate-500 line-through text-sm">R$ 97</span>
                <span className="text-4xl font-bold ml-2">R$ 47</span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Ate 10 empresas', 'Historico de analises', 'Relatorio PDF', 'Alertas de legislacao'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-contta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#teste" className="block text-center py-3 px-6 rounded-full font-medium gradient-contta hover:opacity-90 transition-opacity">
                Assinar
              </a>
            </div>

            {/* Plano Escritorio */}
            <div className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-contta-400 rounded-2xl p-8 shadow-lg shadow-contta-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-contta text-white text-sm font-medium px-4 py-1 rounded-full">
                Mais Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Escritorio</h3>
              <p className="text-slate-400 text-sm mb-4">Para contadores</p>
              <div className="mb-6">
                <span className="text-slate-500 line-through text-sm">R$ 297</span>
                <span className="text-4xl font-bold ml-2">R$ 147</span>
                <span className="text-slate-400">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Ate 50 empresas', 'Tudo do Profissional', 'MCP Consultor IA 24/7', 'Upload de XMLs NF-e', 'API de integracao'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-contta-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#teste" className="block text-center py-3 px-6 rounded-full font-medium gradient-contta hover:opacity-90 transition-opacity">
                Assinar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NOTICIAS DA REFORMA */}
      <NoticiasReforma />

      {/* FORMULARIO */}
      <section id="teste" className="py-20 bg-slate-950">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-contta-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Teste Gratis</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Faca sua analise de impacto</h2>
            <p className="text-slate-400">Preencha o formulario e descubra como a Reforma vai afetar seu negocio.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">Eu sou:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTipoUsuario('empresario')}
                  className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    tipoUsuario === 'empresario'
                      ? 'border-2 border-contta-400 bg-contta-500/10 text-contta-300'
                      : 'border border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  Empresario
                </button>
                <button
                  type="button"
                  onClick={() => setTipoUsuario('contador')}
                  className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    tipoUsuario === 'contador'
                      ? 'border-2 border-contta-400 bg-contta-500/10 text-contta-300'
                      : 'border border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Contador
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-contta-400 focus:ring-1 focus:ring-contta-400 outline-none"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-contta-400 focus:ring-1 focus:ring-contta-400 outline-none"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-contta-400 focus:ring-1 focus:ring-contta-400 outline-none"
                  placeholder="(62) 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ da empresa</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-contta-400 focus:ring-1 focus:ring-contta-400 outline-none"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 gradient-contta text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  Analisar Impacto Gratis
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </>
              )}
            </button>

            <p className="text-center text-slate-500 text-sm mt-4">
              Seus dados estao seguros. Nao compartilhamos com terceiros.
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-8">
            <img src="/footer-contta.png" alt="Contta" className="max-w-full md:max-w-2xl h-auto" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-sm">2025 Contta Inteligencia Fiscal. Todos os direitos reservados.</p>
            <p className="text-slate-500 text-sm">
              Desenvolvido por <a href="https://amplabusiness.com.br" className="text-contta-400 hover:underline">AMPLA Contabilidade</a>
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/5562993430069?text=Ola! Vim pelo site Contta e quero saber mais sobre a analise de impacto da Reforma Tributaria."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
