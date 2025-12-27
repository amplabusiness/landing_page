# CALCULADORA IBS/CBS 2026 - ARQUITETURA

## VISÃO GERAL

Produto SaaS para calcular impacto da Reforma Tributária nas empresas.
**Marca:** Claude + AMPLA Contabilidade

---

## STACK TECNOLÓGICO

### Frontend (Este projeto - lanpage)
- **React 18** + TypeScript + Vite
- **Tailwind CSS** + Framer Motion
- **Stripe** para pagamentos
- **Supabase** para auth/dados

### Backend (Projeto SERPRO existente)
- **Node.js** + Express + TypeScript
- **22 APIs SERPRO** integradas
- **50+ Tools MCP** (IA fiscal)
- **Python** parsers para PDF

### Infraestrutura
- **Vercel** - Frontend
- **Supabase** - Banco PostgreSQL
- **Stripe** - Pagamentos
- **Serper.dev** - Pesquisa legislação

---

## MÓDULOS DA CALCULADORA

### 1. SIMULADOR NF-e (Gratuito)
```
Entrada: Produto + Valor + NCM/CNAE
Saída: Preço HOJE vs Preço 2026-2033

Funcionalidades:
- 5 notas de teste grátis
- Mostra CBS + IBS separados
- Compara com ICMS/PIS/COFINS atual
- Identifica se tem redução 60%
```

### 2. IMPORTADOR PGDAS-D
```
Entrada: PDF ou XML do PGDAS-D
Saída: Análise completa antes/depois

Funcionalidades:
- Parser Python (pdfplumber)
- Extrai 111 campos automaticamente
- Calcula DAS atual vs CBS/IBS futuro
- Gráfico comparativo 2026-2033
```

### 3. SPED FISCAL (EFD ICMS/IPI)
```
Entrada: Arquivo SPED Fiscal
Saída: ICMS atual vs IBS futuro

Funcionalidades:
- Parse de registros C100, C170
- Cálculo por produto/NCM
- Identificação de créditos
- Impacto no split payment
```

### 4. SPED CONTRIBUIÇÕES
```
Entrada: Arquivo SPED Contribuições
Saída: PIS/COFINS atual vs CBS futuro

Funcionalidades:
- Parse de registros
- Créditos monofásicos
- Regime cumulativo vs não-cumulativo
- Projeção CBS 8,8%
```

### 5. DASHBOARD CONSOLIDADO
```
Visão: Painel único com todos os dados

Funcionalidades:
- Comparativo geral 2025 vs 2033
- Economia ou aumento estimado
- Recomendações automáticas
- Relatório PDF exportável
```

---

## APIs DISPONÍVEIS (Backend SERPRO)

### Reforma Tributária
```
GET  /api/reforma/cronograma      - Cronograma 2026-2033
GET  /api/reforma/setores-reducao - Setores com 60% redução
GET  /api/reforma/cesta-basica    - Itens alíquota zero
GET  /api/reforma/imposto-seletivo - Produtos com IS
GET  /api/reforma/split-payment   - Regras split payment
GET  /api/reforma/cashback        - Regras cashback
GET  /api/reforma/simples-mei     - Regras Simples/MEI
POST /api/reforma/relatorio-comparativo - Relatório completo
```

### SERPRO
```
POST /api/serpro/pgdasd          - Consulta PGDAS-D
POST /api/serpro/extrato-das     - Extrato DAS
POST /api/serpro/dctfweb         - Consulta DCTFWeb
POST /api/serpro/situacao-fiscal - Situação fiscal
POST /api/serpro/mei/*           - Endpoints MEI
```

### Parsers PDF
```
POST /api/pdf/pgdasd    - Parse PGDAS-D
POST /api/pdf/sped      - Parse SPED
POST /api/pdf/nfe       - Parse NF-e
```

---

## PLANOS E PREÇOS (Stripe)

| Plano | Preço | Empresas | Recursos |
|-------|-------|----------|----------|
| **Profissional** | R$ 97/mês | 10 | Simulação, PDF, Alertas |
| **Escritório** | R$ 297/mês | 50 | API, MCP IA, Multi-user |
| **Enterprise** | R$ 997/mês | ∞ | White-label, SERPRO, SLA |

### IDs Stripe (Teste)
```
STRIPE_PRICE_PROFISSIONAL=price_1SitTl8RybYfMeLiV3iBIVcZ
STRIPE_PRICE_ESCRITORIO=price_1SitTl8RybYfMeLiILWnwuiF
STRIPE_PRICE_ENTERPRISE=price_1SitTm8RybYfMeLiKBPttZJd
```

---

## SEGURANÇA

### Implementado
- RLS no Supabase (Row Level Security)
- Autenticação via Supabase Auth
- API Keys protegidas

### A Implementar
- [ ] Criptografia de dados sensíveis
- [ ] Audit logs imutáveis
- [ ] Rate limiting
- [ ] LGPD compliance
- [ ] Backup automático
- [ ] Logs de acesso

---

## FLUXO DO USUÁRIO

```
1. Acessa contta.com.br
   └── Landing page com simulador grátis

2. Faz simulação (5 notas grátis)
   └── Vê resultado: economia ou aumento

3. Se interessou
   └── Cadastra (nome, email, WhatsApp)
   └── Lead salvo no Supabase

4. Quer mais?
   └── Escolhe plano (Profissional/Escritório/Enterprise)
   └── Checkout via Stripe

5. Assinante
   └── Acessa dashboard completo
   └── Importa PGDAS/SPED/NF-e
   └── Relatórios ilimitados
```

---

## PRÓXIMOS PASSOS

1. [x] Criar produtos Stripe
2. [ ] Frontend React com calculadora
3. [ ] Integrar APIs do backend SERPRO
4. [ ] Testes end-to-end
5. [ ] Deploy em contta.com.br
6. [ ] Campanha de lançamento

---

## CREDENCIAIS

### Supabase
```
URL: https://yqcsoljcoifznxzptrrr.supabase.co
Projeto: SERPRO
```

### Stripe
```
Conta: contta inteligencia fiscal
Modo: TESTE (mudar para produção depois)
```

### Vercel
```
Projeto: contta-landing-deploy
Domínio: contta.com.br (DNS propagando)
```

---

## CONTATO

- **Produto:** Contta
- **Empresa:** AMPLA Contabilidade
- **Responsável:** Sérgio Carneiro Leão
- **IA:** Claude (Anthropic)
