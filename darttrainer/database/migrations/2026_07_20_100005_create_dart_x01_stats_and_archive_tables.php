<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dart_x01_player_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('matches_played')->default(0);
            $table->unsignedInteger('legs_won')->default(0);
            $table->unsignedInteger('darts_thrown')->default(0);
            $table->unsignedInteger('points_scored')->default(0);
            $table->unsignedInteger('checkout_attempts')->default(0);
            $table->unsignedInteger('checkout_successes')->default(0);
            $table->timestamps();
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE dart_x01_player_stats ADD COLUMN three_dart_avg DECIMAL(8,2) AS (CASE WHEN darts_thrown = 0 THEN 0 ELSE (points_scored / darts_thrown) * 3 END) STORED');
            DB::statement('ALTER TABLE dart_x01_player_stats ADD COLUMN checkout_percentage DECIMAL(5,2) AS (CASE WHEN checkout_attempts = 0 THEN 0 ELSE (checkout_successes / checkout_attempts) * 100 END) STORED');
        } else {
            Schema::table('dart_x01_player_stats', function (Blueprint $table) {
                $table->decimal('three_dart_avg', 8, 2)->default(0);
                $table->decimal('checkout_percentage', 5, 2)->default(0);
            });
        }

        Schema::create('dart_x01_solo_archived_throws', function (Blueprint $table) {
            $table->id();
            $table->uuid('match_uuid')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('leg_number');
            $table->unsignedSmallInteger('turn_number');
            $table->unsignedTinyInteger('throw_number');
            $table->unsignedTinyInteger('sector');
            $table->unsignedTinyInteger('multiplier');
            $table->unsignedSmallInteger('points_scored');
            $table->boolean('is_bust')->default(false);
            $table->boolean('is_leg_winner')->default(false);
            $table->timestamp('archived_at')->useCurrent();

            $table->index(['user_id', 'archived_at']);
            $table->index(['match_uuid', 'leg_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dart_x01_solo_archived_throws');
        Schema::dropIfExists('dart_x01_player_stats');
    }
};
