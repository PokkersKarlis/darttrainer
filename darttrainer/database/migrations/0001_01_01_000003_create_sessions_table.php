<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Šī tabula bija nepieciešama, jo .env izmanto SESSION_DRIVER=database,
     * bet sākotnējā Laravel 12 skeletona migrāciju kopa (users, cache, jobs)
     * to neietver — tā jāģenerē atsevišķi ar `php artisan session:table`.
     * Bez tās katrs pieprasījums, kas mēģina lasīt/rakstīt sesiju, cieta
     * neveiksmi klusi (session write notiek middleware terminate() fāzē,
     * pēc atbildes nosūtīšanas), kas izpaudās kā izlogošanās pēc refresh
     * un neizdevušies auth darbību pieprasījumi (profils/parole/logout).
     */
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
