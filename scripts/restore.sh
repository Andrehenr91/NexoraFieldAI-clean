#!/usr/bin/env bash
# ============================================================
# NexoraField AI — Restore Script (Fase 11)
# Restauração de backup PostgreSQL a partir do Cloud Storage
# ============================================================
set -euo pipefail

BUCKET="${GCS_BACKUP_BUCKET:-nexorafield-backups}"
DB_NAME="${PGDATABASE:-nexorafield}"
RESTORE_DIR="/tmp/nexora-restore"
BACKUP_TIMESTAMP="${1:-}"  # ex: 20260101_030000

log()   { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }
error() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: $*" >&2; exit 1; }

[[ -z "$BACKUP_TIMESTAMP" ]] && error "Uso: $0 <TIMESTAMP> (ex: 20260101_030000)"

log "=== NexoraField Restore Iniciado ==="
log "Backup: $BACKUP_TIMESTAMP | Banco: $DB_NAME"

mkdir -p "$RESTORE_DIR"

ENCRYPTED_FILE="$RESTORE_DIR/${DB_NAME}_full_${BACKUP_TIMESTAMP}.sql.gz.enc"
CHECKSUM_FILE="${ENCRYPTED_FILE}.sha256"
GCS_PATH="gs://${BUCKET}/postgres/${BACKUP_TIMESTAMP}/"

# ── 1. Download ─────────────────────────────────────────────
log "Baixando backup de $GCS_PATH..."
gsutil cp "${GCS_PATH}$(basename "$ENCRYPTED_FILE")" "$ENCRYPTED_FILE"
gsutil cp "${GCS_PATH}$(basename "$CHECKSUM_FILE")" "$CHECKSUM_FILE"

# ── 2. Verifica integridade ─────────────────────────────────
log "Verificando integridade..."
sha256sum -c "$CHECKSUM_FILE" || error "Falha na verificação de integridade!"
log "Integridade OK."

# ── 3. Descriptografia ──────────────────────────────────────
DUMP_FILE="${ENCRYPTED_FILE%.enc}"
log "Descriptografando..."
openssl enc -aes-256-cbc -d -salt -pbkdf2 -iter 100000 \
  -in "$ENCRYPTED_FILE" \
  -out "$DUMP_FILE" \
  -pass env:BACKUP_ENCRYPTION_KEY
log "Descriptografia concluída."

# ── 4. CONFIRMAÇÃO MANUAL ───────────────────────────────────
echo ""
echo "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER o banco '$DB_NAME'."
echo "   Host: $PGHOST | Timestamp do backup: $BACKUP_TIMESTAMP"
echo ""
read -r -p "   Digite 'CONFIRMAR' para prosseguir: " CONFIRM
[[ "$CONFIRM" != "CONFIRMAR" ]] && { log "Restauração cancelada pelo usuário."; exit 0; }

# ── 5. Restauração ──────────────────────────────────────────
log "Restaurando banco de dados..."
pg_restore \
  --host="${PGHOST}" \
  --port="${PGPORT:-5432}" \
  --username="${PGUSER}" \
  --dbname="$DB_NAME" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  "$DUMP_FILE" \
  2>&1 | tee "$RESTORE_DIR/restore_${BACKUP_TIMESTAMP}.log"

log "Restauração concluída."

# ── 6. Limpeza ──────────────────────────────────────────────
rm -f "$ENCRYPTED_FILE" "$CHECKSUM_FILE" "$DUMP_FILE"
log "Arquivos temporários removidos."

log "=== Restore concluído com sucesso ==="
