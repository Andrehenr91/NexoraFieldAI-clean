# NexoraField AI — Operations Manual (Fase 14)

## Visão Geral

Este manual descreve os procedimentos operacionais do dia a dia para a plataforma NexoraField AI em produção. Destinado à equipe de SRE e DevOps.

---

## Acesso ao Ambiente de Produção

```bash
# Autenticar no GCP
gcloud auth login
gcloud config set project nexorafield-prod

# Obter credenciais do cluster GKE
gcloud container clusters get-credentials nexora-cluster-prod \
  --zone southamerica-east1-a \
  --project nexorafield-prod

# Verificar contexto
kubectl config current-context
kubectl get nodes
```

---

## Verificações de Saúde Diárias

```bash
# 1. Status dos pods
kubectl get pods -n nexorafield -o wide

# 2. Health check da API
curl -f https://app.nexorafield.com.br/api/health | jq .

# 3. Verificar HPA (autoscaling)
kubectl get hpa -n nexorafield

# 4. Verificar PDB (disruption budget)
kubectl get pdb -n nexorafield

# 5. Logs de erros recentes (últimos 100)
kubectl logs -n nexorafield deployment/nexora-api --tail=100 | grep -i error

# 6. Status do banco
gcloud sql instances describe nexorafield-postgres-prod --format="value(state)"

# 7. Status do Redis
gcloud redis instances describe nexorafield-redis --region=southamerica-east1 --format="value(state)"
```

---

## Deploy em Produção

### Via CI/CD (recomendado)
1. Abrir PR para branch `main`
2. Aguardar checks: Lint → Security → Build
3. Merge aprovado inicia deploy Canary (20% tráfego)
4. Aguardar 5 minutos de monitoramento automático
5. Se OK, promoção automática para 100%
6. Em caso de falha: rollback automático

### Deploy manual de emergência
```bash
# Atualizar imagem do deployment
kubectl set image deployment/nexora-api \
  api=gcr.io/nexorafield/api:SHA_DA_IMAGEM \
  -n nexorafield

# Aguardar rollout
kubectl rollout status deployment/nexora-api -n nexorafield --timeout=5m

# Rollback se necessário
kubectl rollout undo deployment/nexora-api -n nexorafield
```

---

## Scaling Manual

```bash
# Escalar API manualmente (ex: antecipando pico)
kubectl scale deployment nexora-api --replicas=8 -n nexorafield

# Verificar status do HPA
kubectl describe hpa nexora-api-hpa -n nexorafield

# Suspender HPA temporariamente
kubectl patch hpa nexora-api-hpa -n nexorafield \
  -p '{"spec":{"minReplicas":8,"maxReplicas":8}}'
```

---

## Gestão de Banco de Dados

```bash
# Conectar via Cloud SQL Proxy
cloud_sql_proxy -instances=nexorafield-prod:southamerica-east1:nexorafield-postgres-prod=tcp:5432 &
psql -h 127.0.0.1 -U nexora -d nexorafield

# Verificar conexões ativas
psql -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# Identificar queries lentas
psql -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Forçar backup manual
gcloud sql backups create --instance=nexorafield-postgres-prod

# Restauração PITR (Point-in-Time Recovery)
gcloud sql instances clone nexorafield-postgres-prod nexorafield-postgres-restore \
  --point-in-time="2026-06-01T03:00:00Z"
```

---

## Gestão de Secrets

```bash
# Listar secrets
gcloud secrets list --project=nexorafield-prod

# Ler valor de um secret (NUNCA logar em produção)
gcloud secrets versions access latest --secret="gemini-api-key"

# Rotacionar secret
gcloud secrets versions add "jwt-secret" --data-file=novo-jwt.txt

# Desabilitar versão antiga
gcloud secrets versions disable <VERSION> --secret="jwt-secret"
```

---

## Resposta a Incidentes

### Severidade 1 (CRÍTICA) — Sistema fora do ar
1. **T+0**: Alertmanager notifica PagerDuty → On-call recebe
2. **T+2min**: On-call verifica `kubectl get pods` e `/api/health`
3. **T+5min**: Se deploy recente → rollback imediato
4. **T+15min**: Comunicar stakeholders via status page
5. **T+30min**: RCA preliminar documentado
6. **T+1h**: Sistema restaurado ou escalonado para CTO

### Severidade 2 (ALTA) — Degradação de serviço
1. Criar issue no GitHub com label `incident`
2. Investigar logs: `kubectl logs deployment/nexora-api -n nexorafield`
3. Verificar métricas no Grafana
4. Corrigir e fazer deploy em até 4 horas

### Severidade 3 (MÉDIA) — Funcionalidade prejudicada
1. Registrar no sistema de tickets
2. Corrigir no próximo ciclo de sprint

---

## Manutenção Preventiva

| Tarefa | Frequência | Responsável |
|--------|-----------|-------------|
| Patch de segurança (OS/deps) | Semanal | SRE |
| Atualização de imagens Docker | Quinzenal | DevOps |
| Rotação de secrets | Trimestral | SecOps |
| Teste de restauração de backup | Mensal | DBA |
| Simulação de disaster recovery | Semestral | SRE Lead |
| Revisão de custos (FinOps) | Mensal | FinOps |
| Revisão de alertas | Mensal | SRE |
| Atualização de dependências npm | Mensal | Dev |

---

## Contatos de Emergência

| Papel | Canal | Disponibilidade |
|-------|-------|----------------|
| SRE On-call | PagerDuty | 24×7 |
| DBA | ops@nexorafield.com.br | Horário comercial |
| CTO | Telegram @cto_nexora | Escalações P1 |
| Suporte GCP | console.cloud.google.com/support | Plano Premium |
