<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Ja agrākā migrācija netika palaista vai ENUM palika bez `suspended`, MySQL met
 * SQLSTATE[01000] 1265 «Data truncated for column status» pie UPDATE status = suspended.
 * Šī migrācija idempotentā veidā papildina ENUM vērtības.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        $database = (string) DB::getDatabaseName();
        $prefix   = Schema::getConnection()->getTablePrefix();

        $this->ensureMatchesEnum($database, $prefix . 'matches');
        $this->ensureGameRoomsEnum($database, $prefix . 'game_rooms');
    }

    public function down(): void
    {
        // Atstājam ENUM ar suspended — down no vecās migrācijas var būt bīstams; tukšs.
    }

    private function ensureMatchesEnum(string $database, string $table): void
    {
        $row = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$database, $table, 'status']
        );
        if (!$row) {
            return;
        }
        $type = strtolower((string) ($row->COLUMN_TYPE ?? $row->column_type ?? ''));
        if (str_starts_with($type, 'varchar')) {
            return;
        }
        if (str_contains($type, 'suspended')) {
            return;
        }

        DB::statement(
            'ALTER TABLE `' . str_replace('`', '``', $table) . '` MODIFY `status` ENUM(\'active\',\'finished\',\'abandoned\',\'suspended\') NOT NULL DEFAULT \'active\''
        );
    }

    private function ensureGameRoomsEnum(string $database, string $table): void
    {
        $row = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$database, $table, 'status']
        );
        if (!$row) {
            return;
        }
        $type = strtolower((string) ($row->COLUMN_TYPE ?? $row->column_type ?? ''));
        if (str_starts_with($type, 'varchar')) {
            return;
        }
        if (str_contains($type, 'suspended')) {
            return;
        }

        DB::statement(
            'ALTER TABLE `' . str_replace('`', '``', $table) . '` MODIFY `status` ENUM(\'waiting\',\'active\',\'finished\',\'abandoned\',\'suspended\') NOT NULL DEFAULT \'waiting\''
        );
    }
};
