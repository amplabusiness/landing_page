/**
 * CONTTA - Setup Produtos Stripe
 *
 * Cria os 3 planos de assinatura no Stripe
 * Execute: node scripts/setup-stripe-products.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '../../.env' });

// Chave secreta do Stripe (usar variavel de ambiente)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function criarProdutos() {
  console.log('🚀 Criando produtos Stripe para Calculadora IBS/CBS 2026...\n');

  try {
    // =====================================================
    // PRODUTO 1: PROFISSIONAL (R$ 97/mês)
    // =====================================================
    console.log('📦 Criando plano PROFISSIONAL...');

    const produtoProfissional = await stripe.products.create({
      name: 'Calculadora IBS/CBS 2026 - Profissional',
      description: `Ideal para empresários que querem se preparar para a Reforma Tributária.

✓ 10 empresas
✓ Simulação completa 2026-2033
✓ Relatório PDF com impacto
✓ Histórico de simulações
✓ Alertas por email
✓ Atualizações de legislação
✓ Suporte por email`,
      metadata: {
        plano: 'profissional',
        limite_empresas: '10',
        limite_usuarios: '1'
      },
      images: ['https://contta.com.br/logo.png']
    });

    const precoProfissional = await stripe.prices.create({
      product: produtoProfissional.id,
      unit_amount: 9700, // R$ 97,00 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plano: 'profissional'
      }
    });

    console.log(`   ✅ Produto: ${produtoProfissional.id}`);
    console.log(`   ✅ Preço: ${precoProfissional.id} (R$ 97/mês)\n`);

    // =====================================================
    // PRODUTO 2: ESCRITÓRIO (R$ 297/mês)
    // =====================================================
    console.log('📦 Criando plano ESCRITÓRIO...');

    const produtoEscritorio = await stripe.products.create({
      name: 'Calculadora IBS/CBS 2026 - Escritório',
      description: `Para escritórios de contabilidade que atendem múltiplos clientes.

✓ 50 empresas
✓ Tudo do plano Profissional
✓ API para integração com seu sistema
✓ MCP IA 24/7 (consultas fiscais por IA)
✓ Importação em lote (XMLs, planilhas)
✓ Relatórios personalizados por cliente
✓ Multi-usuários (5 usuários)
✓ Suporte prioritário por WhatsApp`,
      metadata: {
        plano: 'escritorio',
        limite_empresas: '50',
        limite_usuarios: '5'
      },
      images: ['https://contta.com.br/logo.png']
    });

    const precoEscritorio = await stripe.prices.create({
      product: produtoEscritorio.id,
      unit_amount: 29700, // R$ 297,00 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plano: 'escritorio'
      }
    });

    console.log(`   ✅ Produto: ${produtoEscritorio.id}`);
    console.log(`   ✅ Preço: ${precoEscritorio.id} (R$ 297/mês)\n`);

    // =====================================================
    // PRODUTO 3: ENTERPRISE (R$ 997/mês)
    // =====================================================
    console.log('📦 Criando plano ENTERPRISE...');

    const produtoEnterprise = await stripe.products.create({
      name: 'Calculadora IBS/CBS 2026 - Enterprise',
      description: `Solução completa para grandes escritórios e redes de contabilidade.

✓ Empresas ILIMITADAS
✓ Tudo dos planos anteriores
✓ White-label (sua marca)
✓ Integração direta com SERPRO
✓ Acesso à API oficial RFB
✓ Validação de NF-e com grupos CBS/IBS
✓ Usuários ilimitados
✓ SLA 99.9% de disponibilidade
✓ Gerente de sucesso dedicado
✓ Treinamento para equipe
✓ Suporte 24/7`,
      metadata: {
        plano: 'enterprise',
        limite_empresas: 'ilimitado',
        limite_usuarios: 'ilimitado'
      },
      images: ['https://contta.com.br/logo.png']
    });

    const precoEnterprise = await stripe.prices.create({
      product: produtoEnterprise.id,
      unit_amount: 99700, // R$ 997,00 em centavos
      currency: 'brl',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plano: 'enterprise'
      }
    });

    console.log(`   ✅ Produto: ${produtoEnterprise.id}`);
    console.log(`   ✅ Preço: ${precoEnterprise.id} (R$ 997/mês)\n`);

    // =====================================================
    // RESUMO
    // =====================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    PRODUTOS CRIADOS COM SUCESSO!           ');
    console.log('═══════════════════════════════════════════════════════════\n');

    const resumo = {
      profissional: {
        produto_id: produtoProfissional.id,
        preco_id: precoProfissional.id,
        valor: 'R$ 97/mês',
        empresas: 10
      },
      escritorio: {
        produto_id: produtoEscritorio.id,
        preco_id: precoEscritorio.id,
        valor: 'R$ 297/mês',
        empresas: 50
      },
      enterprise: {
        produto_id: produtoEnterprise.id,
        preco_id: precoEnterprise.id,
        valor: 'R$ 997/mês',
        empresas: 'Ilimitado'
      }
    };

    console.log(JSON.stringify(resumo, null, 2));

    console.log('\n📋 Copie os IDs acima para o arquivo .env:\n');
    console.log(`STRIPE_PRICE_PROFISSIONAL=${precoProfissional.id}`);
    console.log(`STRIPE_PRICE_ESCRITORIO=${precoEscritorio.id}`);
    console.log(`STRIPE_PRICE_ENTERPRISE=${precoEnterprise.id}`);

    return resumo;

  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error.message);
    throw error;
  }
}

// Executar
criarProdutos()
  .then(() => {
    console.log('\n✅ Setup concluído!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Falha no setup:', err);
    process.exit(1);
  });
