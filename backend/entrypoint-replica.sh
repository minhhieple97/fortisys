#!/bin/bash
set -e

# $PGDATA được định nghĩa sẵn trong image postgres
# Kiểm tra xem thư mục data có trống không.
# Chỉ chạy pg_basebackup trong lần khởi tạo đầu tiên.
if [ -z "$(ls -A ${PGDATA})" ]; then
    echo "Data directory is empty. Running pg_basebackup..."

    # Lấy PGPASSWORD để pg_basebackup có thể xác thực
    export PGPASSWORD="${PGPASSWORD}"

    # Chạy pg_basebackup với tư cách user 'postgres' để đảm bảo quyền sở hữu file đúng
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

# Sau khi script hoàn tất, gọi entrypoint gốc của image postgres
# để nó khởi động server với user 'postgres' một cách chính xác.
# "$@" sẽ truyền các tham số từ 'command' trong docker-compose.yml (ví dụ: "postgres")
exec docker-entrypoint.sh "$@"