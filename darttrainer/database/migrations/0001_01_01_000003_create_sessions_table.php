<?php

use Illuminate\Database\Migrations\Migration;

/**
 * TUKŠS — DZĒŠAMS FAILS.
 *
 * Šis migrācijas fails bija kļūdains: `sessions` tabula jau tiek izveidota
 * iekš 0001_01_01_000000_create_users_table.php (Laravel 12 skeleton to
 * apvieno kopā ar users un password_reset_tokens). Šis dublikāts izraisīja
 * "table sessions already exists" kļūdu testos.
 *
 * Izdzēs šo failu no database/migrations/ un tad palaid:
 *   docker compose exec app php artisan migrate:fresh
 */
return new class extends Migration
{
    public function up(): void {}

    public function down(): void {}
};
