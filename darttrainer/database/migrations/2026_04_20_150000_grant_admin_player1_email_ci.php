<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereRaw('LOWER(email) = ?', ['player1@dart.lv'])->update(['is_admin' => true]);
    }

    public function down(): void
    {
        DB::table('users')->whereRaw('LOWER(email) = ?', ['player1@dart.lv'])->update(['is_admin' => false]);
    }
};
