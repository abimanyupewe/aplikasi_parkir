<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    /**
     * Menampilkan halaman cek status parkir untuk tamu/pengunjung.
     */
    public function index(): Response
    {
        return Inertia::render('guest/index');
    }

    /**
     * Mengecek status parkir berdasarkan plat nomor.
     */
    public function check(Request $request)
    {
        $request->validate([
            'plat_nomor' => 'required|string|max:15',
        ]);

        // Cari transaksi terakhir berdasarkan plat nomor
        // Prioritaskan yang masih status 'masuk', jika tidak ada, ambil yang terakhir keluar
        $transaksi = Transaksi::with('areaParkir')
            ->where('plat_nomor', 'like', '%' . $request->plat_nomor . '%')
            ->orderBy('id_transaksi', 'desc')
            ->first();

        if (!$transaksi) {
            return back()->with('error', 'Data kendaraan tidak ditemukan.');
        }

        // Kalkulasi durasi realtime jika masih parkir
        $biayaEstimasi = 0;
        $durasi = 0;

        if ($transaksi->status === 'masuk') {
            $start = \Carbon\Carbon::parse($transaksi->waktu_masuk);
            $end = now();
            $totalMenit = $start->diffInMinutes($end);

            // Hitung jam dan menit untuk display
            $jamDisplay = floor($totalMenit / 60);
            $menitDisplay = $totalMenit % 60;
            $durasiTeks = "{$jamDisplay} Jam {$menitDisplay} Menit";

            // Hitung durasi jam untuk billing (ceil)
            $durasiBilling = ceil($totalMenit / 60);
            $durasiBilling = max(1, $durasiBilling); // Minimal 1 jam

            $rate = ($transaksi->jenis_kendaraan === 'mobil') ? 5000 : 2000;
            $biayaEstimasi = $durasiBilling * $rate;
            $durasi = $durasiBilling; // Keep for billing variable
        } else {
            $biayaEstimasi = $transaksi->biaya;
            $start = \Carbon\Carbon::parse($transaksi->waktu_masuk);
            $end = \Carbon\Carbon::parse($transaksi->waktu_keluar);
            $totalMenit = $start->diffInMinutes($end);

            $jamDisplay = floor($totalMenit / 60);
            $menitDisplay = $totalMenit % 60;
            $durasiTeks = "{$jamDisplay} Jam {$menitDisplay} Menit";

            // Durasi billing
            $durasi = ceil($totalMenit / 60);
        }

        return back()->with([
            'success' => 'Data ditemukan.',
            'result' => [
                'kode_tiket' => $transaksi->kode_tiket,
                'plat_nomor' => $transaksi->plat_nomor,
                'jenis_kendaraan' => $transaksi->jenis_kendaraan,
                'waktu_masuk' => $transaksi->waktu_masuk,
                'waktu_keluar' => $transaksi->waktu_keluar,
                'status' => $transaksi->status,
                'area' => $transaksi->areaParkir?->nama_area,
                'durasi_jam' => $durasi,
                'durasi_teks' => $durasiTeks, // New field for display
                'biaya' => $biayaEstimasi,
            ]
        ]);
    }
}
