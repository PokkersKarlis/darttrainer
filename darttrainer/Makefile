.PHONY: up up-dev up-all down build rebuild rebuild-php npm-install npm-build npm-dev shell-node shell \
	composer-install composer-update migrate fresh seed logs logs-php logs-nginx logs-vite ps key setup

# Pamata stack: Nginx + PHP + MySQL (bez Node procesiem)
up:
	docker compose up -d

# + Vite (HMR uz 5173)
up-dev:
	docker compose --profile dev up -d

# Viss izstrādei: pamata stack + Vite
up-all: up
	docker compose --profile dev up -d vite

# Apturēt
down:
	docker compose down

# Pārbūvēt PHP image
build:
	docker compose build php

# Down → PHP build → pamata stack augšā
rebuild-php:
	docker compose down && docker compose build php && docker compose up -d

rebuild:
	docker compose down && docker compose build && docker compose up -d

# Shell PHP konteinerī
shell:
	docker compose exec php bash

# Shell Node konteinerī (Alpine sh) — npm komandas rokas režīmā
shell-node:
	docker compose --profile tools run --rm -it nodejs sh

# npm vienmēr caur `nodejs` servisu (profils tools; nav jābūt ieslēgtam `vite`)
npm-install:
	docker compose --profile tools run --rm nodejs npm install

npm-build:
	docker compose --profile tools run --rm nodejs sh -c "npm install && npm run build"

# Tikai Vite process (ja vajag atsevišķi no up-all)
npm-dev:
	docker compose --profile dev up -d vite

# Composer
composer-install:
	docker compose exec php composer install

composer-update:
	docker compose exec php composer update

# Laravel
key:
	docker compose exec php php artisan key:generate

migrate:
	docker compose exec php php artisan migrate

fresh:
	docker compose exec php php artisan migrate:fresh --seed

seed:
	docker compose exec php php artisan db:seed

# Logi
logs:
	docker compose logs -f

logs-php:
	docker compose logs -f php

logs-nginx:
	docker compose logs -f nginx

logs-vite:
	docker compose logs -f vite

ps:
	docker compose ps

# Pirmā uzstādīšana: stack + composer + migrācijas + frontend build konteinerī
setup:
	docker compose build
	docker compose up -d
	docker compose exec php composer install
	docker compose exec php php artisan key:generate
	docker compose exec php php artisan migrate
	docker compose --profile tools run --rm nodejs sh -c "npm install && npm run build"
	@echo ""
	@echo "DartTrainer: http://localhost:8088  |  Vite dev: make up-dev → http://localhost:5173"
