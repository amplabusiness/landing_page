# INSTRUÇÕES PARA CLAUDE CODE (VS CODE)

## CONTEXTO
Sou contador, não programador. Preciso que você faça TUDO automaticamente, sem me pedir confirmação. Execute comando por comando até terminar.

## OBJETIVO
Criar e deployar a landing page do Contta (plataforma de análise de impacto da Reforma Tributária LC 214/2025) com:
1. Frontend React + Tailwind hospedado no Vercel
2. Backend Supabase (PostgreSQL)
3. Domínio: contta.com.br

## CREDENCIAIS SUPABASE (já existente)
- URL: https://yqcsoljcoifznxzptrrr.supabase.co
- ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY3NvbGpjb2lmem54enB0cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTk2NjYsImV4cCI6MjA3OTMzNTY2Nn0.yUO6ZD86LAYX6qJk9OzorxABTZLdXdpGPhcX3ytop7I

## CONTA VERCEL
- Team: sergio-carneiro-leaos-projects
- Team ID: team_Gk3GdZZqDfESY29LEZUcRRdA

---

## PASSO 1: CRIAR PROJETO REACT

```bash
# Criar projeto
npm create vite@latest contta-landing -- --template react
cd contta-landing

# Instalar dependências
npm install
npm install @supabase/supabase-js lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

---

## PASSO 2: CONFIGURAR TAILWIND

Editar `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Editar `src/index.css`:
```css
@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #020617;
  color: #f1f5f9;
  margin: 0;
}
```

---

## PASSO 3: CRIAR CLIENTE SUPABASE

Criar arquivo `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yqcsoljcoifznxzptrrr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY3NvbGpjb2lmem54enB0cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTk2NjYsImV4cCI6MjA3OTMzNTY2Nn0.yUO6ZD86LAYX6qJk9OzorxABTZLdXdpGPhcX3ytop7I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const insertLeadReforma = async (leadData) => {
  const { data, error } = await supabase
    .from('leads_reforma')
    .insert([{
      nome: leadData.nome,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
      cnpj: leadData.cnpj,
      tipo_usuario: leadData.tipoUsuario,
      origem: 'landing_contta',
      status: 'novo'
    }])
    .select()
  
  if (error) throw error
  return data
}
```

---

## PASSO 4: CRIAR LANDING PAGE

Substituir TODO o conteúdo de `src/App.jsx` por:

