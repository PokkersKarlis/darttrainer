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
        Schema::create('game_close_the_numbers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('player_id')->nullable();
            $table->integer('finished')->default(0);
            $table->integer('starting_number');
            $table->integer('ending_number');
            $table->timestamps();
        });

        Schema::create('game_close_the_number_elements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('game_id');
            $table->integer('given_number');
            $table->integer('darts_count')->default(0);
            $table->timestamps();
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
