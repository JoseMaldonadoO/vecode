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
        { name: 'Documentación', icon: FileText, href: `${baseUrl}/documentation`, permission: 'view documentation' },
        { name: 'Vigilancia', icon: Search, href: `${baseUrl}/surveillance`, permission: 'view surveillance' },
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
        <div className={cn("pb-12 min-h-screen border-r bg-brand-900 text-white", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <Link href={`${baseUrl}/dashboard`} className="mb-2 px-2 flex items-center gap-2">
                        {/* <Truck className="h-6 w-6 text-brand-500" /> */}
                        <img src={`${baseUrl}/img/Proagro2.png?v=3`} alt="Proagro" className="h-12 w-auto object-contain" />
                        {/* <span className="text-xl font-bold tracking-tight text-white">VECODE</span> */}
                    </Link>
                    <p className="px-2 text-xs text-zinc-400">Logística Pro-Agroindustria</p>
                </div>
                <div className="px-3">
                    <div className="space-y-1">
                        {visibleLinks.map((link) => (
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
