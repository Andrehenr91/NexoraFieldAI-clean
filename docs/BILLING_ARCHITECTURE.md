# BILLING_ARCHITECTURE.md — NexoraField AI
## Arquitetura de Billing SaaS — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026 | Fase: 3

---

## Visão Geral

O sistema de Billing da NexoraField AI é uma engine de cobrança recorrente multi-gateway que suporta múltiplos planos, períodos de faturamento, métodos de pagamento e automações de lifecycle.

---

## Gateways Integrados

### 1. Asaas (Principal — Brasil)
- PIX, Boleto, Cartão de Crédito, Débito em Conta
- Cobrança recorrente automática
- Webhook de confirmação de pagamento
- Emissão de NF-e automática
- Split de pagamento nativo

### 2. Stripe (Internacional)
- Cartão de Crédito/Débito (Visa, MC, Amex)
- SEPA (Europa)
- Subscription management via Stripe Billing
- Webhook de eventos de pagamento
- Dashboard de métricas

### 3. Efí (ex-Gerencianet)
- PIX (alta confiabilidade)
- Boleto bancário
- Cobranças recorrentes
- Webhook de confirmação

### 4. Mercado Pago (Opcional)
- PIX, Cartão, Boleto
- Mercado Crédito
- Integração com ecossistema MP

---

## Modelos de Assinatura

### Planos Disponíveis
| Plano | Mensal | Anual | Trial | Técnicos | Chamados |
|-------|--------|-------|-------|----------|---------|
| Starter | R$ 297 | R$ 249 | 14d | 10 | 50/mês |
| Business | R$ 697 | R$ 590 | 14d | 50 | 300/mês |
| Enterprise | R$ 1.497 | R$ 1.249 | 14d | Ilimitado | Ilimitado |
| White Label | R$ 3.997 | R$ 3.497 | 14d | Ilimitado | Ilimitado |

### Ciclos de Faturamento
- **Mensal**: Cobrança no mesmo dia todo mês
- **Anual**: Cobrança única com 16% de desconto
- **Trial**: 14 dias gratuitos sem cartão

### Cobrança Proporcional (Prorate)
Quando o cliente faz upgrade no meio do ciclo:
```
Valor proporcional = (dias restantes / dias do mês) × (novo_preço - preço_atual)
```

---

## Estados da Assinatura

```
Trial → Ativo → Suspenso → Reativado → Cancelado
                  ↓
              Expirado
```

| Estado | Descrição | Ação Automática |
|--------|-----------|-----------------|
| Trial | 14 dias grátis | E-mail d-3, d-1 |
| Ativo | Pagamento em dia | Renovação automática |
| Suspenso | Inadimplência | Bloquear acesso parcial |
| Expirado | Trial sem converter | E-mail de recuperação |
| Cancelado | Cliente solicitou | Período de graça 30d |
| Reativado | Pagamento efetuado | Restaurar acesso |

---

## Métodos de Pagamento

### PIX
- QR Code dinâmico gerado via Asaas/Efí
- Aprovação instantânea via webhook
- Expiração em 30 minutos
- Chave PIX CNPJ NexoraField

### Cartão de Crédito
- Tokenização via Stripe/Asaas
- Dados nunca armazenados (PCI-DSS)
- Retry automático em caso de falha
- 3D Secure para compras internacionais

### Boleto Bancário
- Vencimento em 3 dias úteis
- Envio automático por e-mail
- Código de barras e linha digitável
- Compensação em até 3 dias úteis

---

## Sistema de Cupons

### Estrutura do Cupom
```json
{
  "code": "NEXORA30",
  "type": "percentage",
  "value": 30,
  "maxUses": 500,
  "usedCount": 142,
  "validUntil": "2026-12-31",
  "plans": ["business", "enterprise"],
  "firstMonthOnly": false
}
```

### Tipos de Cupom
- `percentage`: Desconto percentual (ex: 30%)
- `fixed`: Desconto fixo (ex: R$ 100)
- `trial_extension`: Extensão do trial (ex: +7 dias)
- `free_months`: Meses grátis (ex: 2 meses)

---

## Sistema de Créditos

- Créditos são creditados em R$ na conta do cliente
- Aplicados automaticamente na próxima fatura
- Gerados por: indicações, cashback, promoções
- Validade de 12 meses

---

## Sistema de Cashback

- Cashback de 5% para pagamentos anuais
- Cashback de 2% para pagamentos mensais via PIX
- Creditado após confirmação do pagamento
- Aplicável nas próximas faturas

---

## Split de Pagamento

Quando uma empresa paga por um chamado técnico:
```
Total Chamado = R$ 500
Plataforma (15%) = R$ 75
Técnico (85%) = R$ 425 → PIX instantâneo
```

---

## Nota Fiscal

### NF-e Automática (via Asaas)
- Emitida automaticamente após confirmação de pagamento
- Enviada por e-mail em até 2 horas
- CNPJ/CPF do cliente automaticamente preenchido
- ISS calculado por município

---

## Renovação Automática

```
D-7: E-mail de aviso de renovação
D-3: E-mail de confirmação de método de pagamento
D-0: Cobrança automática
D+1: Falha → Notificação + Retry
D+3: Falha → Suspensão parcial
D+7: Falha → Suspensão total
D+30: Cancelamento automático
```

---

## Webhooks de Billing

```
PAYMENT_CONFIRMED → Ativar/renovar assinatura
PAYMENT_FAILED → Iniciar fluxo de recuperação
SUBSCRIPTION_CANCELLED → Iniciar offboarding
TRIAL_ENDING → Enviar oferta de conversão
INVOICE_CREATED → Enviar e-mail com fatura
REFUND_PROCESSED → Creditar na conta
```

---

## Critérios de Aceitação
- [ ] Asaas integrado e funcional
- [ ] Stripe integrado para clientes internacionais
- [ ] PIX com QR Code dinâmico
- [ ] Renovação automática operacional
- [ ] Cupons com validação
- [ ] Créditos e cashback implementados
- [ ] NF-e automática habilitada
- [ ] Webhooks de billing configurados
- [ ] Cobrança proporcional em upgrades
