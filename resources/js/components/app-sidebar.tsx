import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Car, DollarSign, FileText, Folder, LayoutGrid, List, LogIn, MapPin, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';
import type { UserRole } from '@/types/auth';
import AppLogo from './app-logo';

/**
 * Extended NavItem dengan role-based access.
 */
interface RoleNavItem extends NavItem {
    roles?: UserRole[];
}

/**
 * Menu items dengan role-based access control.
 * Jika roles tidak didefinisikan, menu bisa diakses semua role.
 */
const allNavItems: RoleNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        // Semua role bisa akses
    },
    {
        title: 'Parkir Masuk',
        href: '/transaksi/masuk',
        icon: LogIn,
        roles: ['petugas'], // Admin & Owner hanya monitoring dan manajemen users
    },
    {
        title: 'Daftar Transaksi',
        href: '/transaksi',
        icon: List,
        // Semua role bisa akses (owner bisa lihat)
    },
    {
        title: 'Kelola User',
        href: '/users',
        icon: Users,
        roles: ['owner', 'admin'], // Hanya owner dan admin
    },


    {
        title: 'Atur Tarif',
        href: '/tarif',
        icon: DollarSign,
        roles: ['owner', 'admin'],
    },
    {
        title: 'Log Aktivitas',
        href: '/log-aktivitas',
        icon: FileText,
        roles: ['owner', 'admin'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.role;

    // Filter menu items berdasarkan role user
    const filteredNavItems = allNavItems.filter((item) => {
        // Jika tidak ada roles yang didefinisikan, semua role bisa akses
        if (!item.roles) return true;
        // Cek apakah role user ada di daftar roles yang diizinkan
        return userRole && item.roles.includes(userRole);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

