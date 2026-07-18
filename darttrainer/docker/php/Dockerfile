FROM php:8.4-cli

# Sistēmas atkarības + PHP paplašinājumi (pdo_mysql, intl, zip, bcmath)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libicu-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install pdo_mysql bcmath intl zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

EXPOSE 8000
