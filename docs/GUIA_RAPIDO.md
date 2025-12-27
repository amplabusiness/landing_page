# CONTTA - Sistema Multi-Tenant

## Arquitetura
```
┌─────────────────────────────────────────────────────────────┐
│                     CONTTA (único sistema)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Cliente 1: AMPLA Contabilidade (252 empresas)             │
│   Cliente 2: Escritório X                                   │
│   Cliente 3: Empresário Y                                   │
│                                                             │
│   Mesmo Supabase, separado por tenant_id                    │
│   Mesma base de código                                      │
│   Features liberadas por plano                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura do Banco (Supabase)

| Tabela      | Descrição                               |
|-------------|-----------------------------------------|
| tenants     | Escritórios/empresários (clientes Contta) |
| usuarios    | Usuários de cada tenant                 |
| empresas    | Empresas/clientes de cada tenant        |
| leads       | Leads da landing page                   |
| analises    | Análises da reforma tributária          |
| cache_cnpj  | Cache de consultas CNPJ                 |

## Planos

| Plano      | Empresas | Usuários | Features                    |
|------------|----------|----------|-----------------------------|
| free       | 5        | 1        | Básico                      |
| starter    | 50       | 3        | + Relatórios                |
| pro        | 200      | 10       | + API + Integrações         |
| enterprise | Ilimitado| Ilimitado| Tudo + Suporte prioritário  |

---

## ETAPA 1: CRIAR TABELAS NO SUPABASE

1. Acesse: https://supabase.com/dashboard/project/yqcsoljcoifznxzptrrr/sql/new
2. Cole TODO o conteúdo do arquivo `supabase_setup.sql`
3. Clique no botão verde **"Run"**

---

## ETAPA 2: DEPLOY NO VERCEL

1. Acesse: https://vercel.com/new/upload
2. Arraste a pasta `contta-landing-deploy/dist`
3. Clique **"Deploy"**
4. Depois de pronto, vá em **Settings → Domains** e adicione: `contta.com.br`

---

## Credenciais

- **Supabase URL:** https://yqcsoljcoifznxzptrrr.supabase.co
- **Supabase Anon Key:** Configurada no código

## Tenant Inicial

O SQL já cria a AMPLA Contabilidade como primeiro tenant:
- Nome: AMPLA Contabilidade
- Slug: ampla
- Plano: enterprise
- Limite: 999 empresas, 50 usuários
