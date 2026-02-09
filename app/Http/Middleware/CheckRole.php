<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk mengecek role user.
 *
 * Usage di route:
 * - Single role: Route::middleware('role:admin')
 * - Multiple roles: Route::middleware('role:owner,admin')
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Daftar role yang diizinkan
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Cek apakah user memiliki salah satu role yang diizinkan
        if (!$request->user()->hasRole($roles)) {
            // Jika akses via Inertia, redirect dengan flash message
            if ($request->header('X-Inertia')) {
                return redirect()
                    ->back()
                    ->with('error', 'Anda tidak memiliki akses ke halaman ini.');
            }

            // Response untuk non-Inertia request
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}

