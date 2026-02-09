import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, Bike, Clock, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * Interface untuk data Transaksi dari backend.
 */
interface Transaksi {
    id_transaksi: number;
    kode_tiket: string; // New field
    plat_nomor: string;
    jenis_kendaraan: 'motor' | 'mobil';
    waktu_masuk: string;
    waktu_keluar: string | null;
    status: 'masuk' | 'keluar';
    biaya: number | null;
    area_parkir: {
        id_area: number;
        nama_area: string;
    } | null;
}

/**
 * Interface untuk data pagination dari Laravel.
 */
interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

/**
 * Props yang dikirim dari controller.
 */
interface IndexProps {
    transaksi: PaginatedData<Transaksi>;
    filters: {
        search?: string;
        jenis_kendaraan?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Transaksi', href: '/transaksi' },
];

export default function Index({ transaksi, filters = {} }: IndexProps) {
    const { flash } = usePage<SharedData>().props;

    // State initialized from props
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedTx, setSelectedTx] = useState<Transaksi | null>(null);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [processing, setProcessing] = useState(false);

    // Format Date Helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Server-side filtering handler using debounce
    // Note: strict debounce implementation might need lodash or custom hook, 
    // but here we can just use simple enter key or onBlur for search, and onChange for Select.
    // For simplicity and standard Inertia pattern, we can use a useEffect with delay,
    // or just trigger on Enter for search. Let's use Enter or Search Button.
    // Or better: Update params on change with delay.

    // For now, let's use a function to trigger search
    const doSearch = (term: string, type?: string) => {
        router.get(
            '/transaksi',
            {
                search: term,
                jenis_kendaraan: type ?? filters?.jenis_kendaraan
            },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true
            }
        );
    };

    // No client-side filtering
    const dataDisplay = transaksi.data;

    /**
     * Handle klik tombol keluar.
     * Menghitung estimasi biaya dan membuka modal.
     */
    const handleCheckoutClick = (tx: Transaksi) => {
        const start = new Date(tx.waktu_masuk);
        const end = new Date();
        const diffMs = end.getTime() - start.getTime();
        // Hitung selisih jam (ceil)
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const hours = Math.max(1, diffHours);

        const rate = tx.jenis_kendaraan === 'mobil' ? 5000 : 2000;
        setEstimatedCost(hours * rate);

        setSelectedTx(tx);
        setIsCheckoutModalOpen(true);
    };

    /**
     * Konfirmasi checkout.
     */
    const confirmCheckout = () => {
        if (!selectedTx) return;

        setProcessing(true);
        router.post(`/transaksi/${selectedTx.id_transaksi}/keluar`, {}, {
            onFinish: () => {
                setProcessing(false);
                setIsCheckoutModalOpen(false);
                setSelectedTx(null);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Transaksi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Transaksi</h1>
                        <p className="text-muted-foreground">
                            Total {transaksi.total} transaksi tercatat
                        </p>
                    </div>
                    <Link href="/transaksi/masuk">
                        <Button className="gap-2">
                            <Plus className="size-4" />
                            Parkir Masuk
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-end sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari Plat / Kode..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    // Trigger search on Enter
                                    router.get('/transaksi',
                                        { search: searchQuery, jenis_kendaraan: filters?.jenis_kendaraan },
                                        { preserveState: true, replace: true, preserveScroll: true }
                                    );
                                }
                            }}
                        />
                    </div>

                    <div className="w-full sm:w-[180px]">
                        <Select
                            value={filters?.jenis_kendaraan || "all"}
                            onValueChange={(value) => {
                                router.get('/transaksi',
                                    { search: searchQuery, jenis_kendaraan: value === "all" ? undefined : value },
                                    { preserveState: true, replace: true, preserveScroll: true }
                                );
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                <SelectItem value="motor">Motor</SelectItem>
                                <SelectItem value="mobil">Mobil</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button variant="secondary" onClick={() => {
                        router.get('/transaksi',
                            { search: searchQuery, jenis_kendaraan: filters?.jenis_kendaraan },
                            { preserveState: true, replace: true, preserveScroll: true }
                        );
                    }}>
                        Cari
                    </Button>
                </div>

                {/* Transaksi Grid */}
                {dataDisplay.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dataDisplay.map((item) => (
                            <Card
                                key={item.id_transaksi}
                                className="group transition-all hover:border-primary/50 hover:shadow-md"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-10 items-center justify-center rounded-full ${item.jenis_kendaraan === 'motor'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-purple-500/10 text-purple-500'
                                                    }`}
                                            >
                                                {item.jenis_kendaraan === 'motor' ? (
                                                    <Bike className="size-5" />
                                                ) : (
                                                    <Car className="size-5" />
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg tracking-wider">
                                                    {item.plat_nomor}
                                                </CardTitle>
                                                <div className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit mt-1">
                                                    {item.kode_tiket}
                                                </div>
                                                <CardDescription className="capitalize mt-1">
                                                    {item.jenis_kendaraan}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                item.status === 'masuk' ? 'default' : 'secondary'
                                            }
                                            className={
                                                item.status === 'masuk'
                                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-600'
                                            }
                                        >
                                            {item.status === 'masuk' ? 'Parkir' : 'Keluar'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="size-4" />
                                        <span>Masuk: {formatDate(item.waktu_masuk)}</span>
                                    </div>
                                    {item.area_parkir && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="size-4" />
                                            <span>{item.area_parkir.nama_area}</span>
                                        </div>
                                    )}
                                    {item.biaya !== null && (
                                        <div className="pt-2 border-t">
                                            <span className="font-semibold text-primary">
                                                Rp {item.biaya.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tombol Keluar untuk status Masuk */}
                                    {item.status === 'masuk' && (
                                        <div className="pt-2">
                                            <Button
                                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                                                size="sm"
                                                onClick={() => handleCheckoutClick(item)}
                                            >
                                                Keluar & Bayar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-12">
                        <Car className="size-12 text-muted-foreground/50" />
                        <p className="mt-4 text-lg font-medium text-muted-foreground">
                            Tidak ada transaksi ditemukan
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery
                                ? 'Coba ubah kata kunci pencarian'
                                : 'Belum ada kendaraan yang masuk'}
                        </p>
                    </Card>
                )}

                {/* Pagination */}
                {transaksi.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {transaksi.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded-md px-3 py-2 text-sm transition-colors ${link.active
                                    ? 'bg-primary text-primary-foreground'
                                    : link.url
                                        ? 'hover:bg-muted'
                                        : 'cursor-not-allowed opacity-50'
                                    }`}
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Konfirmasi Checkout */}
            <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Parkir Keluar</DialogTitle>
                        <DialogDescription>
                            Pastikan kendaraan dan biaya sudah sesuai sebelum memproses.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">Plat Nomor</Label>
                                <span className="col-span-3 font-semibold text-lg">{selectedTx.plat_nomor}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">Kendaraan</Label>
                                <span className="col-span-3 capitalize">{selectedTx.jenis_kendaraan}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">Masuk</Label>
                                <span className="col-span-3">{formatDate(selectedTx.waktu_masuk)}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-muted-foreground">Estimasi</Label>
                                <span className="col-span-3 font-bold text-xl text-primary">
                                    Rp {estimatedCost.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCheckoutModalOpen(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button onClick={confirmCheckout} disabled={processing} className="bg-red-600 hover:bg-red-700">
                            {processing ? 'Memproses...' : 'Konfirmasi Keluar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
