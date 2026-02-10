<?php

namespace App\Http\Controllers;

use App\Models\AreaParkir;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AreaParkirController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $areas = AreaParkir::all();
        return Inertia::render('area-parkir/index', [
            'areas' => $areas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_area' => 'required|string|max:50',
            'kapasitas' => 'required|integer|min:1',
        ]);

        AreaParkir::create($validated);

        return redirect()->back()->with('success', 'Area parkir berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AreaParkir $areaParkir): RedirectResponse
    {
        $validated = $request->validate([
            'nama_area' => 'required|string|max:50',
            'kapasitas' => 'required|integer|min:1',
        ]);

        $areaParkir->update($validated);

        return redirect()->back()->with('success', 'Area parkir berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AreaParkir $areaParkir): RedirectResponse
    {
        if ($areaParkir->terisi > 0) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus area yang sedang digunakan.');
        }

        $areaParkir->delete();

        return redirect()->back()->with('success', 'Area parkir berhasil dihapus.');
    }
}
