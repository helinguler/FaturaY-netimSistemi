#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -v auth_db="$AUTH_DB_NAME" \
  -v auth_user="$AUTH_DB_USER" \
  -v auth_pass="$AUTH_DB_PASSWORD" \
  -v customer_db="$CUSTOMER_DB_NAME" \
  -v customer_user="$CUSTOMER_DB_USER" \
  -v customer_pass="$CUSTOMER_DB_PASSWORD" \
  -v invoice_db="$INVOICE_DB_NAME" \
  -v invoice_user="$INVOICE_DB_USER" \
  -v invoice_pass="$INVOICE_DB_PASSWORD" <<-EOSQL

CREATE USER :"auth_user" WITH PASSWORD :'auth_pass';
CREATE USER :"customer_user" WITH PASSWORD :'customer_pass';
CREATE USER :"invoice_user" WITH PASSWORD :'invoice_pass';

CREATE DATABASE :"auth_db" OWNER :"auth_user";
CREATE DATABASE :"customer_db" OWNER :"customer_user";
CREATE DATABASE :"invoice_db" OWNER :"invoice_user";

REVOKE CONNECT ON DATABASE :"auth_db" FROM PUBLIC;
REVOKE CONNECT ON DATABASE :"customer_db" FROM PUBLIC;
REVOKE CONNECT ON DATABASE :"invoice_db" FROM PUBLIC;

GRANT CONNECT ON DATABASE :"auth_db" TO :"auth_user";
GRANT CONNECT ON DATABASE :"customer_db" TO :"customer_user";
GRANT CONNECT ON DATABASE :"invoice_db" TO :"invoice_user";

GRANT ALL PRIVILEGES ON DATABASE :"auth_db" TO :"auth_user";
GRANT ALL PRIVILEGES ON DATABASE :"customer_db" TO :"customer_user";
GRANT ALL PRIVILEGES ON DATABASE :"invoice_db" TO :"invoice_user";

EOSQL