```jsx
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  Building2, 
  Calculator,
  FileText,
  Clock,
  AlertTriangle,
  Sparkles,
  Check,
  MessageCircle,
  ChevronDown,
  Briefcase,
  TrendingUp,
  Users
} from 'lucide-react'
import { insertLeadReforma } from './lib/supabase'

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  
  useEffect(() => {
    const targetDate = new Date('2026-01-01T00:00:00')
    const timer = setInterval(() => {
      const now = new Date()
      const difference = targetDate - now
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="flex gap-3 justify-center">
      {[
        { value: timeLeft.days, label: 'Dias' },
        { value: timeLeft.hours, label: 'Horas' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Seg' }
      ].map((item, index) => (
        <div key={index} className="text-center">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl px-3 py-2 min-w-[60px]">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {String(item.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/90 backdrop-blur-lg py-3 shadow-lg' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="font-bold text-xl text-white">Contta</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-slate-300 hover:text-white transition-colors">Como Funciona</a>
          <a href="#planos" className="text-slate-300 hover:text-white transition-colors">Planos</a>
          <a href="#teste" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full font-medium transition-all">
            Teste Grátis
          </a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur border border-slate-700/50 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-200">LC 214/2025 — Reforma Tributária</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
            Descubra o impacto da{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Reforma Tributária
            </span>{' '}
            no seu negócio
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Faça uma análise gratuita e veja como IBS, CBS e Split Payment 
            vão afetar sua empresa ou seus clientes.
          </p>
          
          <div className="mb-10">
            <p className="text-slate-400 text-sm mb-4">Tempo até a entrada em vigor:</p>
            <Countdown />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#teste" className="group bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              <Building2 className="w-5 h-5" />
              Sou Empresário
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#teste" className="group bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              <Briefcase className="w-5 h-5" />
              Sou Contador
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-slate-400" />
      </div>
    </section>
  )
}

function ProblemaSection() {
  const problemas = [
    { icon: AlertTriangle, title: 'Split Payment obrigatório', description: 'O imposto será retido automaticamente no pagamento. Seu fluxo de caixa vai mudar.' },
    { icon: Clock, title: '7 anos de transição', description: 'De 2026 a 2033, dois sistemas tributários simultâneos. Complexidade dobrada.' },
    { icon: TrendingUp, title: 'Novas alíquotas por NCM', description: 'Cada produto terá alíquota específica. Precificação errada = prejuízo certo.' },
    { icon: Users, title: 'Contratos precisam mudar', description: 'Cláusulas tributárias antigas serão inválidas. Renegociação urgente.' }
  ]
  
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-4 block">O Desafio</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Por que você precisa agir <span className="text-emerald-400">agora</span>
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemas.map((problema, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <problema.icon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{problema.title}</h3>
              <p className="text-slate-400 text-sm">{problema.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComoFuncionaSection() {
  const passos = [
    { numero: '01', icon: Building2, title: 'Informe seu CNPJ', description: 'Buscamos automaticamente os dados da sua empresa.' },
    { numero: '02', icon: Calculator, title: 'Calculamos o impacto', description: 'Usamos a calculadora oficial do SERPRO.' },
    { numero: '03', icon: FileText, title: 'Receba o relatório', description: 'Veja o impacto estimado e recomendações.' }
  ]
  
  return (
    <section id="como-funciona" className="py-20 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Como Funciona</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Análise em <span className="text-emerald-400">3 passos</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {passos.map((passo, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/50 transition-all">
              <span className="text-5xl font-bold text-emerald-500/20">{passo.numero}</span>
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mt-4 mb-4">
                <passo.icon className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{passo.title}</h3>
              <p className="text-slate-400">{passo.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanosSection() {
  const planos = [
    {
      nome: 'Teste', preco: 'Grátis', periodo: '', descricao: 'Para conhecer',
      features: ['1 análise por CNPJ', 'Resultado na tela'],
      featuresMissing: ['Histórico', 'PDF', 'MCP IA'],
      cta: 'Começar Grátis', destaque: false, cor: 'slate'
    },
    {
      nome: 'Profissional', preco: 'R$ 97', periodo: '/mês', descricao: 'Para empresários',
      features: ['10 empresas', 'Histórico', 'PDF', 'Alertas'],
      featuresMissing: ['MCP IA'],
      cta: 'Assinar', destaque: false, cor: 'emerald'
    },
    {
      nome: 'Escritório', preco: 'R$ 297', periodo: '/mês', descricao: 'Para contadores',
      features: ['50 empresas', 'Tudo anterior', 'MCP IA 24/7', 'Upload XMLs', 'API'],
      featuresMissing: [],
      cta: 'Assinar', destaque: true, cor: 'cyan'
    }
  ]
  
  return (
    <section id="planos" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Planos</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Escolha o plano ideal</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {planos.map((plano, index) => (
            <div key={index} className={`relative bg-slate-800/50 backdrop-blur border rounded-2xl p-8 ${
              plano.destaque ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-700/50'
            }`}>
              {plano.destaque && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plano.nome}</h3>
              <p className="text-slate-400 text-sm mb-4">{plano.descricao}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plano.preco}</span>
                <span className="text-slate-400">{plano.periodo}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plano.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 text-sm">{f}</span>
                  </li>
                ))}
                {plano.featuresMissing.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 opacity-50">
                    <Check className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-500 text-sm line-through">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#teste" className={`block text-center py-3 px-6 rounded-full font-medium transition-all ${
                plano.destaque ? 'bg-cyan-600 hover:bg-cyan-500 text-white' :
                plano.cor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                'bg-slate-700 hover:bg-slate-600 text-white'
              }`}>
                {plano.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FormularioTeste() {
  const [formData, setFormData] = useState({ nome: '', email: '', whatsapp: '', cnpj: '', tipoUsuario: 'empresario' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  
  const formatCNPJ = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18)
  const formatWhatsApp = (v) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: '', message: '' })
    try {
      await insertLeadReforma(formData)
      setStatus({ type: 'success', message: 'Recebemos seus dados! Em breve você receberá a análise.' })
      setFormData({ nome: '', email: '', whatsapp: '', cnpj: '', tipoUsuario: 'empresario' })
    } catch (error) {
      setStatus({ type: 'error', message: 'Erro ao enviar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <section id="teste" className="py-20 bg-slate-950">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase mb-4 block">Teste Grátis</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Faça sua análise de impacto</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Eu sou:</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({ ...formData, tipoUsuario: 'empresario' })}
                className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  formData.tipoUsuario === 'empresario' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-400'
                }`}>
                <Building2 className="w-5 h-5" /> Empresário
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, tipoUsuario: 'contador' })}
                className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  formData.tipoUsuario === 'contador' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-slate-400'
                }`}>
                <Briefcase className="w-5 h-5" /> Contador
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome completo</label>
              <input type="text" required value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
              <input type="tel" required value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: formatWhatsApp(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" placeholder="(62) 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">CNPJ {formData.tipoUsuario === 'contador' ? 'do cliente' : 'da empresa'}</label>
              <input type="text" required value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 outline-none" placeholder="00.000.000/0000-00" />
            </div>
          </div>
          
          {status.message && (
            <div className={`mt-6 p-4 rounded-xl ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
              {status.message}
            </div>
          )}
          
          <button type="submit" disabled={loading}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
            {loading ? 'Analisando...' : <>Analisar Impacto Grátis <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold">C</span>
          </div>
          <span className="font-bold text-white">Contta</span>
        </div>
        <p className="text-slate-500 text-sm">
          Desenvolvido por <a href="https://amplabusiness.com.br" className="text-emerald-400 hover:underline">AMPLA Contabilidade</a>
        </p>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Contta</p>
      </div>
    </footer>
  )
}

