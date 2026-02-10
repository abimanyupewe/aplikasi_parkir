<?php

namespace Database\Seeders;

use App\Models\Kendaraan;
use Illuminate\Database\Seeder;

class KendaraanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Kendaraan::create([
            'plat_nomor' => 'Honda Jazz RS',
            'jenis_kendaraan' => 'mobil',
            'id_user' => 1,
        ]);

        Kendaraan::create([
            'plat_nomor' => 'Yamaha NMAX',
            'jenis_kendaraan' => 'motor',
            'id_user' => 1,
        ]);
    }
}
