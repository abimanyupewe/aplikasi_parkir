<?php

namespace Database\Seeders;

use App\Models\AreaParkir;
use Illuminate\Database\Seeder;

/**
 * Seeder untuk data awal area parkir.
 */
class AreaParkirSeeder extends Seeder
{
    /**
     * Jalankan seeder untuk mengisi data area parkir.
     */
    public function run(): void
    {
        $areas = [
            [
                'nama_area' => 'Area Motor A',
                'kapasitas' => 50,
                'terisi' => 0,
            ],
            [
                'nama_area' => 'Area Motor B',
                'kapasitas' => 50,
                'terisi' => 0,
            ],
            [
                'nama_area' => 'Area Mobil A',
                'kapasitas' => 30,
                'terisi' => 0,
            ],
            [
                'nama_area' => 'Area Mobil B',
                'kapasitas' => 20,
                'terisi' => 0,
            ],
        ];

        foreach ($areas as $area) {
            AreaParkir::create($area);
        }
    }
}
