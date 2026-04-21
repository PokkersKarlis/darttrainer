#!/bin/bash
set -e

# 1) Composer bez dev atkarībām
composer install --no-dev --optimize-autoloader

# 2) Laravel cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3) Frontend build (ja tiek izmantots build process)
npm run build

# 4) Kopēšana uz hostingu (pielāgo pēc vajadzības)
# rsync -avz --delete ./ user@host:/path/to/public_html
