<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cricket_state', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('leg_id')->constrained('legs')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('room_players')->cascadeOnDelete();
            // hits per segment: 0=open, 1,2=partial, 3=closed
            $table->tinyInteger('seg_15')->default(0);
            $table->tinyInteger('seg_16')->default(0);
            $table->tinyInteger('seg_17')->default(0);
            $table->tinyInteger('seg_18')->default(0);
            $table->tinyInteger('seg_19')->default(0);
            $table->tinyInteger('seg_20')->default(0);
            $table->tinyInteger('seg_bull')->default(0);
            $table->smallInteger('points')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique(['leg_id', 'player_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cricket_state');
    }
};
