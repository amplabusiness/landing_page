# Calculadora IBS/CBS 2026

Sistema para calcular o impacto da Reforma Tributária (LC 214/2025) nas empresas brasileiras.

**Produto:** Contta
**Empresa:** AMPLA Contabilidade
**IA:** Claude (Anthropic)

---

## Estrutura do Projeto

```
calculadora-ibs-cbs/
├── frontend/           # React + TypeScript + Tailwind
│   ├── src/           # Código fonte
│   ├── dist/          # Build de produção
│   └── public/        # Assets estáticos
│
├── backend/           # (Reutiliza o projeto SERPRO)
│   └── src/           # APIs REST
│
├── database/          # Scripts SQL
│   ├── migrations/    # Criação de tabelas
│   └── seeds/         # Dados iniciais
│
├── scripts/           # Utilitários
│   ├── stripe/        # Setup de produtos Stripe
│   └── deploy/        # Scripts de deploy
│
├── docs/              # Documentação
│   ├── ARQUITETURA_CALCULADORA.md
│   ├── EXPLICACAO_PROJETO.md
│   └── GUIA_RAPIDO.md
│
├── supabase/          # Config Supabase local
│
├── .env.example       # Template de variáveis
├── .env               # Variáveis (NÃO COMMITAR!)
└── .gitignore         # Arquivos ignorados
```

---

## Requisitos

- Node.js 18+
- npm ou pnpm
- Conta Supabase
- Conta Stripe
- Backend SERPRO rodando (opcional para dev)

---

## Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/amplabusiness/landing_page.git
cd landing_page

# 2. Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Instalar dependências do frontend
cd frontend
npm install

# 4. Rodar em desenvolvimento
npm run dev

# 5. Build para produção
npm run build
```

---

## Scripts Disponíveis

```bash
# Frontend
cd frontend
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build

# Stripe
node scripts/stripe/setup-stripe-products.js  # Criar produtos
```

---

## Deploy

O projeto está configurado para deploy automático no Vercel:

1. Push para `main` dispara deploy
2. Domínio: `contta.com.br`
3. Preview em cada PR

---

## Banco de Dados

### Migrations

```bash
# Executar no SQL Editor do Supabase:
database/migrations/001_leads_reforma.sql
database/migrations/002_tenants.sql
```

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| leads_reforma | Leads capturados |
| tenants | Escritórios/clientes |
| analises_reforma | Resultados de análises |

---

## APIs

O backend (projeto SERPRO) expõe:

```
GET  /api/reforma/cronograma
GET  /api/reforma/setores-reducao
GET  /api/reforma/cesta-basica
POST /api/reforma/relatorio-comparativo
POST /api/pdf/pgdasd
...
```

Ver `docs/ARQUITETURA_CALCULADORA.md` para lista completa.

---

## Planos e Preços

| Plano | Preço | Empresas |
|-------|-------|----------|
| Profissional | R$ 97/mês | 10 |
| Escritório | R$ 297/mês | 50 |
| Enterprise | R$ 997/mês | Ilimitado |

---

## Segurança

- `.env` no `.gitignore`
- RLS no Supabase
- Chaves separadas teste/produção
- Sem credenciais no código

---

## Contato

- **Site:** contta.com.br
- **Email:** sergio@amplabusiness.com.br
- **WhatsApp:** (configurar)

---

## Licença

Proprietário - AMPLA Contabilidade LTDA
