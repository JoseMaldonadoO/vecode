import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, UserPlus, QrCode, Box, ShieldCheck, FileText } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {

    const menuItems = [
        { name: 'Alta usuarios', icon: UserPlus, href: '#' },
        { name: 'Lista de usuarios', icon: Users, href: '#' },
        // { name: 'Alta operador y equipo', icon: Truck, href: '#' }, // Excluded as requested
        { name: 'Alta operador manual', icon: FileText, href: '#' },
        { name: 'Qr de operador', icon: QrCode, href: '#' },
        { name: 'Alta producto', icon: Box, href: '#' },
        { name: 'Estatus QR', icon: ShieldCheck, href: '#' },
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
                            onClick={() => console.log('Button clicked:', item.name)}
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
