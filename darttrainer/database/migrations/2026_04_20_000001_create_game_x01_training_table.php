<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_x01_training', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('player_id')->nullable();  // users.id
            $table->string('session_id', 100)->nullable();         // guest fallback
            $table->unsignedSmallInteger('variant')->default(501); // 501 | 301
            $table->string('out_mode', 20)->default('double');     // 'double' | 'straight'
            $table->unsignedSmallInteger('current_score');
            $table->json('turns')->nullable();
            $table->tinyInteger('finished')->default(0);
            $table->timestamps();

            $table->index(['player_id', 'finished']);
            $table->index(['session_id', 'finished']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_x01_training');
    }
};
