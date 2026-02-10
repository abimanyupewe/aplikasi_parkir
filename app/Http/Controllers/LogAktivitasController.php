<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LogAktivitasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $logs = LogAktivitas::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('log-aktivitas/index', [
            'logs' => $logs,
        ]);
    }

    /**
     * Export logs to CSV.
     */
    public function export(): StreamedResponse
    {
        $fileName = 'log_aktivitas_' . date('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');

            // Header
            fputcsv($handle, ['ID', 'User', 'Aksi', 'Deskripsi', 'Waktu']);

            // Data (using cursor to minimize memory usage for large datasets)
            LogAktivitas::with('user')->orderBy('created_at', 'desc')->chunk(100, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->id_log,
                        $log->user ? $log->user->name : 'System',
                        $log->aksi,
                        $log->deskripsi,
                        $log->created_at,
                    ]);
                }
            });

            fclose($handle);
        }, $fileName);
    }
}
