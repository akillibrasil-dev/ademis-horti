#!/usr/bin/env bash
# Ademis Horti: exportacao logica PARCIAL. NAO contem schemas auth/storage.
set -euo pipefail
umask 077
: "${SUPABASE_DB_URL:?Configure SUPABASE_DB_URL somente em ambiente seguro.}"
if ! command -v docker >/dev/null 2>&1; then echo "Docker e necessario." >&2; exit 2; fi
if [[ ! -x ./node_modules/.bin/supabase ]]; then echo "Execute npm ci antes." >&2; exit 2; fi
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
dest="${BACKUP_DIR:-./backups-private}/ademis-horti-${stamp}"
mkdir -p "$dest"
./node_modules/.bin/supabase db dump --db-url "$SUPABASE_DB_URL" --role-only -f "$dest/roles.sql"
./node_modules/.bin/supabase db dump --db-url "$SUPABASE_DB_URL" -f "$dest/schema.sql"
./node_modules/.bin/supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --use-copy -f "$dest/data.sql"
(cd "$dest" && sha256sum roles.sql schema.sql data.sql > SHA256SUMS)
chmod 600 "$dest"/*.sql "$dest/SHA256SUMS"
echo "Backup logico PARCIAL: $dest"
echo "ATENCAO: nao contem auth.users, senhas ou objetos Storage. Consulte docs/BACKUP-RECUPERACAO.md."
