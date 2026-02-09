<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model untuk mengelola data transaksi parkir.
 *
 * @property int $id_transaksi
 * @property string $plat_nomor
 * @property string $jenis_kendaraan
 * @property \DateTime $waktu_masuk
 * @property string $status
 * @property int $id_area
 */
class Transaksi extends Model
{
    /**
     * Nama tabel yang sesuai dengan referensi database.
     */
    protected $table = 'tb_transaksi';

    /**
     * Primary key tabel.
     */
    protected $primaryKey = 'id_transaksi';

    /**
     * Kolom yang dapat diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kode_tiket',
        'plat_nomor',
        'jenis_kendaraan',
        'waktu_masuk',
        'waktu_keluar',
        'status',
        'id_area',
        'biaya',
    ];

    /**
     * Cast attributes ke tipe data yang sesuai.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'waktu_masuk' => 'datetime',
    ];

    /**
     * Relasi: Transaksi dimiliki oleh satu area parkir.
     */
    public function areaParkir(): BelongsTo
    {
        return $this->belongsTo(AreaParkir::class, 'id_area', 'id_area');
    }
}
