# NexoraField AI — Backup Policy (Fase 11 / Fase 14)

## Visão Geral

Esta política define os procedimentos de backup, retenção, restauração e validação para todos os dados da plataforma NexoraField AI em produção.

---

## Objetivos

| Métrica | Alvo |
|---------|------|
| **RPO** (Recovery Point Objective) | ≤ 1 hora |
| **RTO** (Recovery Time Objective) | ≤ 2 horas |
| Retenção de backups diários | 30 dias |
| Retenção de backups semanais | 12 semanas |
| Retenção de backups mensais | 12 meses |

---

## Tipos de Backup

### 1. Backup Contínuo (WAL / PITR)
- **Método**: PostgreSQL Write-Ahead Log (WAL) via Cloud SQL
- **Retenção**: 7 dias de logs de transação
- **Frequência**: Contínuo (em tempo real)
- **Objetivo**: Point-in-Time Recovery (PITR) para qualquer momento

### 2. Backup Diário Completo
- **Horário**: 03:00 UTC (00:00 BRT)
- **Método**: `pg_dump` criptografado (AES-256-CBC)
- **Destino**: `gs://nexorafield-backups/postgres/`
- **Compressão**: gzip (nível 9)
- **Verificação**: SHA-256 checksum automático
- **Script**: `scripts/backup.sh`

### 3. Backup de Arquivos (Cloud Storage)
- **Método**: Versionamento ativado no bucket `nexorafield-uploads`
- **Retenção**: 365 dias
- **Ciclo de vida**: STANDARD → NEARLINE (90 dias) → Delete (365 dias)

---

## Criptografia

- **Algoritmo**: AES-256-CBC com PBKDF2 (100.000 iterações)
- **Chave**: Armazenada no GCP Secret Manager (`backup-encryption-key`)
- **Rotação**: Trimestral
- **Verificação**: SHA-256 de cada arquivo antes e após upload

---

## Retenção

| Tipo | Retenção | Classe GCS |
|------|----------|------------|
| Diário | 30 dias | STANDARD |
| Semanal | 12 semanas | NEARLINE |
| Mensal | 12 meses | COLDLINE |
| Anual | 5 anos | ARCHIVE |

---

## Execução Automatizada

```yaml
# Cloud Scheduler (GCP)
Job: nexora-daily-backup
Schedule: "0 3 * * *"        # Diário às 03:00 UTC
Target: Cloud Run Job
Command: /scripts/backup.sh
Timeout: 3600s
RetryCount: 3
```

---

## Validação Mensal

Todo primeiro domingo do mês:
1. Selecionar backup mais recente
2. Executar `scripts/restore.sh <TIMESTAMP>` em ambiente de **staging**
3. Validar integridade dos dados (contagem de registros, checksums)
4. Registrar resultado no `RUNBOOKS.md`
5. Alertar equipe via Alertmanager se falhar

---

## Responsáveis

| Papel | Responsabilidade |
|-------|-----------------|
| SRE Lead | Monitorar execução diária e alertas |
| DBA | Validar restaurações mensais |
| SecOps | Auditar criptografia e rotação de chaves |
| CTO | Aprovação de mudanças nesta política |

---

## Procedimento de Restauração de Emergência

```bash
# 1. Identificar timestamp do backup
gsutil ls gs://nexorafield-backups/postgres/

# 2. Executar restauração
export BACKUP_ENCRYPTION_KEY="<key-do-secret-manager>"
bash scripts/restore.sh 20260101_030000

# 3. Validar integridade
psql $DATABASE_URL -c "SELECT COUNT(*) FROM tickets;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM technicians;"
```

**Tempo estimado de restauração**: 15–45 minutos (dependendo do volume de dados).
