<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('code', 8)->unique();
            $table->foreignId('host_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('game_type', ['ten_of_ten', 'close_the_number', 'x01', 'cricket']);
            $table->json('game_config');
            $table->enum('status', ['waiting', 'active', 'finished', 'abandoned'])->default('waiting');
            $table->tinyInteger('max_players')->default(4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_rooms');
    }
};
