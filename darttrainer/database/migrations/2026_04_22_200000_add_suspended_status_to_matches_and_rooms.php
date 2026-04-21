<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('active','finished','abandoned','suspended') NOT NULL DEFAULT 'active'");
            DB::statement("ALTER TABLE `game_rooms` MODIFY `status` ENUM('waiting','active','finished','abandoned','suspended') NOT NULL DEFAULT 'waiting'");

            return;
        }

        // SQLite: Laravel `enum` uses VARCHAR + CHECK; allow any string including `suspended`.
        if ($driver === 'sqlite') {
            Schema::table('matches', function (Blueprint $table) {
                $table->string('status', 32)->default('active')->change();
            });
            Schema::table('game_rooms', function (Blueprint $table) {
                $table->string('status', 32)->default('waiting')->change();
            });
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("UPDATE `matches` SET `status` = 'abandoned' WHERE `status` = 'suspended'");
            DB::statement("UPDATE `game_rooms` SET `status` = 'abandoned' WHERE `status` = 'suspended'");
            DB::statement("ALTER TABLE `matches` MODIFY `status` ENUM('active','finished','abandoned') NOT NULL DEFAULT 'active'");
            DB::statement("ALTER TABLE `game_rooms` MODIFY `status` ENUM('waiting','active','finished','abandoned') NOT NULL DEFAULT 'waiting'");

            return;
        }

        if ($driver === 'sqlite') {
            DB::table('matches')->where('status', 'suspended')->update(['status' => 'abandoned']);
            DB::table('game_rooms')->where('status', 'suspended')->update(['status' => 'abandoned']);
            Schema::table('matches', function (Blueprint $table) {
                $table->enum('status', ['active', 'finished', 'abandoned'])->default('active')->change();
            });
            Schema::table('game_rooms', function (Blueprint $table) {
                $table->enum('status', ['waiting', 'active', 'finished', 'abandoned'])->default('waiting')->change();
            });
        }
    }
};
