#!/bin/sh
set -eu
stamp=$(date -u +%Y%m%dT%H%M%SZ)
file=/tmp/todos-${stamp}.sql.gz
pg_dump "$DATABASE_URL" | gzip > "$file"
gcloud storage cp "$file" "gs://$BACKUP_BUCKET/$(basename "$file")"
echo "backup_uploaded $(basename "$file")"
