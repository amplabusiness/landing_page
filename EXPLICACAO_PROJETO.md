# 📋 DOCUMENTO EXPLICATIVO: PROJETO CONTTA LANDING PAGE

## O QUE É ESTE PROJETO?

O **Contta Landing Page** é uma página de captura de leads (potenciais clientes) focada na **Reforma Tributária (LC 214/2025)**. 

### Em linguagem simples:
É um site de uma única página que:
1. Atrai empresários e contadores preocupados com a Reforma Tributária
2. Oferece uma **análise gratuita** de impacto tributário
3. Captura os dados de contato (nome, email, WhatsApp, CNPJ)
4. Converte esses leads em clientes pagantes (assinaturas mensais ou serviços da AMPLA)

---

## 🎯 QUAL O OBJETIVO DE NEGÓCIO?

### Dois caminhos de monetização:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISITANTE DO SITE                            │
│                  (empresário ou contador)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              TESTE GRÁTIS (Análise de Impacto)                  │
│         Preenche formulário com CNPJ e dados de contato         │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│   CAMINHO A: EMPRESÁRIO │     │   CAMINHO B: CONTADOR           │
│                         │     │                                 │
│  → Vira cliente da      │     │  → Assina plataforma SaaS       │
│    AMPLA Contabilidade  │     │    Contta (R$ 97-297/mês)       │
│    (R$ 500-5.000/mês)   │     │                                 │
│                         │     │  → Usa ferramenta para          │
│  → Contrata projetos    │     │    atender seus próprios        │
│    de consultoria       │     │    clientes                     │
│    tributária           │     │                                 │
└─────────────────────────┘     └─────────────────────────────────┘
```

---

## 🔗 COMO SE RELACIONA COM O PROJETO SERPRO EXISTENTE?

### Você já tem:

| Sistema | O que faz | Onde está |
|---------|-----------|-----------|
| **SERPRO Integra** | Sistema completo com 22 serviços fiscais (PGDAS-D, SITFIS, SICALC, etc.) | serpro-ochre.vercel.app |
| **Supabase** | Banco de dados PostgreSQL na nuvem | yqcsoljcoifznxzptrrr.supabase.co |
| **MCP Server** | Servidor de IA para consultas tributárias | serpro-mcp-server/ |
| **GitHub** | Código fonte do projeto | github.com/amplabusiness/serpro |

### A landing page REAPROVEITA essa infraestrutura:

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (já existente)                    │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Tabelas SERPRO  │  │ NOVAS TABELAS   │  │ Cache/Configs   │ │
│  │ (já existem)    │  │ leads_reforma   │  │ (já existem)    │ │
│  │                 │  │ analises_reforma│  │                 │ │
│  │ - empresas      │  │ cache_cnpj      │  │ - api_tokens    │ │
│  │ - pgdas         │  │                 │  │ - configs       │ │
│  │ - sitfis        │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  SERPRO Integra │ │ CONTTA LANDING  │ │ Futuros sistemas        │
│  (existente)    │ │ (este projeto)  │ │ (CRM, App, etc.)        │
│                 │ │                 │ │                         │
│  Para uso       │ │  Para captura   │ │                         │
│  interno AMPLA  │ │  de novos leads │ │                         │
└─────────────────┘ └─────────────────┘ └─────────────────────────┘
```

### Resumo da relação:

1. **Mesmo banco de dados** - A landing page salva leads no MESMO Supabase que o SERPRO usa
2. **Mesma conta Vercel** - Deploy na mesma conta, mas domínio diferente (contta.com.br)
3. **Dados compartilhados** - No futuro, os leads podem virar clientes no sistema SERPRO
4. **AMPLA é o primeiro "tenant"** - O sistema é multi-inquilino, a AMPLA é o primeiro cliente

---

## 📊 O QUE CADA TABELA FAZ?

### Tabelas NOVAS (criadas para este projeto):

| Tabela | Função | Exemplo de dados |
|--------|--------|------------------|
| **leads_reforma** | Armazena contatos capturados | Nome, email, WhatsApp, CNPJ, tipo (empresário/contador) |
| **cache_cnpj** | Cache de consultas à API CNPJá | Dados da empresa para não consultar toda hora |
| **analises_reforma** | Resultados das análises de impacto | % de impacto, classificação (favorável/neutro/desfavorável) |

### Tabelas JÁ EXISTENTES (do SERPRO):

| Tabela | Função |
|--------|--------|
| empresas | Empresas cadastradas no sistema |
| pgdas_consultas | Histórico de consultas PGDAS-D |
| sitfis_consultas | Consultas de situação fiscal |
| api_tokens | Tokens de autenticação SERPRO |

---

## 🔄 FLUXO DE FUNCIONAMENTO

```
1. VISITANTE ACESSA contta.com.br
         │
         ▼
2. VÊ LANDING PAGE
   - Countdown para 2026
   - Explicação do problema (Reforma)
   - Planos e preços
   - Formulário de teste grátis
         │
         ▼
3. PREENCHE FORMULÁRIO
   - Nome, Email, WhatsApp
   - CNPJ da empresa
   - Tipo: Empresário ou Contador
         │
         ▼
4. SISTEMA PROCESSA
   - Salva lead no Supabase (leads_reforma)
   - Busca dados do CNPJ na CNPJá
   - [Futuro] Calcula impacto via SERPRO
         │
         ▼
5. MOSTRA RESULTADO
   - Dados da empresa encontrados
   - [Futuro] Estimativa de impacto %
   - CTA para assinar plano pago
         │
         ▼
6. FOLLOW-UP COMERCIAL
   - AMPLA entra em contato via WhatsApp
   - Oferece serviços ou assinatura
```

