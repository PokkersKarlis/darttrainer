<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedBigInteger('guest_id')->nullable()->index();
            $table->string('display_name', 50);
            $table->unsignedTinyInteger('slot');
            $table->unsignedBigInteger('team_id')->nullable()->index();
            $table->enum('status', ['waiting', 'ready', 'playing'])->default('waiting');
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['match_id', 'slot']);
            $table->index(['match_id', 'user_id']);
        });

        Schema::create('dart_x01_match_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->unique()->constrained('matches')->cascadeOnDelete();
            $table->enum('mode', ['online', 'local'])->default('local');
            $table->enum('format', ['best_of', 'first_to'])->default('first_to');
            $table->unsignedTinyInteger('legs_target')->default(1);
            $table->unsignedTinyInteger('sets_target')->default(1);
            $table->unsignedSmallInteger('starting_points')->default(501);
            $table->enum('in_rule', ['straight', 'double'])->default('straight');
            $table->enum('out_rule', ['straight', 'double'])->default('double');
            $table->boolean('track_checkout_rate')->default(false);
            $table->timestamps();
        });

        Schema::create('user_local_guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 50);
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_local_guests');
        Schema::dropIfExists('dart_x01_match_configs');
        Schema::dropIfExists('match_players');
    }
};
