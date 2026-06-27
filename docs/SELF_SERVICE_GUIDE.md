# SELF_SERVICE_GUIDE.md — NexoraField AI
## Guia de Self-Service — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026

---

## Visão Geral

Este guia documenta todos os fluxos de autoatendimento disponíveis na NexoraField AI, permitindo que empresas e usuários realizem configurações, modificações e solicitações sem precisar contatar o suporte.

---

## Jornada Completa Self-Service

```
1. Landing Page → 2. Registro → 3. Pagamento → 4. Onboarding → 
5. Configuração → 6. Treinamento → 7. Go-Live → 8. Expansão
```

Toda a jornada ocorre sem intervenção humana da equipe Nexora.

---

## 1. Cadastro da Empresa (Self-Service)

### Dados necessários
- CNPJ (validado automaticamente)
- Razão Social
- Segmento de atuação
- Cidade e Estado
- Telefone de contato

### Validações automáticas
- CNPJ: algoritmo de dígito verificador
- E-mail: confirmação por código de 6 dígitos
- Telefone: verificação via SMS (opcional)
- Unicidade: verificação de CNPJ/e-mail duplicados

---

## 2. Seleção de Plano

Disponível a qualquer momento, inclui:
- Simulador de ROI integrado
- Comparativo de planos
- Cupom de desconto
- Toggle mensal/anual

---

## 3. Pagamento Self-Service

### PIX
1. Clique em "PIX"
2. QR Code gerado instantaneamente
3. Pague pelo app do banco
4. Aprovação automática em segundos
5. Acesso imediato

### Cartão de Crédito
1. Insira dados do cartão (tokenizados)
2. Aprovação automática em tempo real
3. Parcelas disponíveis para planos anuais
4. Cobrança recorrente configurada automaticamente

### Boleto
1. Boleto gerado automaticamente
2. Enviado por e-mail e disponível no painel
3. Aprovação em até 3 dias úteis
4. Acesso liberado após compensação

---

## 4. Gerenciamento da Assinatura

### Upgrade de Plano
1. Acesse Configurações → Assinatura
2. Clique em "Mudar Plano"
3. Selecione o novo plano
4. Valor proporcional calculado automaticamente
5. Cobrança imediata do diferencial

### Downgrade de Plano
1. Acesse Configurações → Assinatura
2. Clique em "Reduzir Plano"
3. Aviso sobre funcionalidades a serem removidas
4. Efetivado no próximo ciclo de faturamento

### Cancelamento
1. Acesse Configurações → Assinatura
2. Clique em "Cancelar Assinatura"
3. Período de graça de 30 dias
4. Exportação de dados disponível por 90 dias
5. Sem multa de cancelamento

### Reativação
1. Acesse o link no e-mail de cancelamento
2. Ou faça login com suas credenciais
3. Escolha o plano
4. Pague para reativar imediatamente

---

## 5. Gerenciamento de Usuários

### Convidar Usuário
```
Configurações → Usuários → Convidar
Informe: nome, e-mail, papel (admin/gestor/técnico/financeiro)
Link enviado por e-mail com expiração em 72h
```

### Remover Usuário
```
Configurações → Usuários → [Usuário] → Remover
Confirmação por e-mail exigida para ação sensível
```

### Alterar Papel
```
Configurações → Usuários → [Usuário] → Editar Papel
Auditado no log de ações
```

---

## 6. Importação de Dados

### Formatos Aceitos
- CSV (UTF-8, separador vírgula ou ponto-vírgula)
- Excel (.xlsx, .xls)
- JSON
- API REST (para sistemas integrados)
- Google Sheets (OAuth2)

### Entidades Importáveis
- Clientes/Empresas
- Técnicos
- Equipamentos/Ativos
- Ordens de Serviço (histórico)
- Produtos e Serviços
- Estoque
- Contratos
- Leads

### Processo de Importação
1. Baixe o template CSV
2. Preencha com seus dados
3. Faça upload
4. Validação automática (duplicatas, campos obrigatórios)
5. Preview dos dados a importar
6. Confirme a importação

---

## 7. Integrações Self-Service

### API REST
1. Acesse Configurações → Integrações → API
2. Gere sua API Key
3. Copie a documentação OpenAPI
4. Integre com seu sistema

### Webhooks
1. Acesse Configurações → Webhooks
2. Informe a URL de destino
3. Selecione os eventos de interesse
4. Teste o webhook
5. Ative

### n8n
1. Acesse Configurações → Automações → n8n
2. Copie a URL do webhook NexoraField
3. Importe os workflows prontos
4. Configure credenciais

---

## 8. Suporte Self-Service

### Base de Conhecimento
- /ajuda — Central de artigos
- /videos — Tutoriais em vídeo
- /api — Documentação da API

### Status da Plataforma
- /status — Uptime em tempo real
- Histórico de incidentes
- RSS feed de atualizações

### Chat com IA
- Disponível 24/7 no canto inferior direito
- Powered by Gemini AI
- Contexto do seu plano e configuração
- Escala para humano se necessário

---

## 9. Exportação e Portabilidade de Dados (LGPD)

### Solicitar Exportação
1. Configurações → Privacidade → Exportar Meus Dados
2. Selecione o período
3. Formato: JSON ou CSV
4. Download disponível em até 24h

### Direito ao Esquecimento
1. Configurações → Privacidade → Solicitar Exclusão
2. Confirmação via e-mail
3. Dados removidos em até 30 dias
4. Log de auditoria mantido por 5 anos (obrigação legal)

---

## Critérios de Aceitação
- [ ] Cadastro completo sem intervenção humana
- [ ] Todos os métodos de pagamento funcionais
- [ ] Upgrade/downgrade/cancelamento self-service
- [ ] Convite de usuários por link seguro
- [ ] Importação de dados validada
- [ ] Integrações configuráveis pela interface
- [ ] Chat IA 24/7 disponível
- [ ] Exportação de dados LGPD funcional
