import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Ship, QrCode } from 'lucide-react';

export default function Index({ auth, operators = [] }: { auth: any, operators?: any[] }) {

    return (
        <DashboardLayout user={auth.user} header="Muelle (Operaciones Marítimas)">
            <Head title="Muelle" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                {/* 1. Registro de Barco */}
                <Link
                    href={route('dock.vessel.create')}
                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                        <Ship className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Barco</h3>
                    <p className="text-sm text-gray-500">
                        Dar de alta nueva operación, asignar cliente y producto.
                    </p>
                </Link>

                {/* 2. Registro de Operadores */}
                <Link
                    href={route('dock.operator.create')}
                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                        <Users className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Operadores</h3>
                    <p className="text-sm text-gray-500">
                        Alta de operadores para el barco activo.
                    </p>
                </Link>

                {/* 3. Impresión de QR */}
                <Link
                    href={route('dock.qr')}
                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300 md:col-span-2 lg:col-span-1"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                        <QrCode className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Impresión de QR</h3>
                    <p className="text-sm text-gray-500">
                        Buscar operador e imprimir tarjeta con código QR.
                    </p>
                </Link>
            </div>

            <div className="max-w-6xl mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-indigo-600" />
                        Operadores Registrados en Muelle
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Nombre del Operador</th>
                                <th className="px-6 py-4">Unidad</th>
                                <th className="px-6 py-4">No. Económico</th>
                                <th className="px-6 py-4">Línea Transportista</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {operators && operators.length > 0 ? (
                                operators.map((op: any) => (
                                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{op.operator_name}</td>
                                        <td className="px-6 py-4">{op.unit_type}</td>
                                        <td className="px-6 py-4">{op.economic_number}</td>
                                        <td className="px-6 py-4">{op.transporter_line}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                        No hay operadores registrados recientemente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
