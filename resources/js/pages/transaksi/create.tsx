import { Head, useForm, usePage } from '@inertiajs/react';
import { Car, Bike, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * Interface untuk data Area Parkir dari backend.
 */
interface AreaParkir {
    id_area: number;
    nama_area: string;
    kapasitas: number;
    terisi: number;
    tersedia: number;
}

/**
 * Props yang dikirim dari controller.
 */
interface CreateProps {
    areas: AreaParkir[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Parkir Masuk', href: '/transaksi/masuk' },
];

/**
 * Halaman Form Check-In Kendaraan (Parkir Masuk).
 *
 * Menggunakan Inertia.js useForm untuk handling form submission
 * dengan client-side validation dan server-side error handling.
 */
export default function Create({ areas }: CreateProps) {
    const { flash } = usePage<SharedData>().props;
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        plat_nomor: '',
        jenis_kendaraan: '',
        id_area: '',
    });

    // Handle flash message success
    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            reset();
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    /**
     * Handler untuk submit form check-in.
     */
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/transaksi');
    };

    /**
     * Mendapatkan icon berdasarkan jenis kendaraan.
     */
    const getVehicleIcon = (type: string) => {
        switch (type) {
            case 'motor':
                return <Bike className="size-5" />;
            case 'mobil':
                return <Car className="size-5" />;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parkir Masuk" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Success Alert */}
                {showSuccess && (
                    <div className="animate-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <p className="font-medium">{flash?.success}</p>
                    </div>
                )}

                {/* Error Alert untuk kapasitas penuh */}
                {(errors as Record<string, string>).kapasitas && (
                    <div className="animate-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
                        <AlertCircle className="size-5 shrink-0" />
                        <p className="font-medium">{(errors as Record<string, string>).kapasitas}</p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Car className="size-6 text-primary" />
                                Form Parkir Masuk
                            </CardTitle>
                            <CardDescription>
                                Masukkan data kendaraan untuk proses check-in parkir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Plat Nomor */}
                                <div className="space-y-2">
                                    <Label htmlFor="plat_nomor">
                                        Plat Nomor <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="plat_nomor"
                                        type="text"
                                        placeholder="Contoh: B 1234 XYZ"
                                        value={data.plat_nomor}
                                        onChange={(e) =>
                                            setData('plat_nomor', e.target.value.toUpperCase())
                                        }
                                        maxLength={15}
                                        className="uppercase"
                                        autoFocus
                                    />
                                    <InputError message={errors.plat_nomor} />
                                </div>

                                {/* Jenis Kendaraan */}
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kendaraan">
                                        Jenis Kendaraan <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.jenis_kendaraan}
                                        onValueChange={(value) => setData('jenis_kendaraan', value)}
                                    >
                                        <SelectTrigger id="jenis_kendaraan">
                                            <SelectValue placeholder="Pilih jenis kendaraan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="motor">
                                                <div className="flex items-center gap-2">
                                                    <Bike className="size-4" />
                                                    Motor
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="mobil">
                                                <div className="flex items-center gap-2">
                                                    <Car className="size-4" />
                                                    Mobil
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.jenis_kendaraan} />
                                </div>

                                {/* Area Parkir */}
                                <div className="space-y-2">
                                    <Label htmlFor="id_area">
                                        Area Parkir <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.id_area}
                                        onValueChange={(value) => setData('id_area', value)}
                                    >
                                        <SelectTrigger id="id_area">
                                            <SelectValue placeholder="Pilih area parkir" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem
                                                    key={area.id_area}
                                                    value={String(area.id_area)}
                                                    disabled={area.tersedia <= 0}
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span>{area.nama_area}</span>
                                                        <span
                                                            className={`text-xs ${area.tersedia <= 0
                                                                    ? 'text-red-500'
                                                                    : area.tersedia <= 5
                                                                        ? 'text-yellow-500'
                                                                        : 'text-green-500'
                                                                }`}
                                                        >
                                                            ({area.tersedia} slot tersedia)
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.id_area} />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Memproses...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4" />
                                            Check-In Kendaraan
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Status Area Parkir */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="size-5 text-primary" />
                                Status Area Parkir
                            </CardTitle>
                            <CardDescription>
                                Kapasitas real-time setiap area.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {areas.map((area) => {
                                const percentage = (area.terisi / area.kapasitas) * 100;
                                const statusColor =
                                    percentage >= 100
                                        ? 'bg-red-500'
                                        : percentage >= 80
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500';

                                return (
                                    <div key={area.id_area} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{area.nama_area}</span>
                                            <span className="text-muted-foreground">
                                                {area.terisi}/{area.kapasitas}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className={`h-full transition-all duration-500 ${statusColor}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Preview Card */}
                {data.plat_nomor && data.jenis_kendaraan && (
                    <Card className="animate-in fade-in-50 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Preview Data Kendaraan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    {getVehicleIcon(data.jenis_kendaraan)}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold tracking-wider">
                                        {data.plat_nomor || '-'}
                                    </p>
                                    <p className="text-muted-foreground capitalize">
                                        {data.jenis_kendaraan || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
