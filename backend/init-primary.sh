#!/bin/bash
set -e

# File này được chạy sau khi database cluster đã được khởi tạo.
# Chúng ta chỉ cần thêm dòng cấu hình cho phép replication vào pg_hba.conf.
# Biến môi trường $PGDATA đã được entrypoint gốc thiết lập sẵn.
echo "host replication all 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"