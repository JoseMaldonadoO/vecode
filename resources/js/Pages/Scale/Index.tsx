import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Truck, Package, Scale, Activity, Printer, Database, Lock, ArrowRight, Warehouse } from 'lucide-react';

export default function Index({ auth, pending_exit = [] }: { auth: any, pending_exit: any[] }) {
    const buttons = [
        { name: 'Entrada', icon: Truck, color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-500', href: '#' },
        { name: 'Entrada MI / MP', icon: Package, color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500', href: route('scale.entry-mp') },
        // { name: 'Segundo Ticket', icon: Scale, color: 'bg-green-50 text-green-600', hover: 'hover:border-green-500', href: '#' }, // Replaced by List
        // { name: 'Estatus de unidades', icon: Activity, color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-500', href: '#' },
        { name: 'Edita / Reimprime Ticket', icon: Printer, color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-500', href: '#' },
        { name: 'Alta lote / almacen', icon: Database, color: 'bg-teal-50 text-teal-600', hover: 'hover:border-teal-500', href: '#' },
        { name: 'Cierre de Lote', icon: Lock, color: 'bg-red-50 text-red-600', hover: 'hover:border-red-500', href: '#' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Báscula - Panel de Control">
            <Head title="Báscula" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">

                {/* Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {buttons.map((btn, index) => {
                        const isLink = btn.href && btn.href !== '#';
                        const CardContent = () => (
                            <>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform transform group-hover:scale-110 ${btn.color}`}>
                                    <btn.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-gray-800">{btn.name}</h3>
                            </>
                        );

                        const className = `group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${btn.hover} w-full`;

                        return isLink ? (
                            <a key={index} href={btn.href} className={className}>
                                <CardContent />
                            </a>
                        ) : (
                            <button
                                key={index}
                                className={className}
                                onClick={() => alert(`Funcionalidad '${btn.name}' en desarrollo`)}
                            >
                                <CardContent />
                            </button>
                        );
                    })}
                </div>

                {/* Pending Exit List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <Truck className="w-6 h-6 mr-2 text-green-600" />
                                Unidades en Planta (Pendientes de Salida)
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Seleccione una unidad para registrar peso de salida (Destare).</p>
                        </div>
                        <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                            {pending_exit.length} Pendientes
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-bold">
                                <tr>
                                    <th className="p-4">Folio</th>
                                    <th className="p-4">Unidad / Chofer</th>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Peso Entrada</th>
                                    <th className="p-4">Ubicación (APT)</th>
                                    <th className="p-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pending_exit.length > 0 ? pending_exit.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono font-bold text-indigo-600">{order.folio}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{order.driver}</div>
                                            <div className="text-sm text-gray-500 font-mono">{order.plate}</div>
                                        </td>
                                        <td className="p-4 text-gray-700">{order.product}</td>
                                        <td className="p-4 font-mono font-bold">{order.tare_weight} kg</td>
                                        <td className="p-4">
                                            <div className="flex items-center text-sm">
                                                <Warehouse className="w-4 h-4 mr-2 text-gray-400" />
                                                <span className={order.warehouse === 'N/A' ? 'text-amber-500 italic' : 'text-blue-600 font-bold'}>
                                                    {order.warehouse === 'N/A' ? 'Sin Asignar' : `${order.warehouse} - ${order.cubicle}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link
                                                href={route('scale.exit', order.id)}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                                            >
                                                Destarar <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                            No hay unidades pendientes de salida.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
