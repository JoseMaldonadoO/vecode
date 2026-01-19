import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Users, Ship, Filter, X, List, ArrowLeft } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { useState } from 'react';
import { pickBy } from 'lodash';

export default function Index({ auth, vessels, filters }: { auth: any, vessels: any, filters: any }) {

    const [params, setParams] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });
    const [viewMode, setViewMode] = useState<'menu' | 'table'>('menu');

    const handleSearch = () => {
        router.get(route('dock.index'), pickBy(params), { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setParams({ start_date: '', end_date: '' });
        router.get(route('dock.index'), {}, { preserveState: true, preserveScroll: true });
    };

    // Vessels is now a Paginator object, so the array is in vessels.data
    const vesselList = vessels?.data || [];

    return (
        <DashboardLayout user={auth.user} header="Muelle (Operaciones Marítimas)">
            <Head title="Muelle" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* DEBUG BANNER */}
                    <div className="bg-red-600 text-white p-4 text-center font-bold text-xl rounded-lg">
                        DEBUG: V3 LOADED - IF YOU SEE THIS, UPDATE WORKED
                    </div>

                    {viewMode === 'menu' ? (
                        /* Action Cards Menu */
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

                            <Link
                                href={route('dock.status')}
                                className="group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:border-blue-500"
                            >
                                <div className="relative w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 text-blue-600">
                                    <Ship className="w-10 h-10" />
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 break-words w-full">Status Muelle</h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    Dashboard en vivo de operación marítima (ECO/WHISKY).
                                </p>
                            </Link>

                            <button
                                onClick={() => setViewMode('table')}
                                className="group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:border-teal-500"
                            >
                                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 text-teal-600">
                                    <List className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 break-words w-full">Barcos Activos</h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    {vesselList.length} barcos registrados
                                </p>
                            </button>
                        </div>
                    ) : (
                        /* Filters & Active Vessels Table */
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setViewMode('menu')}
                                        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <ArrowLeft className="w-6 h-6 mr-1" />
                                        <span className="font-medium">Volver</span>
                                    </button>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center border-l-2 border-gray-200 pl-4">
                                        <Ship className="w-5 h-5 mr-2 text-indigo-600" />
                                        Barcos Activos
                                    </h3>
                                </div>

                                {/* Date Filters */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                        <span className="text-xs font-medium text-gray-500 uppercase">Filtros:</span>
                                        <input
                                            type="date"
                                            className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                            value={params.start_date}
                                            onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                                            placeholder="Inicio"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="date"
                                            className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                            value={params.end_date}
                                            onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                                            placeholder="Fin"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                            title="Filtrar"
                                        >
                                            <Filter className="w-4 h-4" />
                                        </button>
                                        {(params.start_date || params.end_date) && (
                                            <button
                                                onClick={clearFilters}
                                                className="p-1.5 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition"
                                                title="Limpiar"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Responsive Content: Table for Desktop, Cards for Mobile */}

                            {/* Desktop View (Table) */}
                            <div className="hidden lg:block overflow-x-auto">
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
                                        {vesselList && vesselList.length > 0 ? (
                                            vesselList.map((v: any) => (
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
                                                    No hay barcos registrados en este periodo.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View (Cards) */}
                            <div className="lg:hidden p-4 space-y-4">
                                {vesselList && vesselList.length > 0 ? (
                                    vesselList.map((v: any) => (
                                        <div key={v.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider block mb-1">{v.vessel_type}</span>
                                                    <h3 className="font-bold text-gray-900 text-lg flex items-center pr-2">
                                                        <Ship className="w-4 h-4 mr-2 text-gray-400" />
                                                        {v.name}
                                                    </h3>
                                                </div>
                                                <Link
                                                    href={route('dock.vessel.edit', v.id)}
                                                    className="text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-md"
                                                >
                                                    Editar
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-200 pt-3">
                                                <div>
                                                    <span className="block text-gray-500 text-xs uppercase">ETA</span>
                                                    <span className="font-medium">{v.eta}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500 text-xs uppercase">ETB</span>
                                                    <span className="font-medium">{v.docking_date}</span>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-gray-500 uppercase font-bold">Operación</span>
                                                    <span className={`text-sm font-bold ${v.operation_type === 'Descarga' ? 'text-indigo-600' : 'text-gray-700'}`}>
                                                        {v.operation_type}
                                                    </span>
                                                </div>
                                                {v.operation_type === 'Descarga' && v.product && (
                                                    <div className="text-xs text-gray-600">
                                                        {v.product.name} • <span className="font-mono">{v.programmed_tonnage} Ton</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        No hay barcos registrados.
                                    </div>
                                )}
                            </div>

                            {/* Pagination Component */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <Pagination links={vessels.links} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout >
    );
}
