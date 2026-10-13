#!/usr/bin/env bash
# One-shot restore of an existing encrypted backup in a disposable Postgres.
set -Eeuo pipefail
umask 077

FILE='ademis-horti-20261013T005845Z-38328929145.tar.gz.age'
FOLDER_ID='18_s7eOw3p2_pz4whmMznCl-eflAy8TQo'
: "${ADEMIS_GDRIVE_RCLONE_CONFIG:?Missing Google Drive OAuth secret}"
: "${ADEMIS_AGE_RESTORE_TEST_KEY:?Missing one-time age recovery key secret}"
for tool in docker age rclone tar sha256sum; do
  command -v "$tool" >/dev/null || { echo "Missing tool: $tool" >&2; exit 2; }
done
workdir="$(mktemp -d)"
db_container="ademis-restore-${GITHUB_RUN_ID:-manual}-${GITHUB_RUN_ATTEMPT:-1}"
cleanup() {
  docker rm -f "$db_container" >/dev/null 2>&1 || true
  rm -rf -- "$workdir"
}
trap cleanup EXIT
config="$workdir/rclone.conf"
identity="$workdir/identity.txt"
printf '%s\n' "$ADEMIS_GDRIVE_RCLONE_CONFIG" > "$config"
printf '%s\n' "$ADEMIS_AGE_RESTORE_TEST_KEY" > "$identity"
chmod 600 "$config" "$identity"
unset ADEMIS_AGE_RESTORE_TEST_KEY ADEMIS_GDRIVE_RCLONE_CONFIG
grep -qFx '[gdrive]' "$config" || { echo 'gdrive remote missing' >&2; exit 2; }
grep -q 'AGE-SECRET-KEY-1' "$identity" || { echo 'Age identity missing' >&2; exit 2; }

echo 'Downloading selected encrypted backup from the private Drive folder...'
rclone --config "$config" copyto "gdrive:$FILE" "$workdir/$FILE" \
  --drive-root-folder-id "$FOLDER_ID" --retries 3
test -s "$workdir/$FILE"

echo 'Decrypting with one-time recovery identity...'
age -d -i "$identity" -o "$workdir/backup.tar.gz" "$workdir/$FILE"
mkdir -p "$workdir/payload"
tar -xzf "$workdir/backup.tar.gz" -C "$workdir/payload"
(
  cd "$workdir/payload"
  sha256sum --check --quiet SHA256SUMS
)
grep -q '^supabase_project=cfgsntegevijwvbhbbyv$' "$workdir/payload/MANIFEST.txt"
test -s "$workdir/payload/database.dump"
echo 'Decryption, archive extraction and checksum validation passed.'

# The isolated runner receives no production database URL or write credentials.
docker run -d --name "$db_container" -e POSTGRES_PASSWORD=local-only-test \
  postgres:17 >/dev/null
ready=0
for _ in $(seq 1 60); do
  if docker exec "$db_container" pg_isready -U postgres >/dev/null 2>&1; then ready=1; break; fi
  sleep 2
done
if (( ! ready )); then echo 'Disposable Postgres did not start' >&2; exit 1; fi
for role in anon authenticated service_role authenticator supabase_admin \
  supabase_auth_admin supabase_storage_admin supabase_realtime_admin dashboard_user; do
  docker exec "$db_container" psql -v ON_ERROR_STOP=1 -U postgres \
    -d postgres -c "CREATE ROLE $role;" >/dev/null
done
docker exec "$db_container" createdb -U postgres ademis_restore_test
# The disposable PostgreSQL instance creates public by default.
# Remove only this empty test schema; pg_restore will recreate it from the backup.
docker exec "$db_container" psql -v ON_ERROR_STOP=1 -U postgres \
  -d ademis_restore_test -c 'DROP SCHEMA public CASCADE;' >/dev/null
docker exec "$db_container" psql -v ON_ERROR_STOP=1 -U postgres \
  -d ademis_restore_test -c 'CREATE SCHEMA extensions; CREATE EXTENSION pgcrypto;' >/dev/null
docker cp "$workdir/payload/database.dump" "$db_container:/tmp/database.dump"

echo 'Restoring into a new disposable database...'
docker exec "$db_container" pg_restore -U postgres -d ademis_restore_test \
  --no-owner --no-acl --exit-on-error /tmp/database.dump
echo 'Checking restored tables without exposing their data...'
docker exec "$db_container" psql -X -v ON_ERROR_STOP=1 -U postgres \
  -d ademis_restore_test -At -c "
SELECT 'auth_users=' || count(*) FROM auth.users;
SELECT 'organizations=' || count(*) FROM public.organizations;
SELECT 'organization_members=' || count(*) FROM public.organization_members;
SELECT 'subscriptions=' || count(*) FROM public.subscriptions;
SELECT 'storage_objects=' || count(*) FROM storage.objects;
SELECT 'orphaned_members=' || count(*) FROM public.organization_members m
  LEFT JOIN public.organizations o ON o.id=m.organization_id WHERE o.id IS NULL;
"
echo 'ISOLATED_RESTORE_VERIFIED: backup decrypted, restored and queried'
