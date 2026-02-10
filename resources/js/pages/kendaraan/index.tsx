import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash, Search } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Meta {
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Kendaraan {
    id_kendaraan: number;
    plat_nomor: string;
    jenis_kendaraan: 'motor' | 'mobil';
    id_user?: number;
    user?: {
        name: string;
    }
}

interface PageProps {
    kendaraan: {
        data: Kendaraan[];
        meta?: Meta;
        links?: PaginationLinks[];
    };
    filters: {
        search?: string;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Kendaraan',
        href: '/kendaraan',
    },
];

export default function KendaraanIndex({ kendaraan, filters, flash }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<Kendaraan | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        plat_nomor: '',
        jenis_kendaraan: 'motor',
    });

    const openModal = (item?: Kendaraan) => {
        if (item) {
            setIsEditMode(true);
            setEditingItem(item);
            setData({
                plat_nomor: item.plat_nomor,
                jenis_kendaraan: item.jenis_kendaraan,
            });
        } else {
            setIsEditMode(false);
            setEditingItem(null);
            reset();
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        reset();
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditMode && editingItem) {
            put(`/kendaraan/${editingItem.id_kendaraan}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/kendaraan', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus data kendaraan ini?')) {
            destroy(`/kendaraan/${id}`);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/kendaraan', { search: searchTerm }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kendaraan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Data Kendaraan</h1>
                        <p className="text-muted-foreground">Kelola kendaraan member/khusus.</p>
                    </div>
                    <Button onClick={() => openModal()} className="gap-2">
                        <Plus className="size-4" /> Tambah Kendaraan
                    </Button>
                </div>

                {flash.success && (
                    <div className="rounded-md bg-green-50 p-4 text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Plat Nomor..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kendaraan</CardTitle>
                        <CardDescription>
                            Total {kendaraan.data.length} data ditampilkan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Plat Nomor</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Pemilik</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kendaraan.data.length > 0 ? (
                                    kendaraan.data.map((item) => (
                                        <TableRow key={item.id_kendaraan}>
                                            <TableCell className="font-mono font-bold">{item.plat_nomor}</TableCell>
                                            <TableCell className="capitalize">{item.jenis_kendaraan}</TableCell>
                                            <TableCell>
                                                {item.user ? item.user.name : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openModal(item)}
                                                    >
                                                        <Pencil className="size-4 text-orange-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(item.id_kendaraan)}
                                                    >
                                                        <Trash className="size-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Tidak ada data kendaraan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Modal */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
                            </DialogTitle>
                            <DialogDescription>
                                Masukkan detail kendaraan member.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plat_nomor">Plat Nomor</Label>
                                <Input
                                    id="plat_nomor"
                                    value={data.plat_nomor}
                                    onChange={(e) => setData('plat_nomor', e.target.value.toUpperCase())}
                                    placeholder="B 1234 XYZ"
                                    className="uppercase font-mono"
                                    required
                                />
                                {errors.plat_nomor && <p className="text-sm text-red-500">{errors.plat_nomor}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jenis_kendaraan">Jenis Kendaraan</Label>
                                <Select
                                    value={data.jenis_kendaraan}
                                    onValueChange={(val) => setData('jenis_kendaraan', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="motor">Motor</SelectItem>
                                        <SelectItem value="mobil">Mobil</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenis_kendaraan && <p className="text-sm text-red-500">{errors.jenis_kendaraan}</p>}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                                <Button type="submit" disabled={processing}>Simpan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
