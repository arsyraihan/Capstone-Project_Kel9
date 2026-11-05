import { Link, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Boxes,
    ClipboardList,
    FileBarChart,
    Handshake,
    LayoutDashboard,
    LucideIcon,
    MapPin,
    PackageCheck,
    PackageOpen,
    Shirt,
    ShoppingCart,
    Truck,
    Users,
    UserCog,
    Warehouse,
} from 'lucide-react';
import { Role, SharedData } from '@/types';

interface MenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
    roles: Role[];
}

interface MenuGroup {
    title?: string;
    items: MenuItem[];
}

const semua: Role[] = ['admin', 'petugas'];

const menu: MenuGroup[] = [
    {
        items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: semua }],
    },
    {
        title: 'Master Data',
        items: [
            { label: 'Barang', href: '/barang', icon: Shirt, roles: ['admin'] },
            { label: 'Pemasok', href: '/pemasok', icon: Handshake, roles: ['admin'] },
            { label: 'Pelanggan', href: '/pelanggan', icon: Users, roles: ['admin'] },
            { label: 'Rak', href: '/rak', icon: MapPin, roles: ['admin'] },
        ],
    },
    {
        title: 'Transaksi',
        items: [
            { label: 'Pengadaan', href: '/pengadaan', icon: ShoppingCart, roles: ['admin'] },
            { label: 'Penerimaan', href: '/penerimaan', icon: ArrowDownToLine, roles: semua },
            { label: 'Penyimpanan', href: '/penyimpanan', icon: Warehouse, roles: semua },
            { label: 'Stok', href: '/stok', icon: Boxes, roles: semua },
            { label: 'Pesanan', href: '/pesanan', icon: ClipboardList, roles: ['admin'] },
            { label: 'Pengambilan', href: '/pengambilan', icon: PackageOpen, roles: semua },
            { label: 'Pengemasan', href: '/pengemasan', icon: PackageCheck, roles: semua },
            { label: 'Pengiriman', href: '/pengiriman', icon: Truck, roles: semua },
        ],
    },
    {
        title: 'Lainnya',
        items: [
            { label: 'Laporan', href: '/laporan', icon: FileBarChart, roles: ['admin'] },
            { label: 'Pengguna', href: '/pengguna', icon: UserCog, roles: ['admin'] },
        ],
    },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const role = auth.user?.role;
    const currentUrl = usePage().url;

    const isActive = (href: string) => currentUrl === href || currentUrl.startsWith(href + '/') || currentUrl.startsWith(href + '?');

    return (
        <>
            {/* Latar gelap untuk layar kecil */}
            {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden print:hidden" onClick={onClose} />}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white transition-transform lg:translate-x-0 print:hidden ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-14 items-center gap-2 border-b border-white/15 px-4">
                    <Shirt className="size-5" />
                    <span className="text-sm leading-tight font-semibold">{name}</span>
                </div>

                <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
                    {menu.map((group, index) => {
                        const items = group.items.filter((item) => role && item.roles.includes(role));

                        if (items.length === 0) {
                            return null;
                        }

                        return (
                            <div key={index}>
                                {group.title && <p className="mb-1 px-3 text-xs font-semibold tracking-wider text-white/50 uppercase">{group.title}</p>}
                                <ul className="space-y-0.5">
                                    {items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                                                    isActive(item.href) ? 'bg-white/15 font-medium text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                <item.icon className="size-4 shrink-0" />
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
