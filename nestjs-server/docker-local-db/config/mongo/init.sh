#!/bin/bash

KEYFILE_PATH="/etc/mongodb-keyfile"
REPLICA_NAME="rs0"
ADMIN_USER="${USER_NAME:-admin}"
ADMIN_PASS="${USER_PASSWORD:-admin}"

# keyfile 생성
openssl rand -base64 756 > "$KEYFILE_PATH"
chmod 600 "$KEYFILE_PATH"
chown -R mongodb:mongodb "$KEYFILE_PATH"

# mongod 실행 (백그라운드)
mongod --replSet "$REPLICA_NAME" --keyFile "$KEYFILE_PATH" --bind_ip_all --fork --logpath /var/log/mongodb.log

# mongod 접속 대기
RETRY=0
until mongosh --eval "db.runCommand({ ping: 1 })" &>/dev/null || [ $RETRY -eq 10 ]; do
  echo "MongoDB 대기 중..."
  RETRY=$((RETRY+1))
  sleep 2
done

# 레플리카셋 초기화 및 admin 유저 생성
mongosh <<EOF
rs.initiate({
  _id: "$REPLICA_NAME",
  members: [{ _id: 0, host: "localhost:27017" }]
});

while (!rs.isMaster().ismaster) { sleep(1000); }

use admin;
db.createUser({
  user: "$ADMIN_USER",
  pwd: "$ADMIN_PASS",
  roles: [ { role: "root", db: "admin" } ]
});
EOF

# 로그 tail 유지
tail -f /var/log/mongodb.log