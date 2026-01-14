import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, Ship } from 'lucide-react';

export default function Index({ auth, vessels = [] }: { auth: any, vessels?: any[] }) {

    return (
        <DashboardLayout user={auth.user} header="Muelle (Operaciones Marítimas)">
            <Head title="Muelle" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link
                            href={route('dock.vessel.create')}
                            className="group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:border-indigo-500"
                        >
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 text-indigo-600">
                                <Ship className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 break-words w-full">Registro de Barco</h3>
                            <p className="text-gray-500 mt-2 text-sm">
                                Dar de alta nueva operación, asignar cliente y producto.
                            </p>
                        </Link>
                    </div>

                    {/* Active Vessels Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Ship className="w-5 h-5 mr-2 text-indigo-600" />
                                Barcos Activos
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 whitespace-nowrap">Buque</th>
                                        <th className="px-6 py-4 whitespace-nowrap">ETA</th>
                                        <th className="px-6 py-4 whitespace-nowrap">ETB</th>
                                        <th className="px-6 py-4 whitespace-nowrap">ETC</th>
                                        <th className="px-6 py-4 whitespace-nowrap">F. Salida</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Operación</th>
                                        <th className="px-6 py-4 text-center whitespace-nowrap">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vessels && vessels.length > 0 ? (
                                        vessels.map((v: any) => (
                                            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{v.name} ({v.vessel_type})</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.eta}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.docking_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.etc || '--'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{v.departure_date || '--'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold ${v.operation_type === 'Descarga' ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                            {v.operation_type}
                                                        </span>
                                                        {v.operation_type === 'Descarga' && v.product && (
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                {v.product.name} ({v.programmed_tonnage} Ton)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <Link
                                                        href={route('dock.vessel.edit', v.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold"
                                                    >
                                                        Editar
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                                                No hay barcos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>


                </div>
            </div>
        </DashboardLayout >
    );
}
