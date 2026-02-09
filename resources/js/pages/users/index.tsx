import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Shield, Trash2, UserCog, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * Interface untuk data user.
 */
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'petugas';
    is_approved: boolean;
    created_at: string;
}

/**
 * Interface untuk statistik.
 */
interface Stats {
    total: number;
    admin: number;
    petugas: number;
    pending: number;
}

/**
 * Props yang dikirim dari controller.
 */
interface Props {
    users: User[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kelola User', href: '/users' },
];

/**
 * Halaman daftar user untuk Owner dan Admin.
 */
export default function UsersIndex({ users, stats }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Filter users berdasarkan search
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter Pending
    const pendingUsers = filteredUsers.filter((user) => !user.is_approved);

    // Pisahkan Admin dan Petugas (yang sudah approved)
    const admins = filteredUsers.filter(
        (user) => user.is_approved && user.role === 'admin'
    );
    const petugasList = filteredUsers.filter(
        (user) => user.is_approved && user.role === 'petugas'
    );

    // Handler untuk approve user
    const handleApprove = (user: User) => {
        if (confirm(`Setujui akun "${user.name}"?`)) {
            setProcessingId(user.id);
            router.post(
                `/users/${user.id}/approve`,
                {},
                {
                    onFinish: () => setProcessingId(null),
                }
            );
        }
    };

    // Handler untuk hapus user
    const handleDelete = (user: User) => {
        if (confirm(`Apakah anda yakin ingin menghapus user "${user.name}"?`)) {
            setProcessingId(user.id);
            router.delete(`/users/${user.id}`, {
                onFinish: () => setProcessingId(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola User" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Kelola User</h1>
                    <p className="text-muted-foreground">
                        Kelola akun Admin dan Petugas. Setujui user baru di bagian Pending.
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-600">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-600">
                        {flash.error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Aproved
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total - (stats.pending || 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending
                            </CardTitle>
                            <AlertCircle className="size-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">
                                {stats.pending || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Admin
                            </CardTitle>
                            <Shield className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.admin}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Petugas
                            </CardTitle>
                            <UserCog className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {stats.petugas}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <Input
                        type="search"
                        placeholder="Cari nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {/* Pending Approval Section */}
                {pendingUsers.length > 0 && (
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="border-b pb-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-5 text-yellow-500" />
                                <CardTitle className="text-foreground">
                                    Menunggu Persetujuan ({pendingUsers.length})
                                </CardTitle>
                            </div>
                            <CardDescription>
                                User baru yang mendaftar dan menunggu persetujuan Owner.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {pendingUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex size-10 items-center justify-center rounded-full ${user.role === 'admin'
                                                        ? 'bg-blue-500/10 text-blue-500'
                                                        : 'bg-purple-500/10 text-purple-500'
                                                    }`}
                                            >
                                                {user.role === 'admin' ? (
                                                    <Shield className="size-5" />
                                                ) : (
                                                    <UserCog className="size-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{user.name}</p>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-yellow-500 text-yellow-500"
                                                    >
                                                        {user.role === 'admin'
                                                            ? 'Calon Admin'
                                                            : 'Calon Petugas'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground/75">
                                                    Daftar: {user.created_at}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400"
                                                onClick={() => handleApprove(user)}
                                                disabled={processingId === user.id}
                                            >
                                                <CheckCircle2 className="mr-2 size-4" />
                                                Setujui
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                onClick={() => handleDelete(user)}
                                                disabled={processingId === user.id}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Split Lists: Admin & Petugas (Approved Only) */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Admin List */}
                    <Card className="h-fit">
                        <CardHeader className="border-b bg-muted/40">
                            <div className="flex items-center gap-2">
                                <Shield className="size-5 text-blue-500" />
                                <div>
                                    <CardTitle>Daftar Admin</CardTitle>
                                    <CardDescription>
                                        Mengelola sistem & laporan
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {admins.length > 0 ? (
                                <div className="divide-y">
                                    {admins.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                                    <Shield className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                onClick={() => handleDelete(user)}
                                                disabled={processingId === user.id}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <Shield className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm">Tidak ada admin aktif</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Petugas List */}
                    <Card className="h-fit">
                        <CardHeader className="border-b bg-muted/40">
                            <div className="flex items-center gap-2">
                                <UserCog className="size-5 text-purple-500" />
                                <div>
                                    <CardTitle>Daftar Petugas</CardTitle>
                                    <CardDescription>
                                        Bertugas di lapangan
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {petugasList.length > 0 ? (
                                <div className="divide-y">
                                    {petugasList.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                                                    <UserCog className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                                                onClick={() => handleDelete(user)}
                                                disabled={processingId === user.id}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <UserCog className="mb-2 size-8 opacity-20" />
                                    <p className="text-sm">Tidak ada petugas aktif</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
