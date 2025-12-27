# PRÓXIMOS PASSOS - Calculadora IBS/CBS 2026

## O QUE JÁ FOI FEITO

### Infraestrutura
- [x] Projeto criado no Vercel
- [x] DNS contta.com.br apontado (propagando)
- [x] Tabelas Supabase criadas (leads_reforma, tenants, analises)
- [x] AMPLA cadastrada como primeiro tenant
- [x] Estrutura de diretórios organizada
- [x] .gitignore protegendo .env

### Stripe
- [x] Conta configurada
- [x] 3 produtos criados:
  - Profissional: R$ 97/mês (price_1SitTl8RybYfMeLiV3iBIVcZ)
  - Escritório: R$ 297/mês (price_1SitTl8RybYfMeLiILWnwuiF)
  - Enterprise: R$ 997/mês (price_1SitTm8RybYfMeLiKBPttZJd)

### Backend (Projeto SERPRO)
- [x] 22 APIs SERPRO funcionando
- [x] APIs de Reforma Tributária prontas
- [x] Parser PDF PGDAS-D (Python)
- [x] Serper.dev integrado
- [x] 50+ Tools MCP

---

## O QUE FALTA FAZER

### Frontend (Prioridade 1)
- [ ] Criar landing page moderna
- [ ] Simulador NF-e (5 notas grátis)
- [ ] Formulário de captura de leads
- [ ] Página de preços com checkout Stripe
- [ ] Dashboard do assinante

### Módulos da Calculadora (Prioridade 2)
- [ ] Importador PGDAS-D
- [ ] Importador SPED Fiscal
- [ ] Importador SPED Contribuições
- [ ] Dashboard comparativo

### Integrações (Prioridade 3)
- [ ] Webhook Stripe → Supabase
- [ ] WhatsApp notificações
- [ ] CRM para leads

### Segurança (Prioridade 4)
- [ ] LGPD compliance
- [ ] Audit logs
- [ ] Criptografia dados sensíveis
- [ ] Rate limiting

---

## COMANDO PARA CONTINUAR

Cole no Claude Code:

```
Continuar o projeto Calculadora IBS/CBS 2026.
Projeto está em: c:/Users/ampla/OneDrive/Documentos/lanpage

Próximo passo: Criar o frontend React com:
1. Landing page moderna com calculadora
2. Integração com Stripe para checkout
3. Conexão com APIs do backend SERPRO

Backend SERPRO está em: c:/Users/ampla/OneDrive/Documentos/serpro
Usa as mesmas credenciais Supabase.
```

---

## CREDENCIAIS (Já configuradas no .env)

- **Supabase:** yqcsoljcoifznxzptrrr
- **Stripe:** contta inteligencia fiscal (modo teste)
- **Vercel:** sergio-carneiro-leaos-projects
- **GitHub:** amplabusiness/landing_page

---

## ARQUIVOS IMPORTANTES

```
lanpage/
├── .env                    # Credenciais (NÃO commitar)
├── .env.example            # Template
├── frontend/               # React app
├── database/migrations/    # SQL Supabase
├── scripts/stripe/         # Setup Stripe
└── docs/                   # Documentação
```

---

## URLS

- **Vercel:** https://contta-landing-deploy.vercel.app
- **Domínio:** contta.com.br (DNS propagando)
- **Stripe Dashboard:** https://dashboard.stripe.com/test/products
- **Supabase:** https://supabase.com/dashboard/project/yqcsoljcoifznxzptrrr
