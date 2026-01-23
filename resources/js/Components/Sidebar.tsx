import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Truck, Scale, Users, Settings, Package, ClipboardList, LogOut, Box, FileText, Anchor, Search, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isMobile?: boolean; // Add isMobile prop
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
    const { url, props } = usePage();
    const baseUrl = (props.base_url as string) || '';

    const user = props.auth.user as any;
    const permissions = user?.permissions || [];
    const roles = user?.roles || [];

    // Remove baseUrl for root deployment
    const allLinks = [
        { name: 'Inicio', href: `/dashboard`, icon: LayoutDashboard, show: true, module: 'dashboard' },
        { name: 'Comercialización', href: `/sales`, icon: ClipboardList, permission: 'view commercialization', module: 'sales' },
        { name: 'Tráfico', href: `/traffic`, icon: Truck, permission: 'view traffic', role: 'Admin', module: 'traffic' },
        { name: 'Vigilancia', icon: Search, href: `/surveillance`, permission: 'view surveillance', module: 'surveillance' },
        { name: 'Documentación', icon: FileText, href: `/documentation`, permission: 'view documentation', module: 'documentation' },
        { name: 'Báscula', href: `/scale`, icon: Scale, permission: 'view scale', module: 'scale' },
        { name: 'Muelle', href: `/dock`, icon: Ship, permission: 'view dock', module: 'dock' },
        { name: 'APT', href: `/apt`, icon: Box, permission: 'view apt', module: 'apt' },
        { name: 'Administración', href: `/admin/users`, icon: Users, role: 'Admin', module: 'admin' },
    ];

    const currentModule = props.module as string;

    const visibleLinks = allLinks.filter(link => {
        if (link.show) return true;
        if (link.role && roles.includes(link.role)) return true;
        if (link.permission && permissions.includes(link.permission)) return true;
        return false;
    });

    return (
        <div className={cn(
            "flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white shadow-2xl",
            !isMobile && "min-h-screen border-r border-slate-800 h-[100dvh] fixed w-64 z-50",
            isMobile && "h-full w-full",
            className
        )}>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent py-6 space-y-8">
                <div className="px-6 flex flex-col items-center">
                    <Link href={`/dashboard`} className="mb-4 flex items-center justify-center transition-transform hover:scale-105">
                        <img
                            src={`/images/logovecode.png`}
                            alt="Proagro"
                            className="h-20 w-auto object-contain drop-shadow-2xl"
                        />
                    </Link>
                    <div className="text-center">
                        <h2 className="text-lg font-bold tracking-widest text-white uppercase">Vecode</h2>
                        <p className="text-xs font-medium text-slate-400 tracking-wider">Logística Pro-Agroindustria</p>
                    </div>
                </div>

                <div className="px-4">
                    <div className="space-y-1">
                        {visibleLinks.map((link) => {
                            const isActive = currentModule
                                ? currentModule === link.module
                                : (url.startsWith(link.href) || (link.href === '/dashboard' && url === '/'));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "mr-3 h-5 w-5 transition-colors",
                                        isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                                    )} />
                                    <span className="tracking-wide">{link.name}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pinned Footer */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50">
                <div className="rounded-xl bg-slate-800/50 p-3 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">
                                {roles[0] || 'Operador'} • <span className="text-emerald-400">Online</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
