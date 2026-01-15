import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { Truck, Package, Scale, Activity, Printer, Database, Lock } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {
    const buttons = [
        { name: 'Entrada', icon: Truck, color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-500', href: '#' },
        { name: 'Entrada MI / MP', icon: Package, color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500', href: '/scale/entry-mp' },
        { name: 'Segundo Ticket', icon: Scale, color: 'bg-green-50 text-green-600', hover: 'hover:border-green-500', href: '#' },
        { name: 'Estatus de unidades', icon: Activity, color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-500', href: '#' },
        { name: 'Edita / Reimprime Ticket', icon: Printer, color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-500', href: '#' },
        { name: 'Alta lote / almacen / planta', icon: Database, color: 'bg-teal-50 text-teal-600', hover: 'hover:border-teal-500', href: '#' },
        { name: 'Edita / cierra lote', icon: Lock, color: 'bg-red-50 text-red-600', hover: 'hover:border-red-500', href: '#' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Báscula">
            <Head title="Báscula" />

            <div className="max-w-7xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            className={`group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl ${btn.hover}`}
                            onClick={() => alert(`Funcionalidad '${btn.name}' en desarrollo`)}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 ${btn.color}`}>
                                <btn.icon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 break-words w-full">{btn.name}</h3>
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
