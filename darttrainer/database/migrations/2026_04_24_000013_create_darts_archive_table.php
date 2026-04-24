<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('darts_archive', function (Blueprint $table) {
            // Preserve original dart IDs for stable references.
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('turn_id');
            $table->tinyInteger('dart_number');
            $table->tinyInteger('segment');
            $table->tinyInteger('multiplier')->default(1);
            $table->smallInteger('value');
            $table->timestamp('created_at');

            $table->foreign('turn_id')->references('id')->on('turns_archive')->cascadeOnDelete();
            $table->index(['turn_id', 'dart_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('darts_archive');
    }
};

