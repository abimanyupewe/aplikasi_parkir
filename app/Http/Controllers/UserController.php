<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk mengelola data user (Admin & Petugas).
 * 
 * Hanya bisa diakses oleh Owner dan Admin.
 */
class UserController extends Controller
{
    /**
     * Menampilkan daftar semua user (admin & petugas).
     *
     * @return Response
     */
    public function index(): Response
    {
        $query = User::where('role', '!=', User::ROLE_OWNER);

        // Jika bukan Owner (berarti Admin), hanya bisa melihat Petugas
        if (!auth()->user()->isOwner()) {
            $query->where('role', 'petugas');
        }

        $users = $query->orderBy('is_approved') // Pending dulu
            ->orderBy('role')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_approved' => $user->is_approved, // Tambahkan is_approved
                    'created_at' => $user->created_at->format('d M Y'),
                ];
            });

        // Hitung statistik
        $stats = [
            'total' => $users->count(),
            'admin' => $users->where('role', 'admin')->count(),
            'petugas' => $users->where('role', 'petugas')->count(),
            'pending' => $users->where('is_approved', false)->count(), // Stats pending
        ];

        return Inertia::render('users/index', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    /**
     * Menyetujui user bar (Set is_approved = true).
     * 
     * @param User $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approve(User $user)
    {
        $user->is_approved = true;
        $user->save();

        return back()->with('success', 'User berhasil disetujui.');
    }

    /**
     * Menghapus user (soft delete atau hard delete).
     *
     * @param User $user
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(User $user)
    {
        // Pastikan tidak bisa hapus owner
        if ($user->isOwner()) {
            return back()->with('error', 'Tidak dapat menghapus akun Owner.');
        }

        // Admin hanya boleh menghapus Petugas
        if (!auth()->user()->isOwner() && $user->role !== 'petugas') {
            return back()->with('error', 'Anda hanya diizinkan mengelola akun Petugas.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
