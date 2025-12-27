// Edge Function: Buscar e Interpretar Noticias da Reforma Tributaria
// Executa diariamente via CRON ou manualmente

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY')
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Credenciais Econet
const ECONET_USERNAME = Deno.env.get('OBJETIVA_USERNAME') || 'amplaconsultoria'
const ECONET_PASSWORD = Deno.env.get('OBJETIVA_PASSWORD') || '2350ac'

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

// Queries de busca para diferentes fontes
const QUERIES_BUSCA = [
  // Fontes oficiais
  'site:gov.br/fazenda reforma tributária IBS CBS 2025',
  'site:gov.br/receitafederal reforma tributária regulamentação',
  'site:planalto.gov.br "lei complementar 214" OR "reforma tributária"',

  // Comitê Gestor
  '"Comitê Gestor do IBS" reforma tributária',

  // Legislação
  '"LC 214" reforma tributária',
  '"Lei Complementar 214" regulamentação',

  // Imprensa especializada
  'reforma tributária IBS CBS 2026 alíquota',
  'reforma tributária Brasil empresas impacto',

  // Temas específicos
  'split payment reforma tributária nota fiscal',
  'cashback reforma tributária devolução',
  'cesta básica reforma tributária alíquota zero',
  'imposto seletivo reforma tributária'
]

interface SerperResult {
  title: string
  link: string
  snippet: string
  date?: string
}

interface NoticiaProcessada {
  titulo_original: string
  resumo_original: string
  url_fonte: string
  fonte: string
  data_publicacao: string | null
  titulo_simplificado: string
  explicacao_simples: string
  impacto_empresas: string
  exemplos_praticos: string
  pontos_atencao: string[]
  categoria: string
  tags: string[]
  relevancia: number
}

// Buscar noticias via Serper.dev
async function buscarSerper(query: string): Promise<SerperResult[]> {
  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        gl: 'br',
        hl: 'pt-br',
        num: 10,
        tbs: 'qdr:w' // Ultima semana
      })
    })

    const data = await response.json()
    return data.organic || []
  } catch (error) {
    console.error('Erro Serper:', error)
    return []
  }
}

// Buscar conteudo da Econet (com autenticacao)
async function buscarEconet(): Promise<SerperResult[]> {
  try {
    // Primeiro buscar via Serper o que tem na Econet sobre reforma
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: 'site:econeteditora.com.br reforma tributária IBS CBS',
        gl: 'br',
        hl: 'pt-br',
        num: 15
      })
    })

    const data = await response.json()

    // Marcar como fonte Econet
    return (data.organic || []).map((item: SerperResult) => ({
      ...item,
      fonte: 'Econet Editora'
    }))
  } catch (error) {
    console.error('Erro busca Econet:', error)
    return []
  }
}

// Interpretar noticia com Gemini
async function interpretarComIA(noticia: SerperResult): Promise<NoticiaProcessada | null> {
  try {
    const prompt = `Você é um especialista em tributação brasileira. Analise esta notícia sobre a Reforma Tributária e explique de forma CLARA e SIMPLES para empresários e contadores.

NOTÍCIA:
Título: ${noticia.title}
Resumo: ${noticia.snippet}
Fonte: ${noticia.link}

RESPONDA EM JSON com esta estrutura EXATA:
{
  "titulo_simplificado": "Título curto e claro (máx 100 caracteres)",
  "explicacao_simples": "Explicação em 2-3 parágrafos usando linguagem simples, sem jargões técnicos. Explique O QUE mudou e POR QUE isso importa.",
  "impacto_empresas": "Como isso afeta empresas na prática? Seja específico.",
  "exemplos_praticos": "Dê 1-2 exemplos concretos com números se possível. Ex: 'Uma empresa que vende R$ 100 mil/mês vai...'",
  "pontos_atencao": ["Ponto 1 importante", "Ponto 2 importante", "Ponto 3 se houver"],
  "categoria": "legislacao|regulamentacao|cronograma|aliquotas|setorial|tecnologia|orientacao|opiniao",
  "tags": ["tag1", "tag2", "tag3"],
  "relevancia": 7
}

REGRAS:
- Use português brasileiro simples
- Evite termos como "outrossim", "destarte", "com fulcro"
- Seja direto e prático
- Relevância de 1 a 10 (10 = muito importante para empresas)`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000
          }
        })
      }
    )

    const data = await response.json()
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textResponse) {
      console.error('Resposta vazia do Gemini')
      return null
    }

    // Extrair JSON da resposta
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('JSON não encontrado na resposta')
      return null
    }

    const interpretacao = JSON.parse(jsonMatch[0])

    // Identificar fonte
    let fonte = 'Outras Fontes'
    if (noticia.link.includes('gov.br/fazenda')) fonte = 'Ministério da Fazenda'
    else if (noticia.link.includes('gov.br/receitafederal')) fonte = 'Receita Federal'
    else if (noticia.link.includes('planalto.gov.br')) fonte = 'Planalto'
    else if (noticia.link.includes('valor.globo.com')) fonte = 'Valor Econômico'
    else if (noticia.link.includes('jota.info')) fonte = 'Jota'
    else if (noticia.link.includes('conjur.com.br')) fonte = 'Consultor Jurídico'
    else if (noticia.link.includes('econeteditora.com.br')) fonte = 'Econet Editora'
    else if (noticia.link.includes('folha.uol.com.br')) fonte = 'Folha de S.Paulo'
    else if (noticia.link.includes('estadao.com.br')) fonte = 'Estadão'

    return {
      titulo_original: noticia.title,
      resumo_original: noticia.snippet,
      url_fonte: noticia.link,
      fonte,
      data_publicacao: noticia.date || null,
      titulo_simplificado: interpretacao.titulo_simplificado,
      explicacao_simples: interpretacao.explicacao_simples,
      impacto_empresas: interpretacao.impacto_empresas,
      exemplos_praticos: interpretacao.exemplos_praticos,
      pontos_atencao: interpretacao.pontos_atencao || [],
      categoria: interpretacao.categoria || 'orientacao',
      tags: interpretacao.tags || [],
      relevancia: interpretacao.relevancia || 5
    }
  } catch (error) {
    console.error('Erro ao interpretar:', error)
    return null
  }
}

