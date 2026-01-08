import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Truck, Scale, Users, Settings, Package, ClipboardList, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const { url } = usePage();

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Comercialización', href: '/sales', icon: ClipboardList },
        { name: 'Tráfico', href: '/traffic', icon: Truck },
        { name: 'Vigilancia Física', href: '/surveillance', icon: Users },
        { name: 'Báscula', href: '/scale', icon: Scale },
        { name: 'Muelle', href: '/dock', icon: Settings },
    ];

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-zinc-950 text-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Truck className="h-6 w-6 text-indigo-500" />
                        VECODE
                    </h2>
                    <p className="px-2 text-xs text-zinc-400">Enterprise Logistics ERP</p>
                </div>
                <div className="px-3">
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-white hover:bg-zinc-800",
                                    url.startsWith(link.href)
                                        ? "bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700"
                                        : "text-zinc-400"
                                )}
                            >
                                <link.icon className="mr-3 h-4 w-4" />
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {/* Footer / User Info could go here */}
        </div>
    );
}
