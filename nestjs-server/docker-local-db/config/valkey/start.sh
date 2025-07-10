#!/bin/bash

# ACL 파일 경로
ACL_FILE="/data/users.acl"

# 기본 설정
echo "user default off" > "$ACL_FILE"

# server 사용자 설정
echo "user $USER_NAME on >$USER_PASSWORD ~* allchannels +@all" >> "$ACL_FILE"

# valkey 서버 시작
valkey-server /usr/local/etc/valkey/valkey.conf
