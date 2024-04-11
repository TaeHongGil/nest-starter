-- 기본 DB 및 권한 추가
ALTER USER 'user'@'%' IDENTIFIED WITH mysql_native_password BY '123123';
CREATE DATABASE `nest_local_global`;
GRANT ALL PRIVILEGES ON nest_local_global.* TO 'user'@'%';
FLUSH PRIVILEGES;

-- DB 확인
-- SHOW DATABASES;

-- 계정확인
-- SELECT Host,User,plugin,authentication_string FROM mysql.user;
