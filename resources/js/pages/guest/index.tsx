import { Head, useForm, usePage } from '@inertiajs/react';
import { Loader2, Search, Printer, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

import ReceiptTicket from '@/components/receipt-ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import type { SharedData } from '@/types';

interface GuestIndexProps {
    result?: {
        plat_nomor: string;
        jenis_kendaraan: 'motor' | 'mobil';
        waktu_masuk: string;
        waktu_keluar?: string | null;
        status: string;
        area?: string;
        durasi_jam?: number;
        biaya?: number;
    };
}

export default function GuestIndex({ result }: GuestIndexProps) {
    const { flash } = usePage<SharedData>().props;

    const form = useForm({
        plat_nomor: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/cek-parkir', {
            preserveScroll: true,
            onSuccess: () => form.reset('plat_nomor'),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthLayout
            title="Cek Status Parkir"
            description="Masukkan plat nomor kendaraan untuk cek status dan cetak struk."
        >
            <Head title="Cek Status Parkir" />

            <div className="mx-auto w-full max-w-md space-y-6">
                {/* Flash Messages */}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400">
                        {flash.error}
                    </div>
                )}
                {flash?.success && !result && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Form Pencarian */}
                {!result && (
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="plat_nomor">Plat Nomor Kendaraan</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="plat_nomor"
                                    placeholder="Contoh: B 1234 XYZ"
                                    className="pl-9 uppercase"
                                    value={form.data.plat_nomor}
                                    onChange={(e) => form.setData('plat_nomor', e.target.value)}
                                    disabled={form.processing}
                                    autoFocus
                                />
                            </div>
                            {form.errors.plat_nomor && (
                                <p className="text-sm text-red-500">{form.errors.plat_nomor}</p>
                            )}
                        </div>

                        <Button className="w-full" disabled={form.processing}>
                            {form.processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Cek Status
                        </Button>
                    </form>
                )}

                {/* Hasil Pencarian */}
                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-center">
                            <ReceiptTicket data={result} className="shadow-lg" />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row print:hidden">
                            <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/cek-parkir'}>
                                <ArrowLeft className="mr-2 size-4" />
                                Cek Lainnya
                            </Button>
                            <Button className="flex-1" onClick={handlePrint}>
                                <Printer className="mr-2 size-4" />
                                Cetak Struk
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
