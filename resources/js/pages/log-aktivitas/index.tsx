import { Head, Link } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface LogAktivitas {
    id_log: number;
    aksi: string;
    deskripsi: string;
    created_at: string;
    user?: {
        name: string;
    };
}

interface PageProps {
    logs: {
        data: LogAktivitas[];
        current_page: number;
        last_page: number;
        links: any[]; // Laravel pagination links
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Log Aktivitas',
        href: '/log-aktivitas',
    },
];

export default function LogAktivitasIndex({ logs }: PageProps) {
    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'medium',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Aktivitas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Log Aktivitas</h1>
                        <p className="text-muted-foreground">Riwayat aktivitas petugas dan sistem.</p>
                    </div>
                    <a href="/log-aktivitas/export" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="gap-2">
                            <Download className="size-4" /> Unduh Laporan (CSV)
                        </Button>
                    </a>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Riwayat Terbaru
                        </CardTitle>
                        <CardDescription>
                            Menampilkan 20 data terbaru per halaman.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Waktu</TableHead>
                                    <TableHead className="w-[150px]">Petugas</TableHead>
                                    <TableHead className="w-[150px]">Aksi</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id_log}>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {formatDate(log.created_at)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {log.user ? log.user.name : 'System'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${log.aksi === 'Check-In' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                    log.aksi === 'Check-Out' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                    }`}>
                                                    {log.aksi}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.deskripsi}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Belum ada aktivitas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </p>
                            <div className="flex gap-1">
                                {logs.links.map((link, index) => {
                                    const label = link.label;

                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={buttonVariants({
                                                variant: link.active ? "default" : "outline",
                                                size: "sm",
                                            })}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className={buttonVariants({
                                                variant: "outline",
                                                size: "sm",
                                                className: "opacity-50 cursor-not-allowed pointer-events-none"
                                            })}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
