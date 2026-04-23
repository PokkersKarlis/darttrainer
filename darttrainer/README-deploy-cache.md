## Production cache notes (SPA)

If production shows stale HTML (e.g. old loader/markup), clear Laravel caches after deploy:

```bash
php artisan view:clear
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

For OPcache / PHP-FPM, also reload the service if needed.

