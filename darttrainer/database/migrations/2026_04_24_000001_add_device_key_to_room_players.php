<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_players', function (Blueprint $table) {
            if (!Schema::hasColumn('room_players', 'device_key')) {
                $table->string('device_key', 120)->nullable()->index()->after('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('room_players', function (Blueprint $table) {
            if (Schema::hasColumn('room_players', 'device_key')) {
                $table->dropIndex(['device_key']);
                $table->dropColumn('device_key');
            }
        });
    }
};

