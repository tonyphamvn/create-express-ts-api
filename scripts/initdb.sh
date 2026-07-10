#! /bin/sh

psql -v --username "${POSTGRES_USER}" -c "CREATE DATABASE ${POSTGRES_DB_MAIN};"
psql -v --username "${POSTGRES_USER}" -d "${POSTGRES_DB_MAIN}" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

psql -v --username "${POSTGRES_USER}" -c "CREATE DATABASE ${POSTGRES_DB_TEST};"
psql -v --username "${POSTGRES_USER}" -d "${POSTGRES_DB_TEST}" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
