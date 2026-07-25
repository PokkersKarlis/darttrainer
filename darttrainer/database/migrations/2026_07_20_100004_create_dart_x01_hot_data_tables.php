<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dart_x01_active_legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->unsignedTinyInteger('leg_number');
            $table->unsignedSmallInteger('starting_points')->default(501);
            $table->enum('status', ['active', 'finished'])->default('active');
            $table->unsignedBigInteger('winner_player_id')->nullable();
            $table->timestamps();

            $table->unique(['match_id', 'leg_number']);
            $table->index(['match_id', 'status']);
        });

        Schema::create('dart_x01_solo_active_turns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leg_id')->constrained('dart_x01_active_legs')->cascadeOnDelete();
            $table->foreignId('player_id')->nullable()->constrained('match_players')->nullOnDelete();
            $table->unsignedBigInteger('guest_id')->nullable()->index();
            $table->string('guest_name', 50)->nullable();
            $table->unsignedSmallInteger('turn_number');
            $table->unsignedSmallInteger('points_scored')->default(0);
            $table->boolean('is_bust')->default(false);
            $table->unsignedSmallInteger('remaining_points');
            $table->timestamps();

            $table->unique(['leg_id', 'player_id', 'turn_number'], 'uq_solo_turn_player');
        });

        Schema::create('dart_x01_solo_active_throws', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turn_id')->constrained('dart_x01_solo_active_turns')->cascadeOnDelete();
            $table->unsignedTinyInteger('throw_number');
            $table->unsignedTinyInteger('sector');
            $table->unsignedTinyInteger('multiplier');
            $table->boolean('is_leg_winner')->default(false);
            $table->timestamps();

            $table->unique(['turn_id', 'throw_number']);
        });

        Schema::create('dart_x01_team_active_turns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leg_id')->constrained('dart_x01_active_legs')->cascadeOnDelete();
            $table->unsignedBigInteger('team_id')->index();
            $table->foreignId('player_id')->constrained('match_players')->cascadeOnDelete();
            $table->unsignedSmallInteger('turn_number');
            $table->unsignedSmallInteger('points_scored')->default(0);
            $table->boolean('is_bust')->default(false);
            $table->unsignedSmallInteger('remaining_points');
            $table->timestamps();

            $table->unique(['leg_id', 'team_id', 'turn_number'], 'uq_team_turn');
        });

        Schema::create('dart_x01_team_active_throws', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turn_id')->constrained('dart_x01_team_active_turns')->cascadeOnDelete();
            $table->unsignedTinyInteger('throw_number');
            $table->unsignedTinyInteger('sector');
            $table->unsignedTinyInteger('multiplier');
            $table->boolean('is_leg_winner')->default(false);
            $table->timestamps();

            $table->unique(['turn_id', 'throw_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dart_x01_team_active_throws');
        Schema::dropIfExists('dart_x01_team_active_turns');
        Schema::dropIfExists('dart_x01_solo_active_throws');
        Schema::dropIfExists('dart_x01_solo_active_turns');
        Schema::dropIfExists('dart_x01_active_legs');
    }
};
