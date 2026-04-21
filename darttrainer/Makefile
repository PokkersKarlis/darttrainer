.PHONY: up down build restart shell migrate fresh seed logs ps key

# Startēt (bez Node/Vite)
up:
	docker compose up -d

# Startēt ar Vite dev serveri
up-dev:
	docker compose --profile dev up -d

# Apturēt
down:
	docker compose down

# Rebuild PHP image
build:
	docker compose build php

# Rebuild visu
rebuild:
	docker compose down && docker compose build && docker compose up -d

# Shell PHP konteinerā
shell:
	docker compose exec php bash

# Laravel komandas
key:
	docker compose exec php php artisan key:generate

migrate:
	docker compose exec php php artisan migrate

fresh:
	docker compose exec php php artisan migrate:fresh --seed

seed:
	docker compose exec php php artisan db:seed

# Frontend build (lokāli, bez npm serverī)
npm-build:
	MSYS_NO_PATHCONV=1 docker run --rm -v "c:/programming/darttrainer/darttrainer:/app" -w /app node:20-alpine sh -c "npm install && npm run build"

npm-dev:
	MSYS_NO_PATHCONV=1 docker run --rm -v "c:/programming/darttrainer/darttrainer:/app" -w /app -p 5173:5173 node:20-alpine sh -c "npm install && npm run dev -- --host"

# Composer
composer-install:
	docker compose exec php composer install

composer-update:
	docker compose exec php composer update

# Logs
logs:
	docker compose logs -f

logs-php:
	docker compose logs -f php

logs-nginx:
	docker compose logs -f nginx

# Status
ps:
	docker compose ps

# Pirmo reizi setup
setup:
	docker compose build
	docker compose up -d
	docker compose exec php composer install
	docker compose exec php php artisan key:generate
	docker compose exec php php artisan migrate
	MSYS_NO_PATHCONV=1 docker run --rm -v "c:/programming/darttrainer/darttrainer:/app" -w /app node:20-alpine sh -c "npm install && npm run build"
	@echo ""
	@echo "DartTrainer darbojas: http://localhost:8088"
