<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create game_close_the_numbers table
        Schema::create('game_close_the_numbers', function (Blueprint $table) {
            $table->id(); // id: integer, auto increment, primary
            $table->unsignedBigInteger('player_id')->nullable(); // player_id: bigint, not null, unsigned
            $table->integer('finished')->default(0); // finished: integer, min 0, max 1, default 0
            $table->integer('starting_number'); // starting_number: integer, min 2, max 330
            $table->integer('ending_number'); // ending_number: integer, min 3, max 350
            $table->timestamps(); // created_at and updated_at: timestamps, nullable

            // Foreign key constraints (if applicable)
            // $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });

        // Create game_close_the_number_element table
        Schema::create('game_close_the_number_elements', function (Blueprint $table) {
            $table->id(); // id: integer, auto increment, primary
            $table->unsignedBigInteger('game_id'); // game_id: bigint, not null, unsigned
            $table->integer('given_number'); // given_number: integer, min 2, max 350
            $table->integer('darts_count')->default(0); // darts_count: integer, default 0
            $table->timestamps(); // created_at and updated_at: timestamps, nullable

            // Foreign key constraints (if applicable)
            // $table->foreign('game_id')->references('id')->on('game_close_the_numbers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('game_close_the_number_element');
        Schema::dropIfExists('game_close_the_numbers');
    }
};