---

## 💰 MODELO DE MONETIZAÇÃO

### Planos definidos:

| Plano | Preço | Para quem | Inclui |
|-------|-------|-----------|--------|
| **Teste** | Grátis | Todos | 1 análise, resultado na tela |
| **Profissional** | R$ 97/mês | Empresários / Pequenos escritórios | 10 empresas, PDF, histórico |
| **Escritório** | R$ 297/mês | Escritórios de contabilidade | 50 empresas, MCP IA, XMLs, API |

### Receita projetada (exemplo):

```
Se conseguir:
- 50 assinantes Profissional = 50 x R$ 97 = R$ 4.850/mês
- 20 assinantes Escritório = 20 x R$ 297 = R$ 5.940/mês
- 10 clientes AMPLA = 10 x R$ 1.000 = R$ 10.000/mês

Total potencial: ~R$ 20.000/mês recorrente
```

---

## 🛠️ ARQUITETURA TÉCNICA

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│                                                                 │
│   React 18 + Vite + Tailwind CSS                               │
│   Hospedado no Vercel (contta.com.br)                          │
│                                                                 │
│   Componentes:                                                  │
│   - Navigation (menu)                                           │
│   - Hero (título + countdown)                                   │
│   - ProblemaSection (por que agir agora)                       │
│   - ComoFuncionaSection (3 passos)                             │
│   - PlanosSection (preços)                                      │
│   - FormularioTeste (captura de leads)                         │
│   - Footer + WhatsAppButton                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                                                                 │
│   Supabase (PostgreSQL + Auth + Edge Functions)                │
│   URL: yqcsoljcoifznxzptrrr.supabase.co                        │
│                                                                 │
│   APIs utilizadas:                                              │
│   - /rest/v1/leads_reforma (salvar leads)                      │
│   - /rest/v1/cache_cnpj (cache de CNPJs)                       │
│   - /functions/v1/buscar-cnpj (Edge Function - futuro)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Integrações externas
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APIS EXTERNAS                                │
│                                                                 │
│   CNPJá API - Dados cadastrais de empresas                     │
│   SERPRO Calculadora - Simulação IBS/CBS (futuro)              │
│   WhatsApp Business - Notificações (após homologação)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
contta-landing/
├── src/
│   ├── App.jsx              # Componente principal (toda a landing)
│   ├── main.jsx             # Entrada do React
│   ├── index.css            # Estilos globais + Tailwind
│   └── lib/
│       └── supabase.js      # Cliente Supabase + funções de API
├── public/
│   └── vite.svg             # Favicon
├── dist/                    # Build de produção (gerado)
├── supabase_setup.sql       # SQL para criar tabelas
├── package.json             # Dependências
├── vite.config.js           # Configuração do Vite
└── PROMPT_CLAUDE_CODE.md    # Instruções para Claude Code
```

---

## ✅ O QUE JÁ ESTÁ PRONTO

| Item | Status | Observação |
|------|--------|------------|
| Landing page React | ✅ Pronto | Design completo com todas seções |
| Integração Supabase | ✅ Pronto | Credenciais configuradas |
| Formulário de captura | ✅ Pronto | Valida e formata CNPJ/WhatsApp |
| Countdown para 2026 | ✅ Pronto | Atualiza em tempo real |
| Build de produção | ✅ Pronto | Otimizado para deploy |
| SQL das tabelas | ✅ Pronto | Arquivo supabase_setup.sql |

---

## ⏳ O QUE FALTA FAZER

| Item | Responsável | Como fazer |
|------|-------------|------------|
| Criar tabelas no Supabase | Claude Code (VS Code) | Executar supabase_setup.sql |
| Deploy no Vercel | Claude Code (VS Code) | `vercel --prod` |
| Configurar domínio | Claude Code (VS Code) | `vercel domains add contta.com.br` |
| Integrar CNPJá | Desenvolvimento futuro | Edge Function no Supabase |
| Integrar calculadora SERPRO | Desenvolvimento futuro | Conectar à API existente |
| WhatsApp Business | Sérgio | Aguardando homologação |
| Gateway de pagamento | Desenvolvimento futuro | Stripe ou Asaas |

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Abrir VS Code com Claude Code**
2. **Colar o conteúdo do arquivo PROMPT_CLAUDE_CODE.md**
3. **Deixar o Claude Code executar tudo automaticamente**
4. **Resultado: Site no ar em contta.com.br**

---

## 📞 RESUMO EXECUTIVO

> **O que é:** Landing page para capturar leads interessados na Reforma Tributária
> 
> **Para quem:** Empresários e contadores
> 
> **Modelo de negócio:** Freemium (teste grátis → assinatura paga)
> 
> **Usa infraestrutura existente:** Mesmo Supabase do projeto SERPRO
> 
> **Investimento:** Zero (usa ferramentas gratuitas/já pagas)
> 
> **Potencial de receita:** R$ 10.000-20.000/mês recorrente

---

*Documento gerado em 27/12/2024 para Sérgio Carneiro Leão - AMPLA Contabilidade*
