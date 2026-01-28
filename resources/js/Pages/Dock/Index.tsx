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
                                <h3 className="text-xl font-bold text-gray-800 break-words w-full">Archivo de Barcos</h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    {vesselList.length} barcos en el histórico
                                </p>
                            </button>
                        </div>
                    ) : (
                        /* Filters & Active Vessels Table */
                        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setViewMode('menu')}
                                        className="group flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="p-1 rounded-full group-hover:bg-indigo-50 mr-2 transition-colors">
                                            <ArrowLeft className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold">Volver</span>
                                    </button>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center border-l-2 border-gray-200 pl-4">
                                        <Ship className="w-6 h-6 mr-3 text-indigo-600" />
                                        Archivo de Barcos
                                    </h3>
                                </div>

                                {/* Date Filters */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-xs font-bold text-gray-500 uppercase px-2">Filtros</span>
                                        <input
                                            type="date"
                                            className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
                                            value={params.start_date}
                                            onChange={(e) => setParams({ ...params, start_date: e.target.value })}
                                            placeholder="Inicio"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="date"
                                            className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 py-1.5"
                                            value={params.end_date}
                                            onChange={(e) => setParams({ ...params, end_date: e.target.value })}
                                            placeholder="Fin"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm"
                                            title="Filtrar"
                                        >
                                            <Filter className="w-4 h-4" />
                                        </button>
                                        {(params.start_date || params.end_date) && (
                                            <button
                                                onClick={clearFilters}
                                                className="p-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition"
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
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Buque</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ETA</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ETB</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Muelle</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">ETC</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">F. Salida</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Operación</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vesselList && vesselList.length > 0 ? (
                                            vesselList.map((v: any) => (
                                                <tr key={v.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                                {v.vessel_type.substring(0, 2)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-bold text-gray-900">{v.name}</div>
                                                                <div className="text-xs text-gray-500">{v.vessel_type}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{v.eta ? v.eta.substring(0, 10) : '--'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold font-mono">{v.docking_date || '--'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold font-mono text-center">
                                                        {v.dock ? (
                                                            <span className={`px-2 py-1 rounded text-xs text-white ${v.dock === 'ECO' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                                {v.dock}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">--</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{v.etc || '--'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{v.departure_date || '--'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.operation_type === 'Descarga' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                                            {v.operation_type}
                                                        </span>
                                                        {v.operation_type === 'Descarga' && v.product && (
                                                            <div className="text-xs text-gray-500 mt-1 font-medium">
                                                                {v.product.name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {v.isActive ? 'Activo' : 'Archivado'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={route('dock.vessel.edit', v.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                                                            >
                                                                Editar
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('¿Estás seguro de eliminar este barco? Esta acción solo se permitirá si no tiene registros asociados.')) {
                                                                        router.delete(route('dock.destroy', v.id), {
                                                                            preserveScroll: true,
                                                                            onError: (errors: any) => {
                                                                                alert(errors.error || 'Error al eliminar');
                                                                            }
                                                                        });
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                                            >
                                                                Eliminar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('¡ADVERTENCIA CRÍTICA! Esta acción eliminará el barco Y TODOS sus registros asociados (Tickets, Órdenes, Escaneos). ¿Deseas continuar?')) {
                                                                        if (confirm('Confirma por segunda vez: ¿Realmente deseas BORRAR TODO rastro de este barco?')) {
                                                                            router.delete(route('dock.vessel.purge', v.id), {
                                                                                preserveScroll: true,
                                                                                onError: (errors: any) => {
                                                                                    alert(errors.error || 'Error al purgar');
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors font-bold text-xs"
                                                                title="BORRADO FORZADO (Solo para pruebas)"
                                                            >
                                                                PURGAR
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                    <Ship className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-lg font-medium">No se encontraron barcos</p>
                                                    <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
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
                                        <div key={v.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                        {v.vessel_type.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg">{v.name}</h3>
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{v.vessel_type}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${v.operation_type === 'Descarga' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'}`}>
                                                    {v.operation_type}
                                                </span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${v.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {v.isActive ? 'Activo' : 'Archivado'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div>
                                                    <span className="block text-gray-400 text-[10px] uppercase font-bold">ETA</span>
                                                    <span className="font-mono text-gray-700 font-medium">{v.eta ? v.eta.substring(0, 10) : '--'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-[10px] uppercase font-bold">ETB</span>
                                                    <span className="font-mono text-indigo-700 font-bold">{v.docking_date || '--'}</span>
                                                </div>
                                                <div className="col-span-2 border-t pt-2 mt-1">
                                                    <span className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Muelle Asignado</span>
                                                    {v.dock ? (
                                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${v.dock === 'ECO' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                            {v.dock}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">--</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                                {v.operation_type === 'Descarga' && v.product ? (
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {v.product.name} ({v.programmed_tonnage} Ton)
                                                    </span>
                                                ) : <span></span>}

                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('dock.vessel.edit', v.id)}
                                                        className="text-indigo-600 font-bold text-sm hover:underline"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('¿Estás seguro de eliminar este barco?')) {
                                                                router.delete(route('dock.destroy', v.id));
                                                            }
                                                        }}
                                                        className="text-red-600 font-bold text-sm hover:underline"
                                                    >
                                                        Eliminar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('¿BORRAR TODO rastro de este barco? (Tickets, Órdenes, etc)')) {
                                                                router.delete(route('dock.vessel.purge', v.id));
                                                            }
                                                        }}
                                                        className="text-red-800 font-bold text-sm bg-red-100 px-2 py-0.5 rounded"
                                                    >
                                                        PURGAR
                                                    </button>
                                                </div>
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
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                <Pagination links={vessels.links} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout >
    );
}
