import { Car, Bike, MapPin, Clock } from 'lucide-react';

interface ReceiptTicketProps {
    data: {
        plat_nomor: string;
        kode_tiket?: string;
        jenis_kendaraan: 'motor' | 'mobil' | string;
        waktu_masuk: string;
        waktu_keluar?: string | null;
        durasi_jam?: number;
        durasi_teks?: string; // New field
        biaya?: number | null;
        area?: string;
        status: string;
    };
    className?: string;
}



export default function ReceiptTicket({ data, className = '' }: ReceiptTicketProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`w-full max-w-[300px] border-2 border-dashed border-zinc-300 bg-white p-6 font-mono text-sm text-black print:fixed print:top-0 print:left-0 print:w-full print:h-full print:z-50 print:border-none print:max-w-none print:flex print:flex-col print:items-center print:justify-start print:pt-4 ${className}`}>
            <div className="mb-4 text-center">
                <h3 className="text-lg font-bold uppercase tracking-widest text-black">PARKIR APP</h3>
                <p className="text-xs text-zinc-500">Tiket Parkir Resmi</p>
                {data.kode_tiket && (
                    <div className="mt-2 border-y-2 border-dashed border-zinc-300 py-2">
                        <p className="text-xs text-zinc-500 mb-1">KODE TIKET</p>
                        <p className="font-mono text-xl font-bold tracking-widest text-black">{data.kode_tiket}</p>
                    </div>
                )}
            </div>

            <div className="mb-4 flex flex-col items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-black text-white shadow-sm">
                    {data.jenis_kendaraan === 'motor' ? (
                        <Bike className="size-8" />
                    ) : (
                        <Car className="size-8" />
                    )}
                </div>
                <p className="mt-2 text-sm font-bold uppercase tracking-wider text-zinc-600">
                    {data.jenis_kendaraan}
                </p>
            </div>

            <div className="space-y-3 border-y-2 border-dashed border-zinc-300 py-4">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">Plat Nomor</span>
                    <span className="font-bold text-lg text-black">{data.plat_nomor}</span>
                </div>
                {data.area && (
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs uppercase tracking-wide">Area</span>
                        <span className="font-bold text-black">{data.area}</span>
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">Masuk</span>
                    <span className="font-bold text-black text-right">{formatDate(data.waktu_masuk)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs uppercase tracking-wide">Tarif</span>
                    <span className="font-bold text-black">
                        Rp {data.jenis_kendaraan === 'mobil' ? '5.000' : '2.000'} / Jam
                    </span>
                </div>
                {data.waktu_keluar && (
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs uppercase tracking-wide">Keluar</span>
                        <span className="font-bold text-black text-right">{formatDate(data.waktu_keluar)}</span>
                    </div>
                )}
                {(data.durasi_teks) ? (
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-xs uppercase tracking-wide">Durasi</span>
                        <span className="font-bold text-black">{data.durasi_teks}</span>
                    </div>
                ) : (
                    (data.durasi_jam || 0) > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-500 text-xs uppercase tracking-wide">Durasi</span>
                            <span className="font-bold text-black">{data.durasi_jam} Jam</span>
                        </div>
                    )
                )}
            </div>

            <div className="mt-6 text-center">
                {data.status === 'keluar' ? (
                    <div className="rounded bg-black py-4 text-white print:bg-white print:text-black border-2 border-black">
                        <p className="text-[10px] uppercase opacity-80 tracking-widest mb-1">Total Biaya Parkir</p>
                        <p className="text-xs opacity-70 mb-2 border-b border-white/20 pb-2 mx-4 border-dashed">
                            {data.durasi_jam} Jam (Bulat) x Rp {(data.jenis_kendaraan === 'mobil' ? 5000 : 2000).toLocaleString('id-ID')}
                        </p>
                        <p className="text-3xl font-black tracking-tight">
                            Rp {(data.biaya || 0).toLocaleString('id-ID')}
                        </p>
                        <div className="mt-3 inline-block rounded border border-white/30 px-3 py-1">
                            <p className="text-[10px] font-bold tracking-[0.2em]">LUNAS</p>
                        </div>
                    </div>
                ) : (
                    <div className="rounded bg-zinc-50 py-4 border-2 border-zinc-200">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Estimasi Biaya</p>
                        <p className="text-xs text-zinc-500 mb-2 border-b border-zinc-200 pb-2 mx-4 border-dashed">
                            {data.durasi_jam} Jam (Bulat) x Rp {(data.jenis_kendaraan === 'mobil' ? 5000 : 2000).toLocaleString('id-ID')}
                        </p>
                        <p className="text-3xl font-black text-zinc-900">
                            Rp {(data.biaya || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[10px] text-red-600 mt-2 font-bold uppercase tracking-wide">*Belum Checkout</p>
                    </div>
                )}
            </div>

            <div className="mt-6 text-center text-[10px] text-muted-foreground">
                <p>Simpan struk ini sebagai bukti parkir.</p>
                <p>Kehilangan struk dikenakan denda.</p>
                <p className="mt-2 text-xs font-bold">{new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
}
