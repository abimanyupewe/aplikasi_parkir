<?php

namespace App\Http\Controllers;

use App\Models\Tarif;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TarifController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tarif = Tarif::all();

        return Inertia::render('tarif/index', [
            'tarif' => $tarif,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'jenis_kendaraan' => 'required|string|unique:tb_tarif,jenis_kendaraan',
            'tarif_per_jam' => 'required|integer|min:0',
        ]);

        Tarif::create($validated);

        return redirect()->back()->with('success', 'Jenis kendaraan dan tarif berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tarif $tarif): RedirectResponse
    {
        $validated = $request->validate([
            'tarif_per_jam' => 'required|integer|min:0',
        ]);

        $tarif->update($validated);

        return redirect()->back()->with('success', 'Tarif berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tarif $tarif): RedirectResponse
    {
        $tarif->delete();

        return redirect()->back()->with('success', 'Tarif berhasil dihapus.');
    }
}
