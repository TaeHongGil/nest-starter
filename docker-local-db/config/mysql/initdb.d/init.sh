#!/bin/bash

# 환경 변수 출력 (디버깅 용도)
echo "User Name: $USER_NAME"
echo "User Password: $USER_PASSWORD"

# SQL 스크립트 실행
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$USER_NAME'@'%' IDENTIFIED BY '$USER_PASSWORD';  # 사용자 생성
GRANT ALL PRIVILEGES ON *.* TO '$USER_NAME'@'%' WITH GRANT OPTION;  # 권한 부여
ALTER USER '$USER_NAME'@'%' IDENTIFIED WITH mysql_native_password BY '$USER_PASSWORD';
SELECT Host,User,plugin,authentication_string FROM mysql.user;
FLUSH PRIVILEGES;
EOF
