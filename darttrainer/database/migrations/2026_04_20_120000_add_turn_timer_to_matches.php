<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->timestamp('turn_deadline_at')->nullable()->after('finished_at');
            $table->boolean('turn_timeout_pending')->default(false)->after('turn_deadline_at');
            $table->unsignedSmallInteger('turn_timer_window_seconds')->default(300)->after('turn_timeout_pending');
            $table->boolean('exclude_from_stats')->default(false)->after('turn_timer_window_seconds');
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn([
                'turn_deadline_at',
                'turn_timeout_pending',
                'turn_timer_window_seconds',
                'exclude_from_stats',
            ]);
        });
    }
};
