# NexoraField AI — Network Architecture (Fase 14)

## Topologia de Rede

```
Internet
    │
    ▼ HTTPS (443) + HTTP/2
┌──────────────────────────────────────────┐
│         Cloud DNS (nexorafield.com.br)    │
│    A Record → Cloud Load Balancer IP     │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│       Cloud Load Balancer (HTTPS)         │
│  • SSL/TLS 1.3 termination               │
│  • HTTP → HTTPS redirect                  │
│  • Certificate: Managed SSL              │
│  • Backend: GKE NEG (Network Endpoint)   │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│         Cloud Armor (WAF)                 │
│  • Rules: SQLi, XSS, LFI, SSRF          │
│  • Rate limit: 100 req/min por IP        │
│  • Geo-block: configurável               │
│  • DDoS L3/L4/L7 protection             │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│         VPC: nexorafield-vpc              │
│         CIDR: 10.0.0.0/16               │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Subnet Privada (10.0.0.0/20)    │    │
│  │  secondaryRange pods: 10.1.0.0/16│    │
│  │  secondaryRange svc:  10.2.0.0/20│    │
│  │                                  │    │
│  │  ┌────────────────────────────┐  │    │
│  │  │  GKE Cluster               │  │    │
│  │  │  Namespace: nexorafield    │  │    │
│  │  │                            │  │    │
│  │  │  [API Pods]  10.1.x.x/32  │  │    │
│  │  │  [Workers]   10.1.x.x/32  │  │    │
│  │  │  [Gateway]   10.1.x.x/32  │  │    │
│  │  └────────────────────────────┘  │    │
│  │                                  │    │
│  │  ┌────────────────────────────┐  │    │
│  │  │  Cloud SQL (PostgreSQL HA) │  │    │
│  │  │  Private IP: 10.0.1.x     │  │    │
│  │  │  Port: 5432 (interno)     │  │    │
│  │  └────────────────────────────┘  │    │
│  │                                  │    │
│  │  ┌────────────────────────────┐  │    │
│  │  │  Memorystore Redis         │  │    │
│  │  │  Private IP: 10.0.2.x     │  │    │
│  │  │  Port: 6379 (interno)     │  │    │
│  │  └────────────────────────────┘  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Cloud NAT → Internet (egress only)     │
└──────────────────────────────────────────┘
```

---

## Firewall Rules

| Regra | Direção | Origem | Destino | Porta | Ação |
|-------|---------|--------|---------|-------|------|
| allow-https-ingress | INGRESS | 0.0.0.0/0 | Load Balancer | 443 | ALLOW |
| allow-http-redirect | INGRESS | 0.0.0.0/0 | Load Balancer | 80 | ALLOW |
| allow-gke-api | INGRESS | GKE Control Plane | 172.16.0.0/28 | 443 | ALLOW |
| allow-internal | INGRESS | 10.0.0.0/16 | 10.0.0.0/16 | ALL | ALLOW |
| deny-external-db | INGRESS | 0.0.0.0/0 | Cloud SQL | 5432 | DENY |
| deny-external-redis | INGRESS | 0.0.0.0/0 | Redis | 6379 | DENY |

---

## Network Policies (Kubernetes)

```yaml
# Apenas a API pode acessar o banco
API → PostgreSQL:  ALLOW (porta 5432)
API → Redis:       ALLOW (porta 6379)
Worker* → Redis:   ALLOW (porta 6379)
Worker* → API:     DENY
Gateway → API:     ALLOW (porta 5000)
Gateway → Worker*: DENY
```

---

## DNS

| Registro | Tipo | Valor |
|----------|------|-------|
| nexorafield.com.br | A | Cloud LB IP |
| app.nexorafield.com.br | CNAME | nexorafield.com.br |
| api.nexorafield.com.br | CNAME | nexorafield.com.br |
| www.nexorafield.com.br | CNAME | nexorafield.com.br |

---

## TLS / Certificados

- **Provedor**: Google-managed SSL Certificate
- **Versão mínima**: TLS 1.2 (TLS 1.3 preferencial)
- **Cipher suites**: ECDHE-RSA-AES256-GCM-SHA384, ECDHE-RSA-CHACHA20-POLY1305
- **HSTS**: max-age=63072000; includeSubDomains; preload
- **Renovação**: Automática pelo Google (30 dias antes do vencimento)

---

## Egress

Todo tráfego de saída dos pods GKE passa pelo **Cloud NAT**:
- IP de saída estático e previsível
- Sem IPs públicos nos nodes/pods
- Whitelist possível em APIs externas (Gemini, etc.)
