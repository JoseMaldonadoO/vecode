import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, UserPlus, QrCode, Box, ShieldCheck, FileText } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {

    const menuItems = [

        { name: 'Alta operador manual', icon: FileText, href: route('documentation.operators.create'), description: 'Registro manual de operadores.', color: 'bg-green-50 text-green-600', hover: 'hover:border-green-500' },
        { name: 'QR de operador', icon: QrCode, href: route('documentation.qr'), description: 'Generar códigos QR para operadores.', color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-500' },
        { name: 'Alta producto', icon: Box, href: '#', description: 'Registrar nuevos productos en el sistema.', color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-500' },
        { name: 'Estatus QR', icon: ShieldCheck, href: '#', description: 'Verificar estatus de códigos QR.', color: 'bg-red-50 text-red-600', hover: 'hover:border-red-500' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Tráfico y Logística">
            <Head title="Tráfico" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-64 group border border-gray-100 hover:border-indigo-100"
                            >
                                <div className={`p-4 rounded-full mb-4 ${item.color.split(' ')[0]}`}>
                                    <item.icon className={`h-8 w-8 ${item.color.split(' ')[1]}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                <p className="text-gray-500">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
