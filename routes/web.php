<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\GuestController;
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

        // Approve user (hanya owner, tapi di sini owner+admin bisa akses page, admin mungkin restricted di controller level?)
        // User request: "buat untuk petugas dan admin baru (register) baru terdaftar menunggu aproval dari owner"
        // Jadi approval action sebaiknya hanya Owner? Atau admin boleh?
        // "menunggu aproval dari owner" -> implied only owner. I'll restriction approval to owner ONLY.

        // Action Approve
        Route::post('/users/{user}/approve', [UserController::class, 'approve'])
            ->name('users.approve')
            ->middleware('role:owner'); // STRICTLY OWNER

        // Hapus user
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');
    });
});

require __DIR__ . '/settings.php';


