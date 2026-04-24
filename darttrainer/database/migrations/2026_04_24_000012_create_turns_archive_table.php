<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('turns_archive', function (Blueprint $table) {
            // Preserve original turn IDs for stable references.
            $table->unsignedBigInteger('id')->primary();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('leg_id')->constrained('legs')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('room_players')->cascadeOnDelete();
            $table->smallInteger('turn_number');
            $table->smallInteger('score_before')->nullable();
            $table->smallInteger('score_after')->nullable();
            $table->smallInteger('total_scored')->default(0);
            $table->boolean('is_bust')->default(false);
            $table->boolean('is_checkout')->default(false);
            $table->boolean('is_undone')->default(false);
            $table->timestamp('created_at');

            $table->index(['match_id', 'id']);
            $table->index(['leg_id', 'is_undone', 'id']);
            $table->index(['leg_id', 'player_id', 'is_undone', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('turns_archive');
    }
};

