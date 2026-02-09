<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Transaksi;
use App\Models\AreaParkir;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TransaksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada area parkir
        if (AreaParkir::count() == 0) {
            $this->call(AreaParkirSeeder::class);
        }

        $areas = AreaParkir::all();

        for ($i = 0; $i < 20; $i++) {
            $jenis = rand(0, 1) ? 'motor' : 'mobil';
            // Cari area yang sesuai dengan jenis kendaraan berdasarkan nama
            $area = $areas->filter(function ($value) use ($jenis) {
                return Str::contains(strtolower($value->nama_area), $jenis);
            })->random();
            
            // Fallback jika tidak ditemukan (seharusnya ada dari AreaParkirSeeder)
            if (!$area) {
                $area = $areas->random();
            }

            // Generate Plat Nomor Indonesia
            // Format: [Huruf 1-2] [Angka 1-4] [Huruf 1-3]
            $prefix = $this->randomLetter(rand(1, 2));
            $number = rand(1000, 9999);
            $suffix = $this->randomLetter(rand(1, 3));
            $plat = "$prefix $number $suffix";

            // Status random: masuk atau keluar
            $status = rand(0, 1) ? 'masuk' : 'keluar';

            // Waktu masuk: antara kemarin dan hari ini
            $waktuMasuk = Carbon::now()->subMinutes(rand(10, 24 * 60));

            $waktuKeluar = null;
            $biaya = null;

            if ($status === 'keluar') {
                // Waktu keluar: beberapa jam setelah masuk, tapi sebelum sekarang
                $durasiMenit = rand(30, 300); // 30 mins to 5 hours
                $waktuKeluar = (clone $waktuMasuk)->addMinutes($durasiMenit);

                // Pastikan waktu keluar tidak melebihi sekarang
                if ($waktuKeluar->isFuture()) {
                    $waktuKeluar = Carbon::now();
                    $durasiMenit = $waktuMasuk->diffInMinutes($waktuKeluar);
                }

                $durasiJam = ceil($durasiMenit / 60);
                $durasiJam = max(1, $durasiJam);
                $tarif = ($jenis === 'mobil') ? 5000 : 2000;
                $biaya = $durasiJam * $tarif;
            } else {
                // Kalau masuk, increment terisi
                // (Ini opsional kalau mau strict counting, tapi untuk dummy data ini fine)
            }

            Transaksi::create([
                'kode_tiket' => strtoupper(Str::random(10)),
                'plat_nomor' => $plat,
                'jenis_kendaraan' => $jenis,
                'id_area' => $area->id_area,
                'waktu_masuk' => $waktuMasuk,
                'waktu_keluar' => $waktuKeluar,
                'biaya' => $biaya,
                'status' => $status,
            ]);
        }
    }

    private function randomLetter($length)
    {
        $letters = '';
        for ($i = 0; $i < $length; $i++) {
            $letters .= chr(rand(65, 90)); // A-Z
        }
        return $letters;
    }
}
