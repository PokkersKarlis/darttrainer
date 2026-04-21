<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * ENUM bez `suspended` izraisa SQLSTATE 1265 pie UPDATE status = 'suspended'.
 * VARCHAR atbrīvo no ENUM saraksta; visas esošās vērtības paliek kā teksts.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        $database = (string) DB::getDatabaseName();
        $prefix    = Schema::getConnection()->getTablePrefix();

        $this->convertTableStatusColumn($database, $prefix . 'matches', 'active');
        $this->convertTableStatusColumn($database, $prefix . 'game_rooms', 'waiting');
    }

    public function down(): void
    {
        // Apzināti tukšs — atpakaļ uz ENUM ir riskanti, ja jau ir `suspended`.
    }

    private function convertTableStatusColumn(string $database, string $table, string $default): void
    {
        $row = DB::selectOne(
            'SELECT COLUMN_TYPE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            [$database, $table, 'status']
        );

        $type = strtolower((string) (data_get($row, 'COLUMN_TYPE') ?? data_get($row, 'column_type') ?? ''));
        if (str_starts_with($type, 'varchar')) {
            return;
        }

        $t = str_replace('`', '``', $table);
        $d = str_replace("'", "''", $default);

        DB::statement(
            "ALTER TABLE `{$t}` MODIFY `status` VARCHAR(32) NOT NULL DEFAULT '{$d}'"
        );
    }
};
