<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder untuk membuat akun Owner default.
 * 
 * Owner hanya ada 1 dan dibuat via seeder.
 * Admin dan Petugas akan membuat akun sendiri via register.
 */
class UserSeeder extends Seeder
{
    /**
     * Jalankan seeder untuk membuat user owner.
     */
    public function run(): void
    {
        // Owner - hanya 1 dan dibuat via seeder
        User::updateOrCreate(
            ['email' => 'owner@parkir.com'],
            [
                'name' => 'Owner Parkir',
                'password' => Hash::make('password'),
                'role' => User::ROLE_OWNER,
                'email_verified_at' => now(),
                'is_approved' => true,
            ]
        );
    }
}

