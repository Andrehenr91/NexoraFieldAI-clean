# NexoraField AI — Infrastructure Overview (Fase 14)

## Stack de Infraestrutura

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIOS / INTERNET                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (TLS 1.3)
┌──────────────────────────▼──────────────────────────────────┐
│              CLOUD CDN + CLOUD ARMOR (WAF)                   │
│      Rate Limiting · SQL Injection · XSS · DDoS              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 CLOUD LOAD BALANCER (HTTPS)                  │
│              SSL Certificate Manager · HTTP/2                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              GKE CLUSTER (nexora-cluster-prod)               │
│                  southamerica-east1-a                         │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ nexora-api │ │ worker-ai    │ │ worker-financial      │  │
│  │ (4 pods)   │ │ (2 pods)     │ │ (1 pod)              │  │
│  ├────────────┤ ├──────────────┤ ├──────────────────────┤  │
│  │ worker-crm │ │ worker-notif │ │ scheduler + gateway   │  │
│  │ (1 pod)    │ │ (2 pods)     │ │ (1 + 2 pods)         │  │
│  └────────────┘ └──────────────┘ └──────────────────────┘  │
│           HPA: 2–20 réplicas por serviço                     │
│           VPA: ajuste automático de CPU/RAM                   │
└──────────┬───────────────────────────────────────────────────┘
           │ Private VPC (10.0.0.0/20)
    ┌──────┴──────┐         ┌──────────────────────────┐
    │  Cloud SQL  │         │   Memorystore Redis HA   │
    │ PostgreSQL  │         │   4 GB · AUTH · TLS      │
    │ HA + Replica│         │   Standard_HA tier       │
    └─────────────┘         └──────────────────────────┘
           │
    ┌──────┴──────┐         ┌──────────────────────────┐
    │ Cloud Storage│         │   GCP Secret Manager     │
    │ Uploads +   │         │   Rotação automática     │
    │ Backups     │         └──────────────────────────┘
    └─────────────┘
```

---

## Componentes

| Componente | Tecnologia | Configuração |
|-----------|-----------|-------------|
| **Compute** | GKE Autopilot | e2-standard-2, 2–10 nodes |
| **Banco de Dados** | Cloud SQL PostgreSQL 15 | HA Regional, db-custom-2-7680 |
| **Réplica de Leitura** | Cloud SQL PostgreSQL 15 | ZONAL, db-custom-1-3840 |
| **Cache** | Memorystore Redis 7.0 | Standard_HA, 4 GB |
| **Connection Pool** | PgBouncer | Transaction mode, 500 conexões |
| **Storage** | Cloud Storage | Multi-region, versionado |
| **CDN** | Cloud CDN | Cache STANDARD, TTL 3600s |
| **WAF** | Cloud Armor | SQLi, XSS, DDoS, Rate Limit |
| **Secrets** | GCP Secret Manager | Rotação trimestral |
| **Registry** | Artifact Registry | Docker, região SA |
| **CI/CD** | GitHub Actions | Canary → Blue/Green |
| **Monitoramento** | Prometheus + Grafana | Alertmanager + PagerDuty |
| **Tracing** | OpenTelemetry | Jaeger |

---

## Ambientes

| Ambiente | Cluster | Namespace | Branch |
|----------|---------|-----------|--------|
| **Produção** | nexora-cluster-prod | nexorafield | main |
| **Staging** | nexora-cluster-staging | nexorafield-staging | develop |
| **Desenvolvimento** | Replit | local | feature/* |

---

## Alta Disponibilidade

- **GKE**: PodDisruptionBudget garante mínimo de 50% dos pods durante manutenção
- **PostgreSQL**: Regional HA com failover automático em < 60s
- **Redis**: Standard_HA com failover automático
- **API**: Anti-affinity rules distribuem pods em nodes diferentes
- **Deploy**: Zero-downtime com RollingUpdate (maxUnavailable: 0)

---

## SLA/SLO Targets

| Indicador | Target |
|-----------|--------|
| Disponibilidade | 99.9% |
| Latência P95 (API) | < 500ms |
| Latência P95 (IA) | < 3000ms |
| Taxa de erro | < 1% |
| MTTR | < 15 min |
| RPO | < 1h |
| RTO | < 2h |

---

## Custos Estimados (Produção)

| Recurso | Custo/mês (USD) |
|---------|----------------|
| GKE (3 nodes e2-standard-2) | ~$120 |
| Cloud SQL HA | ~$90 |
| Memorystore Redis HA 4GB | ~$50 |
| Cloud Storage (1TB) | ~$20 |
| Cloud Load Balancer | ~$18 |
| Cloud CDN | ~$10 |
| Cloud Armor | ~$15 |
| Outros (logging, monitoring) | ~$20 |
| **Total estimado** | **~$343/mês** |
