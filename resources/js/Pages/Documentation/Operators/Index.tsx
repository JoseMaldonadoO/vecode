import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react'; // ensure router is imported if you use it, or use Inertia.get
import { User, Truck, FileText, Search, Plus, Edit, ArrowLeft, ArrowRight, ArrowLeftCircle } from 'lucide-react';
import { useState } from 'react';
// @ts-ignore
import { pickBy } from 'lodash';

interface Operator {
    id: number;
    operator_name: string;
    transporter_line: string;
    unit_type: string;
    economic_number: string;
    tractor_plate: string;
    vessel?: {
        name: string;
    };
}

interface PageProps {
    operators: {
        data: Operator[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
    };
    auth: any;
}

export default function Index({ auth, operators, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('documentation.operators.index'), pickBy({ search }), { preserveState: true });
    };

    return (
        <DashboardLayout user={auth.user} header="Lista de Operadores">
            <Head title="Operadores" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <Link href={route('documentation.dock')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a Documentación (Muelle)
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center">
                            <User className="mr-3 h-8 w-8 text-indigo-600" />
                            Operadores Registrados
                        </h2>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Buscar por nombre, ID, línea..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <Link
                        href={route('documentation.operators.create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Nuevo Operador
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#1e1b4b]">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Operador</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Línea Trans.</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Unidad</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Barco</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {operators.data.length > 0 ? (
                                    operators.data.map((operator) => (
                                        <tr key={operator.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">#{operator.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                        {operator.operator_name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{operator.operator_name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{operator.transporter_line}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{operator.unit_type}</div>
                                                <div className="text-xs text-gray-500">{operator.economic_number} - {operator.tractor_plate}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {operator.vessel ? operator.vessel.name : <span className="text-red-400 italic">Sin Asignar</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={route('documentation.operators.edit', operator.id)}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 mr-1.5" />
                                                    Editar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <User className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No se encontraron operadores</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {operators.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 md:flex md:items-center md:justify-between">
                            <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                Mostrando <span className="font-medium">{operators.from}</span> a <span className="font-medium">{operators.to}</span> de <span className="font-medium">{operators.total}</span> resultados
                            </div>
                            <div className="flex justify-center space-x-1">
                                {operators.links.map((link, key) => (
                                    link.url ? (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${link.active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={key}
                                            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
