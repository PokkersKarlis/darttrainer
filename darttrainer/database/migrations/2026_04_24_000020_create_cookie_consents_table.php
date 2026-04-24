<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cookie_consents', function (Blueprint $table) {
            $table->id();
            // Random UUID stored in cookie (no user_id), hashed before storing.
            $table->string('consent_hash', 64)->index();
            $table->smallInteger('version')->default(1);
            $table->boolean('functional')->default(false);
            $table->boolean('analytics')->default(false);
            $table->boolean('marketing')->default(false);
            $table->timestamp('created_at')->useCurrent();

            // Optional minimal evidence; keep it coarse to avoid extra personal data storage.
            $table->string('ip_prefix', 64)->nullable();
            $table->string('user_agent_hash', 64)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cookie_consents');
    }
};

