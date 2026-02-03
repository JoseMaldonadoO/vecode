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
        { name: 'Inicio', href: `/dashboard`, icon: LayoutDashboard, show: true, module: 'dashboard', color: 'text-indigo-400' },
        { name: 'Comercialización', href: `/sales`, icon: ClipboardList, permission: 'view commercialization', module: 'sales', color: 'text-blue-400' },
        { name: 'Tráfico', href: `/traffic`, icon: Truck, permission: 'view traffic', role: 'Admin', module: 'traffic', color: 'text-orange-400' },
        { name: 'Vigilancia', icon: Search, href: `/surveillance`, permission: 'view surveillance', module: 'surveillance', color: 'text-red-400' },
        { name: 'Documentación', icon: FileText, href: `/documentation`, permission: 'view documentation', module: 'documentation', color: 'text-amber-400' },
        { name: 'Báscula', href: `/scale`, icon: Scale, permission: 'view scale', module: 'scale', color: 'text-teal-400' },
        { name: 'Muelle', href: `/dock`, icon: Ship, permission: 'view dock', module: 'dock', color: 'text-cyan-400' },
        { name: 'APT', href: `/apt`, icon: Box, permission: 'view apt', module: 'apt', color: 'text-purple-400' },
        { name: 'Administración', href: `/admin/users`, icon: Users, role: 'Admin', module: 'admin', color: 'text-green-400' },
    ];

    const currentModule = (props.context_module || props.module) as string;

    const visibleLinks = allLinks.filter(link => {
        if (link.show) return true;
        if (link.role && roles.includes(link.role)) return true;
        if (link.permission && permissions.includes(link.permission)) return true;
        return false;
    });

    return (
        <div className={cn(
            "flex flex-col bg-slate-900/95 backdrop-blur-sm text-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden border-r border-slate-800",
            !isMobile && "h-full w-full", // Let layout control width
            isMobile && "h-full w-full",
            className
        )}>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent py-6 space-y-8">
                <div className="px-4 flex flex-col items-center">
                    <Link href={`/dashboard`} className="mb-4 flex items-center justify-center transition-transform hover:scale-105">
                        <img
                            src={`/images/logovecode.png`}
                            alt="Proagro"
                            className="h-12 w-auto object-contain drop-shadow-2xl transition-all duration-300 group-hover:h-20"
                        />
                    </Link>
                    <div className={cn(
                        "text-center transition-all duration-300 ease-in-out whitespace-nowrap",
                        !isMobile && "opacity-0 w-0 hidden group-hover:opacity-100 group-hover:w-auto group-hover:block",
                        isMobile && "block"
                    )}>
                        <h2 className="text-lg font-bold tracking-widest text-white uppercase">Vecode</h2>
                        <p className="text-xs font-medium text-slate-400 tracking-wider">Logística Pro-Agroindustria</p>
                    </div>
                </div>

                <div className="px-3">
                    <div className="space-y-1">
                        {visibleLinks.map((link) => {
                            // Accurate highlighting: prioritize context_module, then check URL sub-paths
                            const isActive = currentModule
                                ? currentModule === link.module
                                : (url.startsWith(link.href) || (link.href === '/dashboard' && url === '/dashboard'));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group/link flex items-center rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200 relative overflow-hidden whitespace-nowrap",
                                        isActive
                                            ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    )}
                                    title={link.name} // Tooltip for collapsed state
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                                    )}

                                    <link.icon className={cn(
                                        "mr-3 h-6 w-6 min-w-[24px] transition-colors duration-300",
                                        isActive ? link.color : "text-slate-500 group-hover/link:text-zinc-200",
                                        // On hover of parent sidebar, use the specific color
                                        !isActive && `group-hover:${link.color}`
                                    )} />

                                    <span className={cn(
                                        "tracking-wide transition-all duration-300 ease-in-out",
                                        !isMobile && "opacity-0 w-0 hidden group-hover:opacity-100 group-hover:w-auto group-hover:block",
                                        isMobile && "block"
                                    )}>
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pinned Footer */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50">
                <div className="rounded-xl bg-slate-800/50 p-2 border border-slate-700/50 flex items-center justify-center group-hover:justify-start transition-all duration-300">
                    <div className="flex items-center gap-3 w-full">
                        <div className="h-9 w-9 min-w-[36px] rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg text-sm mx-auto group-hover:mx-0 transition-all">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap",
                            !isMobile && "opacity-0 w-0 hidden group-hover:opacity-100 group-hover:w-auto group-hover:block",
                            isMobile && "block"
                        )}>
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
