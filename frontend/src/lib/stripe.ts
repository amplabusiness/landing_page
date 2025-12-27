import { loadStripe } from '@stripe/stripe-js'

// Stripe public key (test mode)
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder'

export const stripePromise = loadStripe(stripePublicKey)

// Precos dos planos (IDs do Stripe) - 50% OFF LANCAMENTO
export const PLANOS = {
  profissional: {
    id: 'profissional',
    nome: 'Profissional',
    preco: 47, // Era R$ 97 - 50% OFF
    precoOriginal: 97,
    priceId: 'price_1SitTl8RybYfMeLiV3iBIVcZ', // Atualizar no Stripe
    empresas: 10,
    usuarios: 1,
    recursos: [
      'Simulador NF-e ilimitado',
      'Importador PGDAS-D',
      'Relatorio comparativo',
      'Suporte por email',
      '10 empresas'
    ]
  },
  escritorio: {
    id: 'escritorio',
    nome: 'Escritorio',
    preco: 147, // Era R$ 297 - 50% OFF
    precoOriginal: 297,
    priceId: 'price_1SitTl8RybYfMeLiILWnwuiF', // Atualizar no Stripe
    empresas: 50,
    usuarios: 5,
    recursos: [
      'Tudo do Profissional',
      'Importador SPED Fiscal',
      'Importador SPED Contribuicoes',
      'Dashboard consolidado',
      'API de integracao',
      'Suporte prioritario',
      '50 empresas',
      '5 usuarios'
    ],
    destaque: true
  },
  enterprise: {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 497, // Era R$ 997 - 50% OFF
    precoOriginal: 997,
    priceId: 'price_1SitTm8RybYfMeLiKBPttZJd', // Atualizar no Stripe
    empresas: 999,
    usuarios: 999,
    recursos: [
      'Tudo do Escritorio',
      'Empresas ilimitadas',
      'Usuarios ilimitados',
      'Whitelabel',
      'API completa',
      'Integracao ERP',
      'Gerente de conta dedicado',
      'SLA garantido'
    ]
  }
}

// Funcao para redirecionar ao checkout
export async function redirectToCheckout(priceId: string, customerEmail?: string) {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe nao carregado')

  // Em producao, criar sessao no backend
  // Por enquanto, link direto do Stripe
  const baseUrl = 'https://buy.stripe.com/test/' + priceId
  const url = customerEmail
    ? baseUrl + '?prefilled_email=' + encodeURIComponent(customerEmail)
    : baseUrl
  window.open(url, '_blank')
}
