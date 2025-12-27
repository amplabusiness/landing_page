import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using placeholder values.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Funcao para capturar leads
export async function capturarLead(data: {
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cnpj?: string
  origem?: string
}) {
  const { error } = await supabase
    .from('leads_reforma')
    .insert([{
      ...data,
      origem: data.origem || 'landing_page',
      created_at: new Date().toISOString()
    }])

  if (error) throw error
  return { success: true }
}

// Funcao para salvar analise
export async function salvarAnalise(data: {
  lead_id?: string
  tipo_analise: 'nfe' | 'pgdas' | 'sped_fiscal' | 'sped_contribuicoes'
  dados_entrada: Record<string, unknown>
  resultado: Record<string, unknown>
}) {
  const { error, data: analise } = await supabase
    .from('analises_reforma')
    .insert([{
      ...data,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) throw error
  return analise
}
