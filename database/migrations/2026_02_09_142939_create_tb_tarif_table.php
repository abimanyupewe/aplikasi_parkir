<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tb_tarif', function (Blueprint $table) {
            $table->id('id_tarif');
            $table->enum('jenis_kendaraan', ['motor', 'mobil'])->unique();
            $table->integer('tarif_per_jam');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_tarif');
    }
};
