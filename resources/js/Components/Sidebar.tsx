import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Truck, Scale, Users, Settings, Package, ClipboardList, LogOut, Box, FileText, Anchor, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const { url, props } = usePage();
    const baseUrl = (props.base_url as string) || '';

    const links = [
        { name: 'Inicio', href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
        { name: 'Comercialización', href: `${baseUrl}/sales`, icon: ClipboardList },
        { name: 'Documentación', icon: FileText, href: `${baseUrl}/documentation` },
        { name: 'Muelle (APT)', icon: Anchor, href: `${baseUrl}/apt` },
        { name: 'Vigilancia', icon: Search, href: `${baseUrl}/surveillance` },
        { name: 'Báscula', href: `${baseUrl}/scale`, icon: Scale },
        { name: 'Muelle', href: `${baseUrl}/dock`, icon: Settings },
        { name: 'APT', href: `${baseUrl}/apt`, icon: Box },
    ];

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-brand-950 text-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <Link href={`${baseUrl}/dashboard`} className="mb-2 px-2 flex items-center gap-2">
                        <Truck className="h-6 w-6 text-brand-500" />
                        <span className="text-xl font-bold tracking-tight text-white">VECODE</span>
                    </Link>
                    <p className="px-2 text-xs text-zinc-400">Enterprise Logistics ERP</p>
                </div>
                <div className="px-3">
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-white hover:bg-brand-900/40",
                                    url.startsWith(link.href)
                                        ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-500"
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
