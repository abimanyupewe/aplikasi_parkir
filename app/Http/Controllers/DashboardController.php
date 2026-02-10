<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use App\Models\Transaksi;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk mengelola halaman Dashboard.
 *
 * Menampilkan overview statistik parkir secara real-time.
 */
class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard dengan statistik.
     *
     * @return Response
     */
    public function index(): Response
    {
        // Statistik Area Parkir
        $areas = AreaParkir::select('id_area', 'nama_area', 'kapasitas', 'terisi')
            ->get()
            ->map(function ($area) {
                return [
                    'id_area' => $area->id_area,
                    'nama_area' => $area->nama_area,
                    'kapasitas' => $area->kapasitas,
                    'terisi' => $area->terisi,
                    'tersedia' => $area->kapasitas - $area->terisi,
                    'persentase' => $area->kapasitas > 0
                        ? round(($area->terisi / $area->kapasitas) * 100, 1)
                        : 0,
                ];
            });

        // Total kapasitas
        $totalKapasitas = AreaParkir::sum('kapasitas');
        $totalTerisi = AreaParkir::sum('terisi');

        // Total Pendapatan
        $totalPendapatan = Transaksi::where('status', 'keluar')->sum('biaya');

        // Transaksi hari ini
        $transaksiHariIni = Transaksi::whereDate('waktu_masuk', today())->count();

        // Kendaraan yang sedang parkir (status = masuk)
        $kendaraanParkir = Transaksi::where('status', 'masuk')->count();

        // Statistik per jenis kendaraan
        $statistikKendaraan = Transaksi::where('status', 'masuk')
            ->select('jenis_kendaraan', DB::raw('count(*) as total'))
            ->groupBy('jenis_kendaraan')
            ->pluck('total', 'jenis_kendaraan')
            ->toArray();

        // Transaksi terbaru (5 terakhir)
        $transaksiTerbaru = Transaksi::with('areaParkir')
            ->orderBy('waktu_masuk', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($trx) {
                return [
                    'id' => $trx->id_transaksi,
                    'plat_nomor' => $trx->plat_nomor,
                    'jenis_kendaraan' => $trx->jenis_kendaraan,
                    'waktu_masuk' => $trx->waktu_masuk->format('H:i'),
                    'status' => $trx->status,
                    'area' => $trx->areaParkir?->nama_area ?? '-',
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalKapasitas' => $totalKapasitas,
                'totalTerisi' => $totalTerisi,
                'totalPendapatan' => $totalPendapatan,
                'totalTersedia' => $totalKapasitas - $totalTerisi,
                'transaksiHariIni' => $transaksiHariIni,
                'kendaraanParkir' => $kendaraanParkir,
                'motor' => $statistikKendaraan['motor'] ?? 0,
                'mobil' => $statistikKendaraan['mobil'] ?? 0,
            ],
            'areas' => $areas,
            'transaksiTerbaru' => $transaksiTerbaru,
        ]);
    }
}
