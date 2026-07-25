<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->foreignId('turn_timer_player_id')
                ->nullable()
                ->after('host_user_id')
                ->constrained('match_players')
                ->nullOnDelete();
            $table->timestamp('turn_timer_expires_at')->nullable()->after('turn_timer_player_id');
            $table->enum('turn_timer_status', ['running', 'expired', 'extended'])
                ->nullable()
                ->after('turn_timer_expires_at');
        });

        Schema::create('match_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('body', 500);
            $table->timestamps();

            $table->index(['match_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_chat_messages');

        Schema::table('matches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('turn_timer_player_id');
            $table->dropColumn(['turn_timer_expires_at', 'turn_timer_status']);
        });
    }
};
