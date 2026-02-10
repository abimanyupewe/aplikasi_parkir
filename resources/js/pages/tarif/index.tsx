import { Head, useForm } from '@inertiajs/react';
import { Pencil, DollarSign, Trash, Plus } from 'lucide-react';
import { useState } from 'react';

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Tarif {
    id_tarif: number;
    jenis_kendaraan: string;
    tarif_per_jam: number;
}

interface PageProps {
    tarif: Tarif[];
    flash: {
        success?: string;
        error?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atur Tarif',
        href: '/tarif',
    },
];

export default function TarifIndex({ tarif, flash }: PageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<Tarif | null>(null);

    // Form for Edit (only tarif_per_jam) or Create (jenis + tarif)
    const { data, setData, put, post, delete: destroy, processing, errors, reset } = useForm({
        jenis_kendaraan: '',
        tarif_per_jam: '',
    });

    const openModal = (item?: Tarif) => {
        if (item) {
            setIsEditMode(true);
            setEditingItem(item);
            setData({
                jenis_kendaraan: item.jenis_kendaraan,
                tarif_per_jam: item.tarif_per_jam.toString(),
            });
        } else {
            setIsEditMode(false);
            setEditingItem(null);
            setData({
                jenis_kendaraan: '',
                tarif_per_jam: '',
            });
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
        if (isEditMode && editingItem) {
            // Update
            put(`/tarif/${editingItem.id_tarif}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            // Create
            post('/tarif', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tarif ini?')) {
            destroy(`/tarif/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Tarif" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Tarif</h1>
                        <p className="text-muted-foreground">Sesuaikan harga parkir per jam.</p>
                    </div>
                    {/* Add Button for creating NEW vehicle types */}
                    <Button onClick={() => openModal()} className="gap-2">
                        <Plus className="size-4" /> Tambah Jenis Kendaraan
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tarif.map((item) => (
                        <Card key={item.id_tarif}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium capitalize">
                                    {item.jenis_kendaraan}
                                </CardTitle>
                                <DollarSign className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {item.tarif_per_jam.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground">
                                    per jam
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => openModal(item)}>
                                        <Pencil className="size-3" /> Edit Harga
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-10 px-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id_tarif)}>
                                        <Trash className="size-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Fallback Table View if prefered or for many items */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Rincian Tarif</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jenis Kendaraan</TableHead>
                                    <TableHead>Biaya Per Jam</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tarif.map((item) => (
                                    <TableRow key={item.id_tarif}>
                                        <TableCell className="capitalize font-medium">{item.jenis_kendaraan}</TableCell>
                                        <TableCell>Rp {item.tarif_per_jam.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openModal(item)}>
                                                    <Pencil className="size-4 text-blue-500" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id_tarif)}>
                                                    <Trash className="size-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isEditMode ? `Edit Tarif ${editingItem?.jenis_kendaraan}` : 'Tambah Jenis Kendaraan & Tarif'}
                            </DialogTitle>
                            <DialogDescription>
                                {isEditMode ? 'Ubah nominal tarif per jam.' : 'Tentukan jenis kendaraan baru dan tarifnya.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isEditMode && (
                                <div className="space-y-2">
                                    <Label htmlFor="jenis_kendaraan">Jenis Kendaraan</Label>
                                    <Input
                                        id="jenis_kendaraan"
                                        value={data.jenis_kendaraan}
                                        onChange={(e) => setData('jenis_kendaraan', e.target.value.toLowerCase())}
                                        placeholder="contoh: truk, bus"
                                        required
                                    />
                                    {errors.jenis_kendaraan && <p className="text-sm text-red-500">{errors.jenis_kendaraan}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="tarif_per_jam">Tarif Per Jam (Rp)</Label>
                                <Input
                                    id="tarif_per_jam"
                                    type="number"
                                    min="0"
                                    value={data.tarif_per_jam}
                                    onChange={(e) => setData('tarif_per_jam', e.target.value)}
                                    placeholder="5000"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Masukkan angka saja.</p>
                                {errors.tarif_per_jam && <p className="text-sm text-red-500">{errors.tarif_per_jam}</p>}
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
