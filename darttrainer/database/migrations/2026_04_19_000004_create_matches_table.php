<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('game_rooms')->cascadeOnDelete();
            $table->foreignId('current_player_id')->nullable()->constrained('room_players')->nullOnDelete();
            $table->smallInteger('current_leg')->default(1);
            $table->smallInteger('current_set')->default(1);
            $table->json('legs_config');
            $table->enum('status', ['active', 'finished', 'abandoned'])->default('active');
            $table->foreignId('winner_player_id')->nullable()->constrained('room_players')->nullOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
