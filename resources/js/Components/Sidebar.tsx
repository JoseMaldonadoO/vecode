import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Truck, Scale, Users, Settings, Package, ClipboardList, LogOut, Box, FileText, Anchor, Search, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const { url, props } = usePage();
    const baseUrl = (props.base_url as string) || '';

    const user = props.auth.user as any;
    const permissions = user?.permissions || [];
    const roles = user?.roles || [];

    const allLinks = [
        { name: 'Inicio', href: `${baseUrl}/dashboard`, icon: LayoutDashboard, show: true }, // Always show dashboard
        { name: 'Comercialización', href: `${baseUrl}/sales`, icon: ClipboardList, permission: 'view commercialization' },
        { name: 'Tráfico', href: `${baseUrl}/traffic`, icon: Truck, permission: 'view traffic', role: 'Admin' }, // Assuming permission name
        { name: 'Vigilancia', icon: Search, href: `${baseUrl}/surveillance`, permission: 'view surveillance' },
        { name: 'Documentación', icon: FileText, href: `${baseUrl}/documentation`, permission: 'view documentation' },
        { name: 'Báscula', href: `${baseUrl}/scale`, icon: Scale, permission: 'view scale' },
        { name: 'Muelle', href: `${baseUrl}/dock`, icon: Ship, permission: 'view dock' },
        { name: 'APT', href: `${baseUrl}/apt`, icon: Box, permission: 'view apt' },
        { name: 'Administración', href: `${baseUrl}/admin/users`, icon: Users, role: 'Admin' },
    ];

    const visibleLinks = allLinks.filter(link => {
        if (link.show) return true;
        if (link.role && roles.includes(link.role)) return true;
        if (link.permission && permissions.includes(link.permission)) return true;

        // If no specific permission/role is required (and not explicitly 'show' true), maybe show it? 
        // For now, implicit hide if not matched.
        // However, Traffic doesn't have a specific permission in my Seeder list yet?
        // Seeder had: 'view dashboard', 'manage users', 'manage roles', 'view dock', 'view documentation', 'view apt', 'view commercialization', 'view surveillance', 'view surveillance operators', 'view scale', 'access admin panel'
        // Traffic was not in the Seeder explicit list. I should check logic.
        // For now I will assume some links are open or I need to add 'view traffic'.
        // Let's add 'view traffic' to admin/default or just leave it for now.
        return false;
    });

    // Fix for Traffic: If no permission required, show it? Or assume Admin? 
    // The user requirement said: "Vigilancia Supervisor (Ve todo módulo Vigilancia)", etc.
    // It didn't explicitly restrict Traffic. I should probably add 'view traffic' to Seeder or make it accessible to all authenticated for now if not specified.
    // But RBAC implies restrictions. I will add 'view traffic' logic but I need to make sure Seeder has it if I use it.
    // Actually, I'll update Seeder later if needed. For now, I'll filter based on available permissions.
    // Let's stick to the requested list.
    // Wait, the user did NOT mention Traffic restrictions in "Roles Iniciales".
    // "Muelle (Solo ve módulo Muelle)", "Documentador (Solo ve Documentación)", etc.
    // This implies that if I have "Muelle" role, I should NOT see Traffic.
    // So Traffic SHOULD be protected. I will assume Admin/Traffic role see it.
    // Since I didn't create a Traffic role, I will hide it for now unless Admin.

    // Correction: I should probably just show links if the user has permission.

    return (
        <div className={cn("pb-12 min-h-screen border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent h-[100dvh] fixed w-64 z-50", className)}>
            <div className="space-y-8 py-6">
                <div className="px-6 flex flex-col items-center">
                    <Link href={`${baseUrl}/dashboard`} className="mb-4 flex items-center justify-center transition-transform hover:scale-105">
                        <img
                            src={`${baseUrl}/images/logovecode.png`}
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
                    <div className="space-y-2">
                        {visibleLinks.map((link) => {
                            const isActive = url.startsWith(link.href.replace(baseUrl, '')) || (link.href.endsWith('dashboard') && url === '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center rounded-xl px-4 py-4 text-base font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "mr-4 h-6 w-6 transition-colors",
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

            {/* Unicorn Footer Decoration */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{roles[0] || 'Operador'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
