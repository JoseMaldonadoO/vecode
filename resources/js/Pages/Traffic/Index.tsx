import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, UserPlus, QrCode, Box, ShieldCheck, FileText } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {

    const menuItems = [
        { name: 'Alta usuarios', icon: UserPlus, href: route('traffic.users.create') },
        { name: 'Lista de usuarios', icon: Users, href: route('dashboard') }, // Placeholder
        { name: 'Alta operador manual', icon: FileText, href: route('apt.operators.create') },
        { name: 'Qr de operador', icon: QrCode, href: route('apt.qr') },
        { name: 'Alta producto', icon: Box, href: route('dock.index') }, // Placeholder
        { name: 'Estatus QR', icon: ShieldCheck, href: route('dock.index') }, // Placeholder
    ];

    return (
        <DashboardLayout user={auth.user} header="Tráfico y Logística">
            <Head title="Tráfico" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow p-6 flex flex-col items-center justify-center text-center group border border-gray-100 hover:border-brand-500"
                            onClick={() => item.href !== '#' && router.get(item.href)}
                        >
                            <div className="p-3 rounded-full bg-brand-50 text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
