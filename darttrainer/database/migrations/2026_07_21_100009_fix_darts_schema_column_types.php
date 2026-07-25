<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corrective migration for drifted MySQL schemas.
 *
 * Expected canonical types (see 100003 + 100008):
 * - match_players: NO is_online, NO last_seen_at (presence lives on users.last_seen_at)
 * - dart_x01_match_configs.in_rule / out_rule: ENUM('straight','double') — not DOUBLE
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'last_seen_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('last_seen_at')->nullable()->after('remember_token');
            });
        }

        $dropFromMatchPlayers = array_values(array_filter([
            Schema::hasColumn('match_players', 'is_online') ? 'is_online' : null,
            Schema::hasColumn('match_players', 'last_seen_at') ? 'last_seen_at' : null,
        ]));

        if ($dropFromMatchPlayers !== []) {
            Schema::table('match_players', function (Blueprint $table) use ($dropFromMatchPlayers) {
                $table->dropColumn($dropFromMatchPlayers);
            });
        }

        if (! Schema::hasTable('dart_x01_match_configs')) {
            return;
        }

        if (Schema::getConnection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE dart_x01_match_configs MODIFY in_rule VARCHAR(10) NOT NULL DEFAULT 'straight'");
        DB::statement("ALTER TABLE dart_x01_match_configs MODIFY out_rule VARCHAR(10) NOT NULL DEFAULT 'double'");

        DB::statement("
            UPDATE dart_x01_match_configs
            SET in_rule = 'straight'
            WHERE in_rule IS NULL OR in_rule = '' OR in_rule NOT IN ('straight', 'double')
        ");

        DB::statement("
            UPDATE dart_x01_match_configs
            SET out_rule = 'double'
            WHERE out_rule IS NULL OR out_rule = '' OR out_rule NOT IN ('straight', 'double')
        ");

        DB::statement("ALTER TABLE dart_x01_match_configs MODIFY in_rule ENUM('straight', 'double') NOT NULL DEFAULT 'straight'");
        DB::statement("ALTER TABLE dart_x01_match_configs MODIFY out_rule ENUM('straight', 'double') NOT NULL DEFAULT 'double'");
    }

    public function down(): void
    {
        // Intentionally empty — do not restore deprecated/wrong column types.
    }
};
