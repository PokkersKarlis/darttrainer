<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->enum('scoring_mode', ['board', 'calculator'])->default('board')->after('status');
        });

        Schema::table('dart_x01_solo_active_throws', function (Blueprint $table) {
            $table->enum('input_source', ['board', 'calculator'])->default('board')->after('multiplier');
        });
    }

    public function down(): void
    {
        Schema::table('dart_x01_solo_active_throws', function (Blueprint $table) {
            $table->dropColumn('input_source');
        });

        Schema::table('match_players', function (Blueprint $table) {
            $table->dropColumn('scoring_mode');
        });
    }
};
