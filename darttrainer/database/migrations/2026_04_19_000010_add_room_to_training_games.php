<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_ten_of_tens', function (Blueprint $table) {
            $table->foreignId('room_id')->nullable()->constrained('game_rooms')->nullOnDelete()->after('id');
            $table->foreignId('match_id')->nullable()->constrained('matches')->nullOnDelete()->after('room_id');
        });

        Schema::table('game_close_the_numbers', function (Blueprint $table) {
            $table->foreignId('room_id')->nullable()->constrained('game_rooms')->nullOnDelete()->after('id');
            $table->foreignId('match_id')->nullable()->constrained('matches')->nullOnDelete()->after('room_id');
        });
    }

    public function down(): void
    {
        Schema::table('game_ten_of_tens', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropForeign(['match_id']);
            $table->dropColumn(['room_id', 'match_id']);
        });

        Schema::table('game_close_the_numbers', function (Blueprint $table) {
            $table->dropForeign(['room_id']);
            $table->dropForeign(['match_id']);
            $table->dropColumn(['room_id', 'match_id']);
        });
    }
};
