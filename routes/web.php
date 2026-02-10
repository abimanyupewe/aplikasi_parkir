<?php

use App\Http\Controllers\AreaParkirController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\LogAktivitasController;
use App\Http\Controllers\TarifController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Halaman Publik (Guest Mode)
Route::get('/cek-parkir', [GuestController::class, 'index'])->name('guest.index');
Route::post('/cek-parkir', [GuestController::class, 'check'])->name('guest.check');

// Halaman yang membutuhkan login dan approval
Route::middleware(['auth', 'verified', 'approved'])->group(function () {

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // ========================================
    // Routes untuk Transaksi Parkir
    // ========================================

    // Daftar transaksi - semua role (Owner, Admin, Petugas)
    Route::get('/transaksi', [TransaksiController::class, 'index'])
        ->name('transaksi.index');

    // Input & Checkout Transaksi - hanya Admin & Petugas (Owner monitoring saja)
    Route::middleware(['role:admin,petugas'])->group(function () {
        Route::get('/transaksi/masuk', [TransaksiController::class, 'create'])
            ->name('transaksi.create');

        Route::post('/transaksi', [TransaksiController::class, 'store'])
            ->name('transaksi.store');

        // Parkir Keluar (Checkout)
        Route::post('/transaksi/{transaksi}/keluar', [TransaksiController::class, 'checkout'])
            ->name('transaksi.checkout');
    });

    // ========================================
    // Routes untuk Kelola User (Owner & Admin only)
    // ========================================
    Route::middleware(['role:owner,admin'])->group(function () {
        // Daftar semua user (admin & petugas)
        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');

        // CRUD Area Parkir
        Route::resource('area-parkir', AreaParkirController::class);

        // CRUD Kendaraan
        Route::resource('kendaraan', KendaraanController::class);

        // CRUD Tarif
        Route::resource('tarif', TarifController::class);

        // Approve user (hanya owner)
        Route::post('/users/{user}/approve', [UserController::class, 'approve'])
            ->name('users.approve')
            ->middleware('role:owner'); // STRICTLY OWNER

        // Hapus user
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');
    });

    // Log Aktivitas (Owner, Admin, Petugas)
    Route::middleware(['role:owner,admin,petugas'])->group(function () {
        Route::get('/log-aktivitas', [LogAktivitasController::class, 'index'])->name('log-aktivitas.index');
        Route::get('/log-aktivitas/export', [LogAktivitasController::class, 'export'])->name('log-aktivitas.export');
    });
});

require __DIR__ . '/settings.php';


