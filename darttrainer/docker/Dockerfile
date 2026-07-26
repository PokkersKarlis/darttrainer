FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    postgresql-dev

RUN docker-php-ext-install pdo pdo_pgsql pdo_mysql bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Kopējam tikai composer.json/.lock vispirms (Docker layer cache — composer
# install pārpalaižas tikai tad, ja šie faili mainās, ne katru reizi kad mainās
# app kods). --no-scripts, jo pilns app kods (artisan u.c.) šeit vēl nav klāt.
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Šis vendor/ ieliek image slānī — docker-compose.yml "vendor" named volume
# pie pirmā starta to pārkopēs sevī (Docker uzvedība: tukšs named volume, kas
# tiek mount'ots virs jau-aizpildīta image ceļa, tiek inicializēts no image
# satura). Pēc tam runtime bind-mount (.:/var/www) šo ceļu vairs nepārraksta,
# jo named volume mount ir specifiskāks par vecāka bind-mount.
EXPOSE 9000
CMD ["php-fpm"]