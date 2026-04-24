<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_visits', function (Blueprint $table) {
            $table->id();
            $table->date('visit_date');
            $table->string('ip_address', 45);
            // Guests = 0, so we can have a real UNIQUE constraint.
            $table->unsignedBigInteger('user_id')->default(0);
            $table->string('user_name', 80)->nullable();
            $table->unsignedInteger('hits')->default(1);
            $table->boolean('hit_login')->default(false);
            $table->boolean('hit_register')->default(false);
            $table->timestamp('first_seen_at')->useCurrent();
            $table->timestamp('last_seen_at')->useCurrent();

            $table->unique(['visit_date', 'ip_address', 'user_id'], 'daily_visits_date_ip_user');
            $table->index(['visit_date', 'ip_address'], 'daily_visits_date_ip');
            $table->index(['visit_date', 'user_id'], 'daily_visits_date_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_visits');
    }
};

