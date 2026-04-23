<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            if (!Schema::hasColumn('matches', 'local_session_id')) {
                $table->string('local_session_id', 120)->nullable()->index()->after('room_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            if (Schema::hasColumn('matches', 'local_session_id')) {
                $table->dropIndex(['local_session_id']);
                $table->dropColumn('local_session_id');
            }
        });
    }
};

