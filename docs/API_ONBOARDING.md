# API_ONBOARDING.md — NexoraField AI
## API de Onboarding — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026

---

## Visão Geral

A API de Onboarding da NexoraField AI permite integrar o processo de cadastro, implantação e configuração de novas empresas de forma programática, sem passar pelo fluxo de UI.

---

## Autenticação

```http
POST /api/auth/token
Content-Type: application/json

{
  "email": "admin@empresa.com.br",
  "password": "SenhaSegura@2026"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGci...",
  "expiresIn": 86400,
  "tenantId": "tenant-abc123"
}
```

Usar o token no header:
```http
Authorization: Bearer eyJhbGci...
```

---

## Endpoints de Onboarding

### 1. Criar Empresa
```http
POST /api/onboarding/company
Authorization: Bearer {token}

{
  "name": "TeleRede Fibra SP Ltda",
  "cnpj": "12.345.678/0001-90",
  "segment": "Telecom & ISP",
  "city": "São Paulo",
  "state": "SP",
  "phone": "(11) 9 9999-0000"
}
```

**Resposta:** `201 Created`
```json
{
  "companyId": "comp-xyz",
  "tenantId": "tenant-abc",
  "status": "onboarding",
  "nextStep": "CREATE_ADMIN"
}
```

### 2. Criar Administrador
```http
POST /api/onboarding/admin
Authorization: Bearer {token}

{
  "companyId": "comp-xyz",
  "name": "João Silva",
  "email": "joao@telerede.com.br",
  "phone": "(11) 9 8888-7777",
  "password": "AdminSeguro@2026"
}
```

### 3. Selecionar Plano
```http
POST /api/onboarding/plan
Authorization: Bearer {token}

{
  "companyId": "comp-xyz",
  "planId": "business",
  "billingCycle": "monthly",
  "couponCode": "NEXORA30"
}
```

**Resposta:**
```json
{
  "subscriptionId": "sub-789",
  "plan": "business",
  "price": 487.90,
  "discount": 30,
  "trialDays": 14,
  "billingStartDate": "2026-07-11",
  "paymentOptions": {
    "pix": { "qrCode": "base64...", "expiry": "2026-06-27T15:30:00Z" },
    "boleto": { "barcode": "34191...", "dueDate": "2026-06-30" }
  }
}
```

### 4. Configurar Departamentos
```http
POST /api/onboarding/departments
Authorization: Bearer {token}

{
  "companyId": "comp-xyz",
  "departments": [
    { "name": "Instalações", "slaHours": 4 },
    { "name": "Manutenção Corretiva", "slaHours": 2 },
    { "name": "Suporte Técnico", "slaHours": 8 }
  ]
}
```

### 5. Configurar Regiões
```http
POST /api/onboarding/regions
Authorization: Bearer {token}

{
  "companyId": "comp-xyz",
  "regions": [
    { "name": "Grande SP", "states": ["SP"], "radiusKm": 50 },
    { "name": "Interior SP", "cities": ["Campinas", "Ribeirão Preto"], "radiusKm": 30 }
  ]
}
```

### 6. Cadastrar Técnicos em Lote
```http
POST /api/onboarding/technicians/bulk
Authorization: Bearer {token}

{
  "companyId": "comp-xyz",
  "technicians": [
    {
      "name": "Alexandre Santos",
      "email": "alex@email.com",
      "phone": "(11) 9 7777-6666",
      "specialties": ["Fibra Óptica", "GPON"],
      "city": "São Paulo",
      "radiusKm": 30
    }
  ]
}
```

### 7. Status do Onboarding
```http
GET /api/onboarding/{companyId}/status
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "companyId": "comp-xyz",
  "progress": 75,
  "completedSteps": ["company", "admin", "plan", "departments", "regions"],
  "pendingSteps": ["technicians", "integrations", "notifications"],
  "estimatedCompletion": "2026-06-27T16:00:00Z"
}
```

### 8. Completar Onboarding
```http
POST /api/onboarding/{companyId}/complete
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "status": "active",
  "dashboardUrl": "https://app.nexorafield.com.br/empresa",
  "welcomeEmailSent": true,
  "whatsappSent": true,
  "calendarInviteSent": true
}
```

---

## Webhooks de Onboarding

Configure uma URL de webhook para receber eventos:

```http
POST /api/webhooks
Authorization: Bearer {token}

{
  "url": "https://suaempresa.com/nexora-webhook",
  "events": ["onboarding.step_completed", "onboarding.completed", "subscription.activated"]
}
```

**Payload de Evento:**
```json
{
  "event": "onboarding.completed",
  "timestamp": "2026-06-27T15:30:00Z",
  "data": {
    "companyId": "comp-xyz",
    "tenantId": "tenant-abc",
    "plan": "business",
    "adminEmail": "joao@telerede.com.br"
  }
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Dados inválidos (CNPJ, e-mail, etc.) |
| 401 | Token expirado ou inválido |
| 403 | Sem permissão para este recurso |
| 409 | CNPJ ou e-mail já cadastrado |
| 422 | Regra de negócio violada |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Rate Limits

| Endpoint | Limite |
|----------|--------|
| POST /api/onboarding/* | 10 req/min |
| GET /api/onboarding/* | 60 req/min |
| POST /api/auth/token | 5 req/min |

---

## SDKs Disponíveis

- Node.js: `npm install @nexorafield/sdk`
- Python: `pip install nexorafield-sdk`
- PHP: `composer require nexorafield/sdk`
