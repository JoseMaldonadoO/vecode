import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Printer, UserPlus, ArrowLeft } from 'lucide-react';

export default function Dock({ auth }: { auth: any }) {
    const menuItems = [
        { name: 'Imprimir QR', icon: Printer, href: route('documentation.qr'), description: 'Buscar operador e imprimir tarjeta con código QR.', color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500' },
        { name: 'Alta Operador', icon: UserPlus, href: route('documentation.operators.create'), description: 'Registrar nuevo operador en el sistema.', color: 'bg-green-50 text-green-600', hover: 'hover:border-green-500' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Documentación - Muelle">
            <Head title="Documentación - Muelle" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('documentation.index')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Volver a Documentación
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
