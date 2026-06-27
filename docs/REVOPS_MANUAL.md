# REVOPS_MANUAL.md — NexoraField AI
## Manual de Revenue Operations (RevOps) — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026 | Fase: 8

---

## Visão Geral

O CRM de Receita (RevOps) da NexoraField AI automatiza todo o ciclo comercial desde a geração de leads até a expansão e renovação de contratos, integrando Vendas, Marketing e Customer Success em um único fluxo orquestrado.

---

## Funil de Receita — Revenue Motion

```
Lead → MQL → SQL → Oportunidade → Proposta → Negociação → 
Contrato → Onboarding → Ativação → Expansão → Renovação
```

### Definições

| Estágio | Definição | Critérios de Qualificação |
|---------|-----------|--------------------------|
| Lead | Interesse inicial | Preencheu formulário ou acessou o site |
| MQL | Lead Qualificado Marketing | Score > 40, segmento correto, tamanho adequado |
| SQL | Lead Qualificado Vendas | Contato feito, budget confirmado, decisor identificado |
| Oportunidade | Demo agendada | Reunião realizada, proposta em elaboração |
| Proposta | Proposta enviada | Documento formal enviado |
| Negociação | Em negociação | Feedback recebido, contrapropostas |
| Contrato | Fechamento | Assinou, pagamento autorizado |
| Onboarding | Em implantação | Wizard em andamento |
| Ativação | Go-live | Primeiro chamado criado |
| Expansão | Upsell/Cross-sell | Adquiriu módulo adicional ou mais usuários |
| Renovação | Renovação de contrato | Ciclo completo, renovou assinatura |

---

## Scoring de Leads

### Critérios de Pontuação

| Critério | Pontos |
|----------|--------|
| Visitou página de preços | +15 |
| Usou simulador de ROI | +20 |
| Assistiu vídeo institucional | +10 |
| Preencheu formulário de contato | +30 |
| Abriu e-mail de campanha | +5 |
| Clicou em CTA do e-mail | +10 |
| Acessou cases de sucesso | +8 |
| Segmento prioritário (Telecom, Solar) | +25 |
| Empresa com 10+ técnicos | +20 |
| Possui CNPJ ativo há 2+ anos | +15 |

### Threshold
- MQL: Score ≥ 40
- SQL: Score ≥ 70 + contato SDR

---

## Automações por Estágio

### Lead → MQL
```
Trigger: Score ≥ 40
Ações:
- Notificar SDR via Slack/n8n
- Adicionar à sequência de e-mails
- WhatsApp de qualificação (Evolution API)
- Tag CRM: "mql_auto"
```

### SQL → Oportunidade
```
Trigger: SDR marca como SQL
Ações:
- Criar card no pipeline de vendas
- Gerar proposta automática via IA
- Agendar demo via Calendly
- Notificar AE responsável
```

### Contrato → Onboarding
```
Trigger: Contrato assinado + pagamento confirmado
Ações:
- Criar tenant no sistema
- Enviar e-mail de boas-vindas (Resend)
- WhatsApp de onboarding (Evolution API)
- Iniciar wizard de implantação
- Criar card no board de onboarding
- Notificar CSM responsável
```

### Ativação → Expansão (Triggers de Upsell)
```
- Uso > 80% do limite do plano → Proposta de upgrade
- 3 meses sem churn → Proposta cross-sell
- NPS ≥ 9 → Programa de indicação + depoimento
- Health Score > 85 → Oferta de módulo premium
```

---

## Eventos para n8n

Cada mudança de estágio dispara um evento via webhook:

```json
POST https://n8n.nexorafield.com/webhook/crm-events
{
  "event": "STAGE_CHANGED",
  "leadId": "lead-123",
  "company": "TeleRede Fibra",
  "fromStage": "SQL",
  "toStage": "Oportunidade",
  "timestamp": "2026-06-27T14:30:00Z",
  "metadata": {
    "assignedTo": "joao.silva@nexora.com",
    "value": 697,
    "probability": 0.65
  }
}
```

### Tipos de Eventos
- `LEAD_CREATED` — Novo lead capturado
- `STAGE_CHANGED` — Mudança de estágio no funil
- `DEAL_WON` — Negócio fechado
- `DEAL_LOST` — Negócio perdido
- `CHURN_DETECTED` — Risco de cancelamento
- `UPSELL_OPPORTUNITY` — Oportunidade de expansão
- `RENEWAL_DUE` — Contrato a vencer

---

## KPIs de RevOps

| Métrica | Meta | Descrição |
|---------|------|-----------|
| MRR | +10%/mês | Receita Recorrente Mensal |
| ARR | Meta anual | MRR × 12 |
| CAC | < R$ 400 | Custo de Aquisição de Cliente |
| LTV | > R$ 5.000 | Lifetime Value médio |
| Payback | < 6 meses | CAC / MRR por cliente |
| Churn Rate | < 3%/mês | Taxa de cancelamento |
| Win Rate | > 30% | Propostas → Clientes |
| Ciclo de Venda | < 20 dias | Lead → Fechamento |
| Conversão Trial | > 25% | Trial → Pagante |
| Expansão MRR | > R$ 5k/mês | Upsell + Cross-sell |

---

## Critérios de Aceitação
- [ ] Pipeline CRM com todos os estágios do funil
- [ ] Lead scoring automático funcional
- [ ] Mudanças de estágio disparam webhooks n8n
- [ ] Proposta gerada automaticamente por IA
- [ ] Integração com Calendly para demos
- [ ] Dashboards RevOps com métricas em tempo real
- [ ] Automações de upsell e cross-sell ativas
- [ ] Eventos de churn detectados proativamente
