# CRM_AUTOMATION.md — NexoraField AI
## Automação de CRM — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026 | Fase: 9

---

## Visão Geral

O sistema de automação da NexoraField AI usa n8n como orquestrador central, integrando múltiplas ferramentas para automatizar o ciclo completo de vendas, onboarding, customer success e renovação.

---

## Stack de Automação

| Ferramenta | Função |
|------------|--------|
| n8n | Orquestrador de workflows |
| Gemini AI | IA para geração de conteúdo e análise |
| Evolution API | WhatsApp Business |
| Resend | E-mail transacional e marketing |
| Twilio | SMS e chamadas de voz |
| Google Calendar | Agendamentos |
| Google Meet | Reuniões de vídeo |
| Calendly | Self-scheduling de demos |

---

## Workflows de Automação

### 1. Boas-vindas (Onboarding Welcome)
**Trigger**: Cadastro concluído
```
NexoraField API → n8n → [
  Resend: E-mail de boas-vindas personalizado,
  Evolution API: WhatsApp "Seja bem-vindo(a)!",
  Google Calendar: Invite para webinar de boas-vindas,
  CRM: Criar card de onboarding
]
```

### 2. Agendamento de Demo
**Trigger**: Lead qualificado (MQL/SQL)
```
CRM Lead Score ≥ 70 → n8n → [
  Calendly: Gerar link de agendamento personalizado,
  Resend: E-mail com link Calendly,
  Google Meet: Criar sala de reunião,
  CRM: Atualizar status para "Demo Agendada"
]
```

### 3. Sequência de Treinamento
**Trigger**: D+1 após ativação
```
Onboarding Completo → n8n → [
  D+1: Resend "Comece pelos tutoriais" + link módulo 1,
  D+3: Resend "Próximos passos" + vídeo de funcionalidade,
  D+7: Resend "Como está indo?" + survey CSAT,
  D+14: Resend "Você sabia?" + feature discovery,
  D+30: Resend "Resultados do 1º mês" + case de sucesso
]
```

### 4. Cobrança e Recuperação
**Trigger**: Pagamento pendente
```
Billing → n8n → [
  D-3: Resend "Seu pagamento vence em breve",
  D-1: Resend "Última chance" + link de pagamento,
  D+0: Asaas/Stripe: Cobrança automática,
  D+1 (falha): Twilio SMS "Falha no pagamento",
  D+3 (falha): Evolution API WhatsApp urgente,
  D+7 (falha): Suspensão parcial + e-mail,
  D+30 (falha): Cancelamento + e-mail de recuperação
]
```

### 5. Renovação de Contrato
**Trigger**: 60 dias antes do vencimento
```
Billing Anniversary → n8n → [
  D-60: Resend "Prepare sua renovação" + relatório anual,
  D-30: Resend proposta de renovação com desconto,
  D-15: Twilio SMS lembrete,
  D-7: Evolution API WhatsApp + link de renovação,
  D-1: Resend urgente,
  D+0: Cobrança automática ou escalonamento para CS
]
```

### 6. Alertas de Risco de Churn
**Trigger**: Health Score < 45
```
CS Monitor → n8n → [
  Slack: Alerta para CSM responsável,
  CRM: Tag "at-risk" + criar task para CSM,
  Resend: E-mail de valor para o cliente,
  Calendly: Convite para call de sucesso,
  Gemini AI: Gerar análise de risco personalizada
]
```

### 7. Pesquisas Automáticas
**Trigger**: Após eventos específicos
```
CSAT: Após cada chamado concluído →
  Resend: E-mail de avaliação (1 pergunta)
  
NPS: Trimestral →
  Resend: Pesquisa NPS completa
  
CES: Após onboarding →
  Resend: Pesquisa de esforço
```

### 8. Recuperação de Clientes Inativos
**Trigger**: Sem login há 14 dias
```
Usage Monitor → n8n → [
  D+7: Resend "Sentimos sua falta",
  D+14: Evolution API WhatsApp personalizado,
  D+21: Twilio SMS,
  D+30: Resend "Oferta especial de reativação",
  D+45: Escalonamento para CS
]
```

### 9. Expansão e Upsell
**Trigger**: Health Score > 85 por 30 dias
```
CS Monitor → n8n → [
  Gemini AI: Analisar perfil e gerar proposta de upsell,
  Resend: E-mail de proposta personalizada,
  CRM: Criar oportunidade de expansão,
  CSM: Notificação para follow-up
]
```

---

## Configuração n8n

### Variáveis de Ambiente
```env
N8N_URL=https://n8n.nexorafield.com
N8N_API_KEY=xxx
NEXORA_WEBHOOK_SECRET=xxx
```

### Endpoints de Webhook n8n
```
POST /webhook/new-registration
POST /webhook/crm-events
POST /webhook/billing-events
POST /webhook/cs-alerts
POST /webhook/survey-responses
```

---

## Configuração Twilio
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+55119...
```

**Uso:**
- SMS de verificação de cadastro
- Alertas de cobrança
- Lembretes de renovação
- Confirmação de agendamento

---

## Configuração Google Calendar/Meet
```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_ID=nexorafield@gmail.com
```

**Uso:**
- Agendamento de demos via Calendly
- Criação automática de sala Meet
- Convites para webinars de treinamento
- QBRs com clientes enterprise

---

## Critérios de Aceitação
- [ ] n8n configurado e operacional
- [ ] Fluxo de boas-vindas ativo
- [ ] Sequência de treinamento automatizada
- [ ] Cobrança e recuperação automatizadas
- [ ] Renovação automática 60 dias antes
- [ ] Alertas de churn disparando para CSM
- [ ] NPS/CSAT/CES enviados automaticamente
- [ ] Recovery de inativos ativo
- [ ] Twilio SMS configurado
- [ ] Google Calendar/Meet integrado
- [ ] Calendly sincronizado com demos
