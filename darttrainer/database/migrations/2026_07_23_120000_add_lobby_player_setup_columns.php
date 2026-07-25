<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->unsignedSmallInteger('starting_points')->nullable()->after('display_name');
            $table->string('guest_email', 255)->nullable()->after('guest_id');
        });

        Schema::table('user_local_guests', function (Blueprint $table) {
            $table->string('email', 255)->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('match_players', function (Blueprint $table) {
            $table->dropColumn(['starting_points', 'guest_email']);
        });

        Schema::table('user_local_guests', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
