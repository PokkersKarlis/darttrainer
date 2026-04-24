<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('turns', function (Blueprint $table) {
            $table->index(['leg_id', 'is_undone', 'id'], 'turns_leg_undone_id');
            $table->index(['leg_id', 'player_id', 'is_undone', 'id'], 'turns_leg_player_undone_id');
            $table->index(['match_id', 'id'], 'turns_match_id_id');
        });

        Schema::table('darts', function (Blueprint $table) {
            $table->index(['turn_id', 'dart_number'], 'darts_turn_dartnum');
        });

        Schema::table('room_players', function (Blueprint $table) {
            $table->index(['room_id', 'user_id'], 'room_players_room_user');
            $table->index(['user_id', 'device_key'], 'room_players_user_device');
        });
    }

    public function down(): void
    {
        Schema::table('turns', function (Blueprint $table) {
            $table->dropIndex('turns_leg_undone_id');
            $table->dropIndex('turns_leg_player_undone_id');
            $table->dropIndex('turns_match_id_id');
        });

        Schema::table('darts', function (Blueprint $table) {
            $table->dropIndex('darts_turn_dartnum');
        });

        Schema::table('room_players', function (Blueprint $table) {
            $table->dropIndex('room_players_room_user');
            $table->dropIndex('room_players_user_device');
        });
    }
};

