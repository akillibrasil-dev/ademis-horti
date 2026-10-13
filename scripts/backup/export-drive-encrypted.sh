#!/usr/bin/env bash
# Ademis Horti: encrypted PostgreSQL backup to a fixed Google Drive folder.
set -Eeuo pipefail
umask 077

PROJECT_REF='cfgsntegevijwvbhbbyv'
FOLDER_ID='18_s7eOw3p2_pz4whmMznCl-eflAy8TQo'

for name in ADEMIS_SUPABASE_DB_URL ADEMIS_AGE_RECIPIENT ADEMIS_GDRIVE_RCLONE_CONFIG; do
  if [[ -z "${!name:-}" ]]; then
    printf 'Required GitHub secret not configured: %s\n' "$name" >&2
    exit 2
  fi
done
if [[ "$ADEMIS_SUPABASE_DB_URL" != *"$PROJECT_REF"* ]]; then
  printf 'Wrong Supabase project reference in connection string. Aborting.\n' >&2
  exit 2
fi
if [[ "$ADEMIS_AGE_RECIPIENT" != age1* ]]; then
  printf 'ADEMIS_AGE_RECIPIENT must be a public age1... recipient.\n' >&2
  exit 2
fi
for tool in docker age rclone tar sha256sum; do
  command -v "$tool" >/dev/null || { printf 'Missing dependency: %s\n' "$tool" >&2; exit 2; }
done

workdir="$(mktemp -d)"
trap 'rm -rf -- "$workdir"' EXIT
mkdir -p "$workdir/payload/migrations"
chmod 700 "$workdir" "$workdir/payload"

# The connection string goes through a container environment variable, not a command-line literal.
# Configure sslmode=require on the Postgres URI or use PGSSLMODE=require in the container.
export DB_CONNECTION="$ADEMIS_SUPABASE_DB_URL"
storage_count="$(docker run --rm --env DB_CONNECTION -e PGSSLMODE=require postgres:17 \
  sh -ec 'psql "$DB_CONNECTION" -X -At -c "select count(*) from storage.objects"')"
if [[ ! "$storage_count" =~ ^[0-9]+$ ]]; then
  printf 'Cannot verify Storage object count; refusing incomplete export.\n' >&2
  exit 1
fi
if (( storage_count > 0 )); then
  printf 'Storage has %s objects; backing up metadata alone is insufficient. Aborting.\n' "$storage_count" >&2
  exit 1
fi

printf 'Exporting PostgreSQL schemas auth/public/storage (Storage object count: zero)...\n'
docker run --rm --env DB_CONNECTION -e PGSSLMODE=require \
  --user "$(id -u):$(id -g)" -v "$workdir/payload:/backup" \
  postgres:17 sh -ec \
  'pg_dump --dbname="$DB_CONNECTION" -Fc -Z 6 -n public -n auth -n storage -f /backup/database.dump'

# Validate that the archive contains required table data before upload.
index="$(docker run --rm -v "$workdir/payload:/backup:ro" postgres:17 pg_restore --list /backup/database.dump)"
for table in 'TABLE DATA auth users' 'TABLE DATA public organizations' \
             'TABLE DATA public organization_members' 'TABLE DATA public subscriptions'; do
  if ! grep -Fq "$table" <<< "$index"; then
    printf 'Dump incomplete (missing %s); aborting.\n' "$table" >&2
    exit 1
  fi
done

repo_root="${GITHUB_WORKSPACE:-$(pwd)}"
cp "$repo_root"/supabase/migrations/*.sql "$workdir/payload/migrations/"
cat > "$workdir/payload/MANIFEST.txt" <<MANIFEST
product=Ademis Horti
supabase_project=$PROJECT_REF
created_utc=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
git_sha=${GITHUB_SHA:-manual}
format=pg_dump custom + tar.gz + age
schemas=auth,public,storage
storage_object_binaries=not_included; exported only if zero objects
restore=not_validated; test on isolated Supabase project
MANIFEST
(
  cd "$workdir/payload"
  sha256sum database.dump MANIFEST.txt migrations/*.sql > SHA256SUMS
  sha256sum -c --quiet SHA256SUMS
)

filename="ademis-horti-$(date -u '+%Y%m%dT%H%M%SZ')-${GITHUB_RUN_ID:-manual}.tar.gz.age"
tar -C "$workdir/payload" -czf "$workdir/backup.tar.gz" .
age -r "$ADEMIS_AGE_RECIPIENT" -o "$workdir/$filename" "$workdir/backup.tar.gz"
test -s "$workdir/$filename"

# The OAuth refresh token lives only in an ephemeral config file and the GitHub secret.
config="$workdir/rclone.conf"
printf '%s\n' "$ADEMIS_GDRIVE_RCLONE_CONFIG" > "$config"
chmod 600 "$config"
if ! grep -Fxq '[gdrive]' "$config"; then
  printf 'The rclone secret must contain a [gdrive] remote.\n' >&2
  exit 2
fi

# root_folder_id is fixed. No plaintext archive is ever uploaded.
if rclone --config "$config" lsf gdrive: --drive-root-folder-id "$FOLDER_ID" --files-only 2>/dev/null | grep -Fxq "$filename"; then
  printf 'Target filename already exists; aborting without overwriting.\n' >&2
  exit 1
fi
printf 'Uploading encrypted archive to the approved private Drive folder...\n'
rclone --config "$config" copyto "$workdir/$filename" "gdrive:$filename" \
  --drive-root-folder-id "$FOLDER_ID" --retries 3

# Verify remote bytes, not just reported upload success.
local_sha="$(sha256sum "$workdir/$filename" | cut -d ' ' -f1)"
remote_sha="$(rclone --config "$config" cat "gdrive:$filename" \
  --drive-root-folder-id "$FOLDER_ID" | sha256sum | cut -d ' ' -f1)"
if [[ "$local_sha" != "$remote_sha" ]]; then
  printf 'SHA-256 of downloaded encrypted backup does not match.\n' >&2
  exit 1
fi
printf 'BACKUP_UPLOAD_VERIFIED: %s\n' "$filename"
