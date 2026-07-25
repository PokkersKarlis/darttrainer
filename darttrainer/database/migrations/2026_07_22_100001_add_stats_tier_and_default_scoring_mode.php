<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->enum('stats_tier', ['full', 'basic'])->default('full')->after('scoring_mode');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('default_scoring_mode', ['board', 'calculator'])->default('board')->after('locale');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('default_scoring_mode');
        });

        Schema::table('match_players', function (Blueprint $table) {
            $table->dropColumn('stats_tier');
        });
    }
};