// Salvar noticia no banco
async function salvarNoticia(noticia: NoticiaProcessada): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('noticias_reforma')
      .upsert(noticia, {
        onConflict: 'url_fonte',
        ignoreDuplicates: true
      })

    if (error) {
      console.error('Erro ao salvar:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Erro DB:', error)
    return false
  }
}

// Handler principal
serve(async (req) => {
  const startTime = Date.now()

  try {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    }

    console.log('🔍 Iniciando busca de notícias da Reforma Tributária...')

    // Coletar todas as noticias
    const todasNoticias: SerperResult[] = []
    const urlsProcessadas = new Set<string>()

    // Buscar em paralelo (max 3 por vez para não sobrecarregar)
    for (let i = 0; i < QUERIES_BUSCA.length; i += 3) {
      const batch = QUERIES_BUSCA.slice(i, i + 3)
      const resultados = await Promise.all(batch.map(q => buscarSerper(q)))

      for (const resultado of resultados) {
        for (const noticia of resultado) {
          if (!urlsProcessadas.has(noticia.link)) {
            urlsProcessadas.add(noticia.link)
            todasNoticias.push(noticia)
          }
        }
      }
    }

    // Adicionar noticias da Econet
    const noticiasEconet = await buscarEconet()
    for (const noticia of noticiasEconet) {
      if (!urlsProcessadas.has(noticia.link)) {
        urlsProcessadas.add(noticia.link)
        todasNoticias.push(noticia)
      }
    }

    console.log(`📰 ${todasNoticias.length} notícias encontradas`)

    // Verificar quais já existem no banco
    const { data: existentes } = await supabase
      .from('noticias_reforma')
      .select('url_fonte')

    const urlsExistentes = new Set(existentes?.map(n => n.url_fonte) || [])
    const noticiasNovas = todasNoticias.filter(n => !urlsExistentes.has(n.link))

    console.log(`🆕 ${noticiasNovas.length} notícias novas para processar`)

    // Processar e interpretar (máx 20 por execução)
    const noticiasParaProcessar = noticiasNovas.slice(0, 20)
    let processadas = 0
    let salvas = 0

    for (const noticia of noticiasParaProcessar) {
      const interpretada = await interpretarComIA(noticia)
      processadas++

      if (interpretada) {
        const sucesso = await salvarNoticia(interpretada)
        if (sucesso) salvas++
      }

      // Delay para não sobrecarregar API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const duracao = Date.now() - startTime

    // Log da execução
    await supabase.from('cron_execucoes').insert({
      tipo: 'busca_noticias',
      status: salvas > 0 ? 'sucesso' : (processadas > 0 ? 'parcial' : 'erro'),
      noticias_encontradas: todasNoticias.length,
      noticias_processadas: salvas,
      duracao_ms: duracao
    })

    console.log(`✅ Concluído: ${salvas}/${processadas} notícias salvas em ${duracao}ms`)

    return new Response(
      JSON.stringify({
        sucesso: true,
        encontradas: todasNoticias.length,
        novas: noticiasNovas.length,
        processadas,
        salvas,
        duracao_ms: duracao
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Erro geral:', error)

    await supabase.from('cron_execucoes').insert({
      tipo: 'busca_noticias',
      status: 'erro',
      erro_mensagem: error.message,
      duracao_ms: Date.now() - startTime
    })

    return new Response(
      JSON.stringify({ erro: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
