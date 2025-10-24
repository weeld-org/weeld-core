.PHONY: up down down-v logs psql qa lint test test-cov build format format-check start start-dev drizzle-generate drizzle-migrate drizzle-studio

# Defaults if .env not loaded manually when calling make
POSTGRES_USER ?= weeld
POSTGRES_DB ?= weeld_core
# Export so child processes (npm, docker) inherit values
export POSTGRES_USER
export POSTGRES_DB

# Docker (Postgres)
up:
	npm run db:up

down:
	npm run db:down

down-v:
	npm run db:down:v

logs:
	npm run db:logs

psql:
	npm run db:psql

# Qualité
qa:
	npm run qa

lint:
	npm run lint

format:
	npm run format

format-check:
	npm run format:check

test:
	npm run test

test-cov:
	npm run test:cov

build:
	npm run build

# App
start:
	npm run start

start-dev:
	npm run start:dev

# Drizzle
drizzle-generate:
	npm run drizzle:generate

drizzle-migrate:
	npm run drizzle:migrate

drizzle-studio:
	npm run drizzle:studio
