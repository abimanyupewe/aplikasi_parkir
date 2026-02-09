<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model untuk mengelola data area parkir.
 *
 * @property int $id_area
 * @property int $kapasitas
 * @property int $terisi
 */
class AreaParkir extends Model
{
    /**
     * Nama tabel yang sesuai dengan referensi database.
     */
    protected $table = 'tb_area_parkir';

    /**
     * Primary key tabel.
     */
    protected $primaryKey = 'id_area';

    /**
     * Kolom yang dapat diisi secara massal.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nama_area',
        'kapasitas',
        'terisi',
    ];

    /**
     * Relasi: Satu area parkir memiliki banyak transaksi.
     */
    public function transaksi(): HasMany
    {
        return $this->hasMany(Transaksi::class, 'id_area', 'id_area');
    }
}
