import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Car, Search, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormEventHandler, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReceiptTicket from '@/components/receipt-ticket';
import type { SharedData } from '@/types';

export default function Welcome({ canRegister = false }: { canRegister?: boolean }) {
    const { auth, flash } = usePage<any>().props;
    const result = flash?.result;

    const form = useForm({
        plat_nomor: '',
    });

    const resultRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to result when it appears
    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [result]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post('/cek-parkir', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('plat_nomor');
            },
        });
    };

    return (
        <div className="min-h-screen bg-muted/30 font-sans text-foreground selection:bg-primary/10 flex flex-col">
            <Head title="Cek Status Parkir" />

            {/* Navbar Simplified */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                            <Car className="size-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">ParkirApp</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user && (
                            <Link href="/dashboard">
                                <Button size="sm">Dashboard</Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        Cek Status Kendaraan
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Masukkan nomor polisi kendaraan Anda untuk melihat rincian dan mencetak struk parkir.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
                    <Card className="shadow-xl border-2">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl">Pencarian Parkir</CardTitle>
                            <CardDescription>
                                Input nomor polisi tanpa spasi atau dengan spasi (Contoh: B 1234 XYZ)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="plat_nomor"
                                            name="plat_nomor"
                                            type="text"
                                            placeholder="Cari Plat Nomor..."
                                            className="pl-10 h-12 text-lg uppercase tracking-wider font-medium"
                                            value={form.data.plat_nomor}
                                            onChange={(e) => form.setData('plat_nomor', e.target.value)}
                                            autoFocus
                                            autoComplete="off"
                                        />
                                    </div>
                                    {form.errors.plat_nomor && (
                                        <p className="text-sm text-red-500 font-medium animate-pulse">
                                            {form.errors.plat_nomor}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-semibold shadow-sm"
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Sedang Mencari...' : 'Cari Kendaraan'}
                                </Button>
                            </form>

                            {/* Flash Check (Error handled above mostly, but global errors here) */}
                            {flash?.error && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Kesalahan</AlertTitle>
                                    <AlertDescription>
                                        {flash.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>

                        {!result && (
                            <CardFooter className="bg-muted/50 px-6 py-4">
                                <div className="text-xs text-muted-foreground w-full text-center space-y-1">
                                    <p>Sistem Parkir Terintegrasi v2.0</p>
                                    <p>Pastikan data kendaraan sesuai dengan STNK Anda.</p>
                                </div>
                            </CardFooter>
                        )}
                    </Card>

                    {/* Result Interface */}
                    {result && (
                        <div ref={resultRef} className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <div className="mb-6 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>

                                        <h3 className="text-lg font-medium text-green-900 dark:text-green-100 mb-6">
                                            Data Kendaraan Ditemukan
                                        </h3>

                                        <ReceiptTicket data={result} className="shadow-xl mb-8 scale-100 sm:scale-105 origin-top border-dashed border-2 bg-white" />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                                            <Button
                                                onClick={() => window.print()}
                                                size="lg"
                                                className="w-full shadow-md bg-zinc-900 hover:bg-zinc-800 text-white"
                                            >
                                                <Printer className="mr-2 h-5 w-5" />
                                                Cetak Struk
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="w-full bg-white hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200 text-zinc-900"
                                                onClick={() => {
                                                    form.reset();
                                                    form.clearErrors();
                                                    router.visit('/', { replace: true });
                                                }}
                                            >
                                                Cari Lainnya
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
