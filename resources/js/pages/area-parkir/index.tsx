import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Pencil, Trash, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AreaParkir {
    id_area: number;
    nama_area: string;
    kapasitas: number;
    terisi: number;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    areas: AreaParkir[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Area Parkir',
        href: '/area-parkir',
    },
];

export default function AreaParkirIndex({ areas, flash }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaParkir | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nama_area: '',
        kapasitas: '',
    });

    const openModal = (area?: AreaParkir) => {
        if (area) {
            setIsEditMode(true);
            setEditingArea(area);
            setData({
                nama_area: area.nama_area,
                kapasitas: area.kapasitas.toString(),
            });
        } else {
            setIsEditMode(false);
            setEditingArea(null);
            reset();
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && editingArea) {
            put(`/area-parkir/${editingArea.id_area}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/area-parkir', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus area ini?')) {
            destroy(`/area-parkir/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Area Parkir" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manajemen Area Parkir</h1>
                        <p className="text-muted-foreground">Kelola lokasi dan kapasitas parkir.</p>
                    </div>
                    <Button onClick={() => openModal()} className="gap-2">
                        <Plus className="size-4" /> Tambah Area
                    </Button>
                </div>

                {flash.success && (
                    <div className="rounded-md bg-green-50 p-4 text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200">
                        {flash.error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Area Parkir</CardTitle>
                        <CardDescription>
                            Total {areas.length} area terdaftar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Area</TableHead>
                                    <TableHead>Kapasitas</TableHead>
                                    <TableHead>Terisi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {areas.length > 0 ? (
                                    areas.map((area) => (
                                        <TableRow key={area.id_area}>
                                            <TableCell className="font-medium">{area.nama_area}</TableCell>
                                            <TableCell>{area.kapasitas} Slot</TableCell>
                                            <TableCell>{area.terisi} Terisi</TableCell>
                                            <TableCell>
                                                <Badge variant={area.terisi >= area.kapasitas ? 'destructive' : 'outline'}>
                                                    {area.terisi >= area.kapasitas ? 'Penuh' : 'Tersedia'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openModal(area)}
                                                    >
                                                        <Pencil className="size-4 text-orange-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(area.id_area)}
                                                        disabled={area.terisi > 0} // Prevent delete if occupied
                                                        title={area.terisi > 0 ? "Area sedang digunakan" : "Hapus Area"}
                                                    >
                                                        <Trash className="size-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Belum ada data area parkir.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Modal Form */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? 'Edit Area Parkir' : 'Tambah Area Parkir'}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditMode
                                    ? 'Ubah detail area parkir.'
                                    : 'Tambahkan area parkir baru ke sistem.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama_area">Nama Area</Label>
                                <Input
                                    id="nama_area"
                                    value={data.nama_area}
                                    onChange={(e) => setData('nama_area', e.target.value)}
                                    placeholder="Contoh: Lantai Basement"
                                    required
                                />
                                {errors.nama_area && (
                                    <p className="text-sm text-red-500">{errors.nama_area}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kapasitas">Kapasitas</Label>
                                <Input
                                    id="kapasitas"
                                    type="number"
                                    min="1"
                                    value={data.kapasitas}
                                    onChange={(e) => setData('kapasitas', e.target.value)}
                                    placeholder="50"
                                    required
                                />
                                {errors.kapasitas && (
                                    <p className="text-sm text-red-500">{errors.kapasitas}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                    disabled={processing}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
