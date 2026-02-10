<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use App\Models\LogAktivitas;
use App\Models\Tarif;
use App\Models\Transaksi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk mengelola transaksi parkir.
 *
 * Menangani proses check-in (parkir masuk) dengan
 * concurrency control menggunakan pessimistic locking.
 */
class TransaksiController extends Controller
{
    /**
     * Menampilkan daftar semua transaksi parkir.
     *
     * @return Response
     */
    public function index(Request $request): Response
    {
        $transaksi = Transaksi::with('areaParkir')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('plat_nomor', 'like', "%{$search}%")
                        ->orWhere('kode_tiket', 'like', "%{$search}%");
                });
            })
            ->when($request->jenis_kendaraan, function ($query, $jenis) {
                $query->where('jenis_kendaraan', $jenis);
            })
            ->orderBy('status', 'asc') // Prioritaskan yang masih 'masuk'
            ->orderBy('waktu_masuk', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('transaksi/index', [
            'transaksi' => $transaksi,
            'filters' => $request->only(['search', 'jenis_kendaraan']),
        ]);
    }

    /**
     * Menampilkan form untuk check-in kendaraan baru.
     *
     * @return Response
     */
    public function create(): Response
    {
        $areas = AreaParkir::select('id_area', 'nama_area', 'kapasitas', 'terisi')
            ->get()
            ->map(function ($area) {
                return [
                    'id_area' => $area->id_area,
                    'nama_area' => $area->nama_area,
                    'kapasitas' => $area->kapasitas,
                    'terisi' => $area->terisi,
                    'tersedia' => $area->kapasitas - $area->terisi,
                ];
            });

        return Inertia::render('transaksi/create', [
            'areas' => $areas,
        ]);
    }

    /**
     * Proses Check-In Kendaraan (Parkir Masuk).
     *
     * Method ini menggunakan database transaction dengan pessimistic locking
     * (`lockForUpdate`) untuk mencegah race condition pada skenario
     * high-concurrency (banyak kendaraan masuk bersamaan).
     *
     * Flow:
     * 1. Validasi input (plat_nomor, jenis_kendaraan)
     * 2. Lock row area parkir untuk mencegah concurrent modification
     * 3. Cek kapasitas parkir
     * 4. Insert transaksi baru jika kapasitas tersedia
     * 5. Increment kolom `terisi` pada area parkir
     *
     * @param  Request  $request
     * @return RedirectResponse
     *
     * @throws ValidationException Jika area parkir penuh
     */
    public function store(Request $request): RedirectResponse
    {
        // Step 1: Validasi input
        $validated = $request->validate([
            'plat_nomor' => ['required', 'string', 'max:15'],
            'jenis_kendaraan' => ['required', Rule::in(['motor', 'mobil'])],
            'id_area' => ['required', 'integer', 'exists:tb_area_parkir,id_area'],
        ]);

        // Step 2: Database Transaction dengan Pessimistic Locking
        DB::transaction(function () use ($validated) {
            // Acquire exclusive lock pada row area parkir
            // Ini mencegah race condition dengan blocking concurrent reads/writes
            $area = AreaParkir::where('id_area', $validated['id_area'])
                ->lockForUpdate()
                ->firstOrFail();

            // Step 3: Cek kapasitas parkir
            if ($area->terisi >= $area->kapasitas) {
                throw ValidationException::withMessages([
                    'kapasitas' => 'Area Parkir Penuh!',
                ]);
            }

            // Step 4: Insert transaksi baru
            $kodeTiket = strtoupper(\Illuminate\Support\Str::random(10));
            // Ensure uniqueness (simple retry logic could be added here if needed, but 10 chars is robust)

            Transaksi::create([
                'kode_tiket' => $kodeTiket,
                'plat_nomor' => strtoupper($validated['plat_nomor']),
                'jenis_kendaraan' => $validated['jenis_kendaraan'],
                'waktu_masuk' => now(),
                'status' => 'masuk',
                'id_area' => $validated['id_area'],
            ]);

            // Step 5: Increment jumlah kendaraan yang terisi
            $area->increment('terisi');

            // Step 5b: Log Aktivitas
            LogAktivitas::create([
                'id_user' => auth()->id(),
                'aksi' => 'Check-In',
                'deskripsi' => "Check-in kendaraan {$validated['plat_nomor']} ({$validated['jenis_kendaraan']}) di area {$area->nama_area}. Tiket: {$kodeTiket}",
            ]);
        });

        // Step 6: Return redirect dengan flash message
        return redirect()
            ->route('transaksi.create')
            ->with('success', 'Kendaraan berhasil masuk parkir.');
    }
    /**
     * Proses Check-Out Kendaraan (Parkir Keluar).
     *
     * Menghitung biaya parkir berdasarkan durasi, mengupdate status transaksi,
     * dan mengurangi counter kapasitas area parkir.
     *
     * @param  Request  $request
     * @param  Transaksi  $transaksi
     * @return RedirectResponse
     */
    public function checkout(Request $request, Transaksi $transaksi): RedirectResponse
    {
        // Validasi state: Pastikan kendaraan belum keluar
        if ($transaksi->status === 'keluar') {
            return back()->with('error', 'Kendaraan ini sudah keluar.');
        }

        DB::transaction(function () use ($transaksi) {
            // Lock record transaksi untuk mencegah double checkout
            // Gunakan variabel berbeda untuk lock agar tidak membingungkan scope
            $lockedTransaksi = Transaksi::where('id_transaksi', $transaksi->id_transaksi)
                ->lockForUpdate()
                ->firstOrFail();

            // Double check status setelah lock
            if ($lockedTransaksi->status === 'keluar') {
                return; // Sudah diproses thread lain
            }

            // Hitung Durasi (Pembulatan ke atas per jam)
            // Default timestamp Laravel sudah dicasting ke Carbon (jika di $dates atau casts), 
            // tapi safety check parse manual tidak ada salahnya.
            $start = \Carbon\Carbon::parse($lockedTransaksi->waktu_masuk);
            $end = now();

            // Hitung selisih dalam jam (ceil)
            // Contoh 1 jam 5 menit -> 1.08 -> ceil jadi 2 jam
            $minutes = $start->diffInMinutes($end);
            $durasiJam = ceil($minutes / 60);

            // Minimal 1 jam
            $durasiJam = max(1, $durasiJam);

            // Hitung Biaya
            // Ambil tarif dari database berdasarkan jenis kendaraan
            $tarif = Tarif::where('jenis_kendaraan', $lockedTransaksi->jenis_kendaraan)->first();
            // Fallback jika tidak ada data tarif (defensive programming)
            $tarifPerJam = $tarif ? $tarif->tarif_per_jam : ($lockedTransaksi->jenis_kendaraan === 'mobil' ? 5000 : 2000);

            $totalBiaya = $durasiJam * $tarifPerJam;

            // Update Transaksi
            $lockedTransaksi->update([
                'waktu_keluar' => $end,
                'biaya' => $totalBiaya,
                'status' => 'keluar',
            ]);

            // Decrement Area Parkir
            $area = AreaParkir::where('id_area', $lockedTransaksi->id_area)
                ->lockForUpdate()
                ->first();

            if ($area && $area->terisi > 0) {
                $area->decrement('terisi');
            }

            // Log Aktivitas Check-Out
            LogAktivitas::create([
                'id_user' => auth()->id(),
                'aksi' => 'Check-Out',
                'deskripsi' => "Check-out kendaraan {$lockedTransaksi->plat_nomor}. Durasi: {$durasiJam} jam. Biaya: Rp {$totalBiaya}",
            ]);
        });

        // Refresh model instance untuk mendapatkan data terbaru dari DB (biaya, waktu_keluar)
        $transaksi->refresh();

        // Cek jika status gagal berubah (race condition handled inside transaction but here we check result)
        if ($transaksi->status !== 'keluar') {
            return back()->with('error', 'Gagal memproses check-out atau sudah diproses.');
        }

        return back()->with('success', 'Check-out berhasil. Biaya: Rp ' . number_format($transaksi->biaya, 0, ',', '.'));
    }
}
