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
            $table->uuid('uuid')->unique();
            $table->string('lobby_code', 10)->nullable()->index();
            $table->enum('game_type', ['darts_x01', 'darts_cricket'])->default('darts_x01');
            $table->enum('match_type', ['solo', 'team'])->default('solo');
            $table->enum('status', ['lobby', 'active', 'finished', 'cancelled'])->default('lobby')->index();
            $table->unsignedBigInteger('tournament_id')->nullable()->index();
            $table->unsignedBigInteger('winner_id')->nullable();
            $table->foreignId('host_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->timestamp('finished_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
