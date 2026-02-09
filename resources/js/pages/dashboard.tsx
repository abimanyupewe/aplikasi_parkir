import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Car, Bike, MapPin, TrendingUp, Users, Clock, ArrowRight, LogIn, Printer, Search, LogOut } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, SharedData } from '@/types';
import ReceiptTicket from '@/components/receipt-ticket';

// Interfaces
interface DashboardStats {
    totalKapasitas: number;
    totalTerisi: number;
    totalTersedia: number;
    transaksiHariIni: number;
    kendaraanParkir: number;
    motor: number;
    mobil: number;
}

interface AreaParkir {
    id_area: number;
    nama_area: string;
    kapasitas: number;
    terisi: number;
    tersedia: number;
    persentase: number;
}

interface TransaksiTerbaru {
    id: number;
    plat_nomor: string;
    jenis_kendaraan: 'motor' | 'mobil';
    waktu_masuk: string;
    status: string;
    area: string;
}

interface DashboardProps {
    stats: DashboardStats;
    areas: AreaParkir[];
    transaksiTerbaru: TransaksiTerbaru[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// --- Sub-components ---

function AdminDashboard({ stats, areas, transaksiTerbaru }: DashboardProps) {
    const overallPercentage = stats.totalKapasitas > 0
        ? Math.round((stats.totalTerisi / stats.totalKapasitas) * 100)
        : 0;

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Sistem Parkir Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Overview real-time status parkir hari ini
                    </p>
                </div>
                <Link href="/transaksi/masuk">
                    <Button className="gap-2">
                        <LogIn className="size-4" />
                        Parkir Masuk
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Kapasitas */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Kapasitas
                        </CardTitle>
                        <MapPin className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalKapasitas}</div>
                        <p className="text-xs text-muted-foreground">
                            slot parkir tersedia
                        </p>
                    </CardContent>
                </Card>

                {/* Kendaraan Parkir */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Kendaraan Parkir
                        </CardTitle>
                        <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.kendaraanParkir}</div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                                <Bike className="size-3" /> {stats.motor}
                            </span>
                            <span className="text-muted-foreground">|</span>
                            <span className="flex items-center gap-1">
                                <Car className="size-3" /> {stats.mobil}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Slot Tersedia */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Slot Tersedia
                        </CardTitle>
                        <TrendingUp className="size-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.totalTersedia}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            dari {stats.totalKapasitas} total slot
                        </p>
                    </CardContent>
                </Card>

                {/* Transaksi Hari Ini */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Transaksi Hari Ini
                        </CardTitle>
                        <Clock className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.transaksiHariIni}</div>
                        <p className="text-xs text-muted-foreground">kendaraan masuk</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Status Area Parkir */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="size-5 text-primary" />
                            Status Area Parkir
                        </CardTitle>
                        <CardDescription>
                            Kapasitas real-time setiap area parkir
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Overall Progress */}
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium">Kapasitas Total</span>
                                <span className="text-sm font-bold">
                                    {stats.totalTerisi} / {stats.totalKapasitas}
                                </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-secondary">
                                <div
                                    className={`h-full transition-all duration-500 ${overallPercentage >= 90
                                        ? 'bg-red-500'
                                        : overallPercentage >= 70
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                        }`}
                                    style={{ width: `${overallPercentage}%` }}
                                />
                            </div>
                            <p className="mt-1 text-right text-xs text-muted-foreground">
                                {overallPercentage}% terisi
                            </p>
                        </div>

