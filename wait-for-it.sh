#!/bin/sh
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=$DB_PASSWORD psql -h "$host" -U "postgres" -c '\q'; do
  >&2 echo "Postgres está indisponível - sleeping"
  sleep 1
done

>&2 echo "Postgres está pronto - executando comando"
exec $cmd