<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cricket_state', function (Blueprint $table) {
            // JSON store for arbitrary segment hits (supports random/non-standard cricket)
            $table->json('seg_data')->nullable()->after('seg_bull');
        });

        // Migrate existing rows: populate seg_data from legacy columns
        DB::statement("
            UPDATE cricket_state
            SET seg_data = JSON_OBJECT(
                '15', seg_15, '16', seg_16, '17', seg_17,
                '18', seg_18, '19', seg_19, '20', seg_20,
                '25', seg_bull
            )
            WHERE seg_data IS NULL
        ");
    }

    public function down(): void
    {
        Schema::table('cricket_state', function (Blueprint $table) {
            $table->dropColumn('seg_data');
        });
    }
};
