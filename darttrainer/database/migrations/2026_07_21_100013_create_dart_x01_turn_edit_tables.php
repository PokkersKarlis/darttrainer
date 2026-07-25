<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dart_x01_turn_edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->uuid('match_uuid')->index();
            $table->unsignedTinyInteger('leg_number');
            $table->unsignedSmallInteger('turn_number');
            $table->foreignId('player_id')->nullable()->constrained('match_players')->nullOnDelete();
            $table->foreignId('edited_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->json('before_throws');
            $table->json('after_throws');
            $table->unsignedSmallInteger('before_points_scored');
            $table->unsignedSmallInteger('after_points_scored');
            $table->unsignedSmallInteger('before_remaining_points');
            $table->unsignedSmallInteger('after_remaining_points');
            $table->boolean('before_is_bust');
            $table->boolean('after_is_bust');
            $table->timestamp('edited_at')->useCurrent();

            $table->index(['match_id', 'leg_number', 'turn_number'], 'idx_turn_edits_match_leg_turn');
        });

        Schema::create('dart_x01_archived_turn_edits', function (Blueprint $table) {
            $table->id();
            $table->uuid('match_uuid')->index();
            $table->unsignedTinyInteger('leg_number');
            $table->unsignedSmallInteger('turn_number');
            $table->foreignId('turn_owner_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('edited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('before_throws');
            $table->json('after_throws');
            $table->unsignedSmallInteger('before_points_scored');
            $table->unsignedSmallInteger('after_points_scored');
            $table->unsignedSmallInteger('before_remaining_points');
            $table->unsignedSmallInteger('after_remaining_points');
            $table->boolean('before_is_bust');
            $table->boolean('after_is_bust');
            $table->timestamp('edited_at');
            $table->timestamp('archived_at')->useCurrent();

            $table->index(['match_uuid', 'leg_number', 'turn_number'], 'idx_archived_turn_edits_match_leg_turn');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dart_x01_archived_turn_edits');
        Schema::dropIfExists('dart_x01_turn_edits');
    }
};