                        {/* Per Area */}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {areas.map((area) => {
                                const statusColor =
                                    area.persentase >= 100
                                        ? 'border-red-500/50 bg-red-500/5'
                                        : area.persentase >= 80
                                            ? 'border-yellow-500/50 bg-yellow-500/5'
                                            : 'border-green-500/50 bg-green-500/5';

                                const barColor =
                                    area.persentase >= 100
                                        ? 'bg-red-500'
                                        : area.persentase >= 80
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500';

                                return (
                                    <div
                                        key={area.id_area}
                                        className={`rounded-lg border p-3 ${statusColor}`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-medium">{area.nama_area}</span>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    area.tersedia <= 0
                                                        ? 'border-red-500 text-red-500'
                                                        : area.tersedia <= 5
                                                            ? 'border-yellow-500 text-yellow-500'
                                                            : 'border-green-500 text-green-500'
                                                }
                                            >
                                                {area.tersedia} tersedia
                                            </Badge>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full transition-all ${barColor}`}
                                                style={{
                                                    width: `${Math.min(area.persentase, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {area.terisi} / {area.kapasitas} slot
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaksi Terbaru */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="size-5 text-primary" />
                                Transaksi Terbaru
                            </CardTitle>
                            <Link
                                href="/transaksi"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                Lihat Semua
                                <ArrowRight className="size-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {transaksiTerbaru.length > 0 ? (
                            <div className="space-y-3">
                                {transaksiTerbaru.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-full ${trx.jenis_kendaraan === 'motor'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-purple-500/10 text-purple-500'
                                                    }`}
                                            >
                                                {trx.jenis_kendaraan === 'motor' ? (
                                                    <Bike className="size-4" />
                                                ) : (
                                                    <Car className="size-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {trx.plat_nomor}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {trx.area}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{trx.waktu_masuk}</p>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    trx.status === 'masuk'
                                                        ? 'border-green-500 text-green-500'
                                                        : 'border-gray-500 text-gray-500'
                                                }
                                            >
                                                {trx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Car className="size-10 text-muted-foreground/50" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Belum ada transaksi hari ini
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PetugasDashboard({ stats, transaksiTerbaru }: DashboardProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        plat_nomor: '',
    });

    const handleCariStruk: FormEventHandler = (e) => {
        e.preventDefault();
        post('/cek-parkir', {
            preserveState: true,
            preserveScroll: true,
            onError: () => {
                // Error handling handled by Inertia (displays validation error)
            }
        });
    };

    // Check props from page (result could be there if redirected back)
    // Gunakan Type Assertion 'any' karena 'flash' mungkin belum di-declare lengkap
    const { flash } = usePage<any>().props;
    const result = flash?.result;

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Petugas</h1>
                <p className="text-muted-foreground text-sm">Mode Operasional</p>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Link href="/transaksi/masuk">
                    <Button className="h-24 w-full text-lg gap-3 hover:scale-[1.02] transition-transform" variant="default">
                        <div className="rounded-full bg-white/20 p-3"><LogIn className="size-8" /></div>
                        <div className="flex flex-col items-start">
                            <span className="font-bold">Parkir Masuk</span>
                            <span className="text-xs font-normal opacity-80">Input Kendaraan Baru</span>
                        </div>
                    </Button>
                </Link>
                <Link href="/transaksi">
                    <Button className="h-24 w-full text-lg gap-3 hover:scale-[1.02] transition-transform" variant="destructive">
                        <div className="rounded-full bg-white/20 p-3"><LogOut className="size-8" /></div>
                        <div className="flex flex-col items-start">
                            <span className="font-bold">Parkir Keluar</span>
                            <span className="text-xs font-normal opacity-80">Proses Checkout & Bayar</span>
                        </div>
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Section Cetak Struk */}
                <Card className="lg:col-span-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Printer className="size-5 text-primary" />
                            Cetak Struk / Cek Status
                        </CardTitle>
                        <CardDescription>
                            Cari transaksi berdasarkan plat nomor untuk mencetak struk.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCariStruk} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari Plat Nomor (Contoh: B 1234 XYZ)..."
                                    value={data.plat_nomor}
                                    onChange={e => setData('plat_nomor', e.target.value)}
                                    className="uppercase pl-9 bg-white"
                                />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Mencari...' : 'Cari'}
                            </Button>
                        </form>

                        {errors.plat_nomor && <p className="text-sm text-red-500 mt-2">{errors.plat_nomor}</p>}
                        {flash?.error && <p className="text-sm text-red-500 mt-2">{flash.error}</p>}

                        {/* Result Display */}
                        {result && (
                            <div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-top-2 bg-white p-6 rounded-lg border shadow-sm">
                                <ReceiptTicket data={result} className="shadow-md mb-4 border-dashed border-2" />
                                <div className="flex gap-2">
                                    <Button onClick={() => window.print()} variant="outline" className="gap-2">
                                        <Printer className="size-4" />
                                        Cetak Struk
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.get('/dashboard')}
                                        className="text-muted-foreground"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Transaksi Terkini */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Riwayat Terkini
                            <Link href="/transaksi" className="text-xs text-primary hover:underline">Lihat Semua</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {transaksiTerbaru.slice(0, 5).map((trx) => (
                            <div key={trx.id} className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 p-2 rounded transition-colors">
                                <div>
                                    <p className="font-bold text-sm">{trx.plat_nomor}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3" /> {trx.waktu_masuk}
                                    </p>
                                </div>
                                <Badge variant={trx.status === 'masuk' ? 'default' : 'secondary'} className="text-[10px] px-1 h-5">{trx.status}</Badge>
                            </div>
                        ))}
                        {transaksiTerbaru.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-4">Belum ada transaksi.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Main Component ---

export default function Dashboard({ stats, areas, transaksiTerbaru }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const role = (auth.user as any)?.role || 'user'; // Default user if role missing

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            {(role === 'petugas') ? (
                <PetugasDashboard stats={stats} areas={areas} transaksiTerbaru={transaksiTerbaru} />
            ) : (
                <AdminDashboard stats={stats} areas={areas} transaksiTerbaru={transaksiTerbaru} />
            )}
        </AppLayout>
    );
}