function WhatsAppButton() {
  return (
    <a href="https://wa.me/5562999999999?text=Olá! Vim pelo site Contta" target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110">
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <Hero />
      <ProblemaSection />
      <ComoFuncionaSection />
      <PlanosSection />
      <FormularioTeste />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
```

---

## PASSO 5: CRIAR TABELAS NO SUPABASE

Instalar Supabase CLI e executar SQL:
```bash
npm install -g supabase

# Login no Supabase (vai abrir navegador)
npx supabase login

# Conectar ao projeto
npx supabase link --project-ref yqcsoljcoifznxzptrrr
```

Criar arquivo `supabase/migrations/001_leads_reforma.sql`:
```sql
CREATE TABLE IF NOT EXISTS leads_reforma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('empresario', 'contador')),
  origem TEXT DEFAULT 'landing_contta',
  status TEXT DEFAULT 'novo',
  razao_social TEXT,
  cnae_principal TEXT,
  regime_tributario TEXT,
  uf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads_reforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insert anônimo" ON leads_reforma FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura autenticados" ON leads_reforma FOR SELECT USING (auth.role() = 'authenticated');
```

Executar migration:
```bash
npx supabase db push
```

---

## PASSO 6: DEPLOY NO VERCEL

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login (vai abrir navegador)
vercel login

# Build do projeto
npm run build

# Deploy para produção
vercel --prod

# Configurar domínio (após deploy)
vercel domains add contta.com.br
```

---

## PASSO 7: CONFIGURAR DNS

Após o Vercel informar os DNS, configurar no registrador do domínio:
- Tipo: CNAME
- Nome: @
- Valor: cname.vercel-dns.com

---

## RESUMO DOS COMANDOS (EXECUTAR EM SEQUÊNCIA)

```bash
# 1. Criar projeto
npm create vite@latest contta-landing -- --template react
cd contta-landing
npm install
npm install @supabase/supabase-js lucide-react
npm install -D tailwindcss @tailwindcss/vite

# 2. (Editar arquivos conforme instruções acima)

# 3. Supabase
npm install -g supabase
npx supabase login
npx supabase link --project-ref yqcsoljcoifznxzptrrr
npx supabase db push

# 4. Vercel
npm install -g vercel
vercel login
npm run build
vercel --prod
vercel domains add contta.com.br
```

---

## RESULTADO ESPERADO

- Site funcionando em: https://contta.com.br
- Formulário salvando leads no Supabase
- Design profissional com countdown para 2026
