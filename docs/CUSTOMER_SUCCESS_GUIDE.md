# CUSTOMER_SUCCESS_GUIDE.md — NexoraField AI
## Guia de Customer Success — Documentação Completa

### Versão: 2.0 | Data: 27/06/2026 | Fase: 7

---

## Visão Geral

O módulo de Customer Success da NexoraField AI automatiza o acompanhamento da saúde dos clientes, detecta riscos de churn e executa playbooks proativos para garantir o sucesso e a expansão dos contratos.

---

## Health Score

### Composição do Health Score (0–100)

| Dimensão | Peso | Métricas |
|----------|------|---------|
| Uso da Plataforma | 30% | DAU/MAU, módulos utilizados, login frequência |
| Adoção de Funcionalidades | 25% | % de features ativadas, configurações concluídas |
| Resultados Operacionais | 20% | Chamados concluídos, tempo de resposta, SLA |
| Engajamento | 15% | Abertura de e-mails, participação em treinamentos |
| Satisfação | 10% | NPS, CSAT, CES, avaliações |

### Classificação de Risco

| Score | Classificação | Cor | Ação |
|-------|--------------|-----|------|
| 80–100 | Saudável | Verde | Expansão |
| 60–79 | Estável | Azul | Monitoramento |
| 40–59 | Em Risco | Amarelo | Intervenção |
| 0–39 | Crítico | Vermelho | Resgate urgente |

---

## Métricas de Engajamento

### Uso da Plataforma
- Logins por semana
- Chamados abertos por mês
- Técnicos ativos / cadastrados
- Módulos utilizados nos últimos 30 dias

### Adoção por Módulo
```
IA de Despacho: 87%
App do Técnico: 73%
Relatório IA: 65%
Detecção de Fraudes: 54%
Webhooks/API: 38%
```

---

## Pesquisas de Satisfação

### NPS (Net Promoter Score)
- Enviado trimestralmente via e-mail
- Pergunta: "Em uma escala de 0 a 10, qual a probabilidade de você recomendar a NexoraField?"
- Score: (Promotores - Detratores) / Total
- Benchmark: 72 (referência de mercado)

### CSAT (Customer Satisfaction Score)
- Enviado após cada chamado concluído
- Pergunta: "Como você avalia o serviço prestado?"
- Escala: 1–5 estrelas
- Meta: ≥ 4.5/5

### CES (Customer Effort Score)
- Enviado após onboarding e suporte
- Pergunta: "O quanto foi fácil configurar/usar a NexoraField?"
- Escala: 1–7
- Meta: ≤ 2.5 (menor = melhor)

---

## Alertas de Abandono

### Triggers Automáticos

| Evento | Condição | Alerta |
|--------|----------|--------|
| Inatividade | Sem login em 7 dias | Amarelo |
| Queda de uso | -50% de chamados vs mês anterior | Laranja |
| NPS baixo | Score < 6 | Vermelho |
| Health Score crítico | Score < 40 | Vermelho urgente |
| Trial não convertido | D-3 do fim do trial | E-mail de conversão |
| Feature não adotada | Módulo pago não ativado | Dica proativa |

---

## Playbooks Automáticos

### Playbook 1: Onboarding Incompleto
**Trigger**: Health Score < 30 no D+14
**Ações**:
1. E-mail personalizado com pendências
2. Agendamento automático de call de suporte
3. Vídeo tutorial contextual
4. Notificação para CSM responsável

### Playbook 2: Risco de Churn
**Trigger**: Health Score < 45 por 2 semanas consecutivas
**Ações**:
1. Alerta interno para CSM
2. E-mail de valor com cases de sucesso
3. Oferta de treinamento gratuito
4. Proposta de revisão de plano

### Playbook 3: Expansão
**Trigger**: Health Score > 85 por 30 dias
**Ações**:
1. Proposta de upsell automática
2. E-mail de novidades e funcionalidades premium
3. Convite para programa de beta testers
4. Solicitação de depoimento/case

### Playbook 4: Renovação
**Trigger**: 60 dias antes do vencimento anual
**Ações**:
1. E-mail de resultados obtidos no ano
2. Proposta de renovação com desconto de lealdade
3. Call de revisão de objetivos

---

## Plano de Sucesso

Cada cliente possui um Plano de Sucesso personalizado com:
- Objetivos definidos no onboarding
- Milestones mensuráveis (D+30, D+90, D+180)
- Métricas de sucesso acordadas
- Health Score alvo
- Reuniões de QBR (Quarterly Business Review)

---

## Histórico Completo

### Linha do Tempo do Cliente
```
Cadastro → Onboarding → Ativação → Primeiro Chamado → 
Treinamento → 1º NPS → 1º Renovação → Expansão
```

### Registro de Eventos
- Todas as interações com a plataforma
- E-mails enviados e abertos
- Chamados de suporte
- Treinamentos realizados
- Pesquisas respondidas
- Alterações de plano

---

## Critérios de Aceitação
- [ ] Health Score calculado automaticamente
- [ ] NPS enviado trimestralmente
- [ ] CSAT após cada chamado
- [ ] CES após onboarding
- [ ] Alertas de risco automáticos
- [ ] Playbooks executados sem intervenção
- [ ] Histórico completo auditável
- [ ] Plano de Sucesso por cliente
- [ ] Dashboard de CS em tempo real
