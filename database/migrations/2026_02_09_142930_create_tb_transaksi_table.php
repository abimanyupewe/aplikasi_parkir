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
        Schema::create('tb_transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->string('plat_nomor', 15);
            $table->enum('jenis_kendaraan', ['motor', 'mobil']);
            $table->dateTime('waktu_masuk');
            $table->dateTime('waktu_keluar')->nullable();
            $table->enum('status', ['masuk', 'keluar'])->default('masuk');
            $table->unsignedBigInteger('id_area');
            $table->decimal('biaya', 10, 2)->nullable();
            $table->timestamps();

            $table->foreign('id_area')
                ->references('id_area')
                ->on('tb_area_parkir')
                ->onDelete('cascade');

            $table->index('plat_nomor');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tb_transaksi');
    }
};
