set -e


if [ -z "$(ls -A ${PGDATA})" ]; then
    echo "Data directory is empty. Running pg_basebackup..."

    export PGPASSWORD="${PGPASSWORD}"


    gosu postgres pg_basebackup \
        -h postgres-primary \
        -p 5432 \
        -D ${PGDATA} \
        -U ${PGUSER} \
        -Fp -Xs -R --wal-method=stream
    
    echo "Base backup completed."
else
    echo "Data directory already exists. Skipping pg_basebackup."
fi

exec docker-entrypoint.sh "$@"