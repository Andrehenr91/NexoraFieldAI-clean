#!/usr/bin/env bash
# ============================================================
# NexoraField AI — Backup Script (Fase 11)
# Backup automático PostgreSQL → Cloud Storage
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="/tmp/nexora-backups"
BUCKET="${GCS_BACKUP_BUCKET:-nexorafield-backups}"
DB_NAME="${PGDATABASE:-nexorafield}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }
error() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: $*" >&2; }

# ── Valida dependências ─────────────────────────────────────
for cmd in pg_dump gzip gsutil openssl; do
  command -v "$cmd" &>/dev/null || { error "Dependência ausente: $cmd"; exit 1; }
done

mkdir -p "$BACKUP_DIR"

log "=== NexoraField Backup Iniciado ==="
log "Banco: $DB_NAME | Timestamp: $TIMESTAMP"

# ── 1. Full Dump ────────────────────────────────────────────
DUMP_FILE="$BACKUP_DIR/${DB_NAME}_full_${TIMESTAMP}.sql.gz"
log "Realizando dump completo..."
pg_dump \
  --host="${PGHOST}" \
  --port="${PGPORT:-5432}" \
  --username="${PGUSER}" \
  --dbname="$DB_NAME" \
  --format=custom \
  --compress=9 \
  --no-password \
  --verbose \
  2>>"$BACKUP_DIR/backup_${TIMESTAMP}.log" \
  | gzip > "$DUMP_FILE"

DUMP_SIZE=$(du -sh "$DUMP_FILE" | cut -f1)
log "Dump concluído: $DUMP_SIZE"

# ── 2. Criptografia ─────────────────────────────────────────
ENCRYPTED_FILE="${DUMP_FILE}.enc"
log "Criptografando backup com AES-256..."
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "$DUMP_FILE" \
  -out "$ENCRYPTED_FILE" \
  -pass env:BACKUP_ENCRYPTION_KEY
rm -f "$DUMP_FILE"
log "Criptografia concluída."

# ── 3. Checksum ─────────────────────────────────────────────
CHECKSUM=$(sha256sum "$ENCRYPTED_FILE" | awk '{print $1}')
echo "$CHECKSUM  $(basename "$ENCRYPTED_FILE")" > "${ENCRYPTED_FILE}.sha256"
log "SHA-256: $CHECKSUM"

# ── 4. Upload para Cloud Storage ────────────────────────────
GCS_PATH="gs://${BUCKET}/postgres/${TIMESTAMP}/"
log "Enviando para $GCS_PATH..."
gsutil -m cp "$ENCRYPTED_FILE" "${ENCRYPTED_FILE}.sha256" "$BACKUP_DIR/backup_${TIMESTAMP}.log" "$GCS_PATH"
log "Upload concluído."

# ── 5. Limpeza local ────────────────────────────────────────
rm -f "$ENCRYPTED_FILE" "${ENCRYPTED_FILE}.sha256" "$BACKUP_DIR/backup_${TIMESTAMP}.log"
log "Limpeza local concluída."

# ── 6. Rotação (remove backups antigos do GCS) ──────────────
log "Rotacionando backups com mais de $RETENTION_DAYS dias..."
CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y%m%d 2>/dev/null || \
              date -v "-${RETENTION_DAYS}d" +%Y%m%d)
gsutil ls "gs://${BUCKET}/postgres/" 2>/dev/null | while read -r path; do
  folder=$(basename "$path")
  folder_date="${folder:0:8}"
  if [[ "$folder_date" < "$CUTOFF_DATE" ]]; then
    log "Removendo backup antigo: $path"
    gsutil -m rm -r "$path"
  fi
done

# ── 7. Notificação de sucesso ────────────────────────────────
log "=== Backup concluído com sucesso ==="
log "Arquivo: $(basename "$ENCRYPTED_FILE")"
log "Bucket:  $GCS_PATH"
log "Tamanho: $DUMP_SIZE"
log "SHA-256: $CHECKSUM"

# Registra no banco para auditoria
psql "${DATABASE_URL}" -c "
  INSERT INTO ai_audit_logs (id, type, message, details, timestamp)
  VALUES (
    gen_random_uuid()::text,
    'backup',
    'Backup automático concluído com sucesso',
    '{\"file\": \"${TIMESTAMP}\", \"size\": \"${DUMP_SIZE}\", \"bucket\": \"${BUCKET}\", \"sha256\": \"${CHECKSUM}\"}'::jsonb,
    NOW()
  );
" 2>/dev/null || true

exit 0
