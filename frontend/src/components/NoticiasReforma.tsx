import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, Calendar, ExternalLink, ChevronRight, Lightbulb, AlertTriangle, Building2, Tag, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Noticia {
  id: string
  titulo_simplificado: string
  explicacao_simples: string
  impacto_empresas: string
  exemplos_praticos: string
  pontos_atencao: string[]
  categoria: string
  tags: string[]
  fonte: string
  url_fonte: string
  relevancia: number
  created_at: string
  destaque: boolean
}

const CATEGORIAS = {
  legislacao: { label: 'Legislação', cor: 'bg-blue-500' },
  regulamentacao: { label: 'Regulamentação', cor: 'bg-purple-500' },
  cronograma: { label: 'Cronograma', cor: 'bg-orange-500' },
  aliquotas: { label: 'Alíquotas', cor: 'bg-red-500' },
  setorial: { label: 'Setorial', cor: 'bg-green-500' },
  tecnologia: { label: 'Tecnologia', cor: 'bg-cyan-500' },
  orientacao: { label: 'Orientação', cor: 'bg-yellow-500' },
  opiniao: { label: 'Opinião', cor: 'bg-gray-500' }
}

export function NoticiasReforma() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [noticiaExpandida, setNoticiaExpandida] = useState<string | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null)

  useEffect(() => {
    carregarNoticias()
  }, [categoriaFiltro])

  async function carregarNoticias() {
    setLoading(true)
    try {
      let query = supabase
        .from('noticias_reforma')
        .select('*')
        .eq('publicado', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (categoriaFiltro) {
        query = query.eq('categoria', categoriaFiltro)
      }

      const { data, error } = await query

      if (error) throw error
      setNoticias(data || [])
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatarData(dataStr: string) {
    const data = new Date(dataStr)
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje'
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem'
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      })
    }
  }

  function toggleExpandir(id: string) {
    setNoticiaExpandida(noticiaExpandida === id ? null : id)
  }

  return (
    <section id="noticias" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-contta-500/20 text-contta-300 px-4 py-2 rounded-full text-sm mb-4">
            <Newspaper size={16} />
            <span>Atualizado diariamente</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Acompanhe a Reforma Tributária
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Notícias interpretadas por IA em linguagem simples.
            Entenda o que muda para sua empresa.
          </p>
        </motion.div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setCategoriaFiltro(null)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              !categoriaFiltro
                ? 'bg-contta-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Todas
          </button>
          {Object.entries(CATEGORIAS).map(([key, { label, cor }]) => (
            <button
              key={key}
              onClick={() => setCategoriaFiltro(key)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                categoriaFiltro === key
                  ? `${cor} text-white`
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <RefreshCw size={32} className="text-contta-400 animate-spin" />
          </div>
        )}

        {/* Lista de notícias */}
        {!loading && noticias.length === 0 && (
          <div className="text-center py-12">
            <Newspaper size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma notícia encontrada</p>
          </div>
        )}

        <div className="space-y-4 max-w-4xl mx-auto">
          {noticias.map((noticia, index) => {
            const categoria = CATEGORIAS[noticia.categoria as keyof typeof CATEGORIAS] || CATEGORIAS.orientacao
            const expandida = noticiaExpandida === noticia.id

            return (
              <motion.div
                key={noticia.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-slate-800/50 rounded-2xl border transition-all ${
                  noticia.destaque
                    ? 'border-contta-400'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Header da notícia */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpandir(noticia.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`${categoria.cor} text-white text-xs px-2 py-1 rounded-full`}>
                          {categoria.label}
                        </span>
                        <span className="text-slate-500 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {formatarData(noticia.created_at)}
                        </span>
                        <span className="text-slate-600 text-sm">
                          • {noticia.fonte}
                        </span>
                        {noticia.destaque && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                            Destaque
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {noticia.titulo_simplificado}
                      </h3>

                      {/* Preview da explicação */}
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {noticia.explicacao_simples}
                      </p>
                    </div>

                    {/* Botão expandir */}
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <ChevronRight
                        size={24}
                        className={`transition-transform ${expandida ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {expandida && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 border-t border-slate-700"
                  >
                    <div className="pt-6 space-y-6">
                      {/* Explicação completa */}
                      <div>
                        <h4 className="text-sm font-semibold text-contta-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <Lightbulb size={16} />
                          O que mudou?
                        </h4>
                        <p className="text-slate-300 whitespace-pre-line">
                          {noticia.explicacao_simples}
                        </p>
                      </div>

                      {/* Impacto nas empresas */}
                      {noticia.impacto_empresas && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <Building2 size={16} />
                            Impacto para sua empresa
                          </h4>
                          <p className="text-slate-300">
                            {noticia.impacto_empresas}
                          </p>
                        </div>
                      )}

                      {/* Exemplos práticos */}
                      {noticia.exemplos_praticos && (
                        <div className="bg-slate-700/50 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-2">
                            Exemplo Prático
                          </h4>
                          <p className="text-slate-300 text-sm">
                            {noticia.exemplos_praticos}
                          </p>
                        </div>
                      )}

                      {/* Pontos de atenção */}
                      {noticia.pontos_atencao && noticia.pontos_atencao.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Pontos de Atenção
                          </h4>
                          <ul className="space-y-2">
                            {noticia.pontos_atencao.map((ponto, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                <span className="text-orange-400 mt-1">•</span>
                                {ponto}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags */}
                      {noticia.tags && noticia.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {noticia.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-slate-700 text-slate-400 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                            >
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Link para fonte */}
                      <a
                        href={noticia.url_fonte}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-contta-400 hover:text-contta-300 text-sm transition-colors"
                      >
                        <ExternalLink size={14} />
                        Ver fonte original
                      </a>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        {noticias.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-slate-500 mb-4">
              Receba as atualizações diretamente no seu WhatsApp
            </p>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 bg-contta-500 hover:bg-contta-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Cadastrar para receber alertas
              <ChevronRight size={20} />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  )
}
