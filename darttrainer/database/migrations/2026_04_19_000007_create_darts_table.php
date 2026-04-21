<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('darts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turn_id')->constrained('turns')->cascadeOnDelete();
            $table->tinyInteger('dart_number');
            $table->tinyInteger('segment');
            $table->tinyInteger('multiplier')->default(1);
            $table->smallInteger('value');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('darts');
    }
};
