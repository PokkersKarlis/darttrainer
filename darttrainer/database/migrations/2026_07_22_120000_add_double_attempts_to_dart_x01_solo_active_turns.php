<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dart_x01_solo_active_turns', function (Blueprint $table) {
            $table->unsignedTinyInteger('double_attempts')->nullable()->after('points_scored');
        });
    }

    public function down(): void
    {
        Schema::table('dart_x01_solo_active_turns', function (Blueprint $table) {
            $table->dropColumn('double_attempts');
        });
    }
};
