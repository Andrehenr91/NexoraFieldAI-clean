# ONBOARDING_GUIDE.md — NexoraField AI
## Guia de Onboarding Autônomo — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026 | Fase: 4

---

## Visão Geral

O Onboarding Autônomo é um assistente inteligente de implantação que guia novas empresas por todo o processo de configuração inicial sem intervenção humana da equipe Nexora. O processo é 100% self-service e leva entre 30 e 60 minutos.

---

## Fluxo de Onboarding

### ETAPA 0% — Boas-vindas
- Apresentação da plataforma
- Visão geral do processo de implantação
- Estimativa de tempo
- Dicas de configuração

### ETAPA 25% — Configuração da Empresa
**Step 1: Empresa**
- Razão Social e CNPJ
- Validação automática de CNPJ
- Consulta automática de dados via API Receita Federal (simulado)
- Segmento de atuação
- Cidade, Estado, telefone

**Step 2: Usuário Administrador**
- Nome completo
- E-mail corporativo
- Senha (mínimo 8 caracteres)
- Aceite de Termos de Uso
- Aceite de Política de Privacidade (LGPD)
- Verificação de e-mail (código de 6 dígitos)
- Verificação por SMS (opcional)
- MFA (Google Authenticator / SMS) — opcional

**Step 3: Plano**
- Seleção: Starter / Business / Enterprise / White Label
- Cupom de desconto
- Resumo de cobrança

**Step 4: Pagamento**
- PIX (aprovação em segundos)
- Cartão de crédito
- Boleto (3 dias úteis)

### ETAPA 50% — Configuração da Plataforma
**Wizard de Onboarding:**

1. **Departamentos**
   - Criar departamentos (ex: Suporte, Instalações, Manutenção)
   - Definir responsável por departamento
   - Configurar SLA por departamento

2. **Equipes**
   - Criar equipes dentro dos departamentos
   - Definir líder de equipe
   - Capacidade máxima de chamados

3. **Regiões de Atuação**
   - Definir regiões geográficas (Estado/Cidade/CEP)
   - Raio de atuação por região
   - Cobertura mínima exigida

4. **Configuração de Planos de Serviço**
   - Tipos de serviço disponíveis
   - Preços sugeridos por categoria
   - SLA por urgência

5. **Permissões e Papéis**
   - Configurar RBAC por papel (admin/gestor/técnico/financeiro)
   - Permissões por módulo
   - Restrições de acesso

### ETAPA 75% — Cadastro Inicial
**Técnicos Iniciais:**
- Cadastro de 1+ técnicos
- Definir especialidades
- Configurar disponibilidade
- Upload de documentação (RG, CPF, CREA/CRT)
- Convite por link seguro (e-mail/WhatsApp)

**Filiais/Unidades:**
- Cadastro de filiais
- Endereço completo
- Responsável por filial

### ETAPA 100% — Integrações e Notificações

**Integrações:**
- Webhook URL para n8n
- API key de cliente
- Integração com sistema de billing (Asaas/Stripe)
- ERP integration (opcional)

**Notificações:**
- Configurar e-mail de notificações (Resend)
- WhatsApp Business (Evolution API)
- SMS (Twilio)
- Notificações push

---

## Validações Automáticas

Cada etapa é validada automaticamente antes de avançar:
- CNPJ válido via algoritmo dígito verificador
- E-mail único no sistema
- Senha atende política de segurança
- Pelo menos 1 técnico cadastrado
- Pelo menos 1 região configurada
- Billing configurado

---

## Convite por Link Seguro

```
https://app.nexorafield.com.br/invite/{token_jwt_expiravel}
```

- Token JWT com expiração de 72 horas
- Vinculado ao e-mail do convidado
- Registro de IP e timestamp
- Auditado no log de ações

---

## Automações Disparadas no Onboarding

1. E-mail de boas-vindas (Resend)
2. WhatsApp de confirmação (Evolution API)
3. Criação do tenant no banco de dados
4. Provisioning do subdomain (se White Label)
5. Webhook para n8n iniciando fluxo de onboarding
6. Agendamento de demo/treinamento (Google Calendar)
7. Criação de card no CRM interno

---

## Critérios de Aceitação
- [ ] Cadastro 100% self-service sem intervenção humana
- [ ] Validação de CNPJ automática
- [ ] Verificação de e-mail funcional
- [ ] SMS opcional implementado
- [ ] MFA opcional configurável
- [ ] Progresso 0/25/50/75/100% visível
- [ ] Cada etapa validada antes de avançar
- [ ] Convite por link seguro funcional
- [ ] Automações n8n integradas
