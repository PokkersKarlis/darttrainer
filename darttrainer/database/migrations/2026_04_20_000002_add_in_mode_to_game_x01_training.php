<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('game_x01_training', function (Blueprint $table) {
            $table->string('in_mode', 20)->default('straight')->after('out_mode');
        });
    }

    public function down(): void
    {
        Schema::table('game_x01_training', function (Blueprint $table) {
            $table->dropColumn('in_mode');
        });
    }
};
