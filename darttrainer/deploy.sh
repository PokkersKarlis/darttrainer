#!/bin/bash
set -e

# 1) Composer bez dev atkarībām
composer install --no-dev --optimize-autoloader

# 2) Laravel cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3) Frontend: uz kopīga hostinga `vite build` bieži nav iespējams (WASM OOM).
#    Uzbūvē GitHub Actions (workflow "Build frontend") vai lokāli, tad augšupielādē public/build/.
if [ -f public/build/manifest.json ]; then
  echo "OK: public/build/manifest.json — izlaižam npm run build"
else
  npm run build
fi

# 4) Kopēšana uz hostingu (pielāgo pēc vajadzības)
# rsync -avz --delete ./ user@host:/path/to/public_html
