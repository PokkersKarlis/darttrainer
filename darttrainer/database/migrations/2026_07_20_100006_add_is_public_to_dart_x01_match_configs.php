<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dart_x01_match_configs', function (Blueprint $table) {
            $table->boolean('is_public')->default(false)->after('track_checkout_rate');
        });
    }

    public function down(): void
    {
        Schema::table('dart_x01_match_configs', function (Blueprint $table) {
            $table->dropColumn('is_public');
        });
    }
};
