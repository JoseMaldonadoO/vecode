import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Printer, UserPlus, Search, Ship, Anchor, Scan } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {
    const menuItems = [
        { name: 'Imprimir QR', icon: Printer, href: route('apt.qr'), description: 'Buscar operador e imprimir tarjeta con código QR.', color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500' },
        { name: 'Alta Operador', icon: UserPlus, href: route('apt.operators.create'), description: 'Alta de operadores para el barco activo.', color: 'bg-green-50 text-green-600', hover: 'hover:border-green-500' },
        { name: 'Escanear Entrada', icon: Scan, href: route('apt.scanner.index'), description: 'Escanear código QR para registrar entrada/salida.', color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-500' },
        { name: 'Buscar Operador', icon: Search, href: '#', description: 'Buscar información de un operador registrado.', color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-500' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Administración Portuaria">
            <Head title="APT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
        </DashboardLayout >
    );
}
