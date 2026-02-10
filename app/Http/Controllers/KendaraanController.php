<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class KendaraanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $kendaraan = Kendaraan::with('user')
            ->when($request->search, function ($query, $search) {
                $query->where('plat_nomor', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('kendaraan/index', [
            'kendaraan' => $kendaraan,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plat_nomor' => 'required|string|max:20|unique:tb_kendaraan,plat_nomor',
            'jenis_kendaraan' => ['required', Rule::in(['motor', 'mobil'])],
            'id_user' => 'nullable|exists:users,id',
        ]);

        Kendaraan::create($validated);

        return redirect()->back()->with('success', 'Data kendaraan berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kendaraan $kendaraan): RedirectResponse
    {
        $validated = $request->validate([
            'plat_nomor' => ['required', 'string', 'max:20', Rule::unique('tb_kendaraan')->ignore($kendaraan->id_kendaraan, 'id_kendaraan')],
            'jenis_kendaraan' => ['required', Rule::in(['motor', 'mobil'])],
            'id_user' => 'nullable|exists:users,id',
        ]);

        $kendaraan->update($validated);

        return redirect()->back()->with('success', 'Data kendaraan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kendaraan $kendaraan): RedirectResponse
    {
        $kendaraan->delete();

        return redirect()->back()->with('success', 'Data kendaraan berhasil dihapus.');
    }
}
