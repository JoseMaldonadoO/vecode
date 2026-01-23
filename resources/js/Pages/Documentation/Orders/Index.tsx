import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Search, ArrowLeft, Filter } from 'lucide-react';
import { useState } from 'react';
// @ts-ignore
import { pickBy } from 'lodash';

interface Order {
    id: string;
    folio: string;
    sale_order: string;
    operation_type: 'scale' | 'burreo';
    client: {
        business_name: string;
    };
    vessel?: {
        name: string;
    };
    status: string;
    created_at: string;
}

interface PageProps {
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
    };
    auth: any;
}

export default function Index({ auth, orders, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = (newSearch?: string, newType?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const t = newType !== undefined ? newType : type;

        router.get(route('documentation.orders.index'), pickBy({ search: s, type: t }), { preserveState: true });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setType(value);
        handleSearch(search, value);
    };

    return (
        <DashboardLayout user={auth.user} header="Reporte de Órdenes de Embarque">
            <Head title="Reportes OB" />

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
                            <FileText className="mr-3 h-8 w-8 text-indigo-600" />
                            Reporte de Órdenes de Embarque (OB)
                        </h2>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Buscar por folio, cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={type}
                            onChange={handleTypeChange}
                            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="scale">Descarga Báscula</option>
                            <option value="burreo">Descarga Burreo</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Folio</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Orden</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cliente / Barco</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estatus</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                                                {order.folio}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 underline decoration-indigo-200">
                                                {order.sale_order || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.operation_type === 'burreo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.operation_type === 'burreo' ? 'BURREO' : 'BÁSCULA'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{order.client?.business_name}</div>
                                                <div className="text-xs text-indigo-500 font-semibold">{order.vessel?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                                            ${order.status === 'created' ? 'bg-blue-100 text-blue-800' : ''}
                                                            ${order.status === 'closed' ? 'bg-red-100 text-red-800' : ''}
                                                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                                        `}>
                                                    {order.status === 'created' ? 'ABIERTA' :
                                                        order.status === 'closed' ? 'CERRADO' :
                                                            order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('sales.show', { sale: order.id, module: 'documentation' })} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No se encontraron órdenes</p>
                                            <p className="text-sm">Intenta ajustar los filtros o verifica que existan descargas registradas.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 md:flex md:items-center md:justify-between">
                            <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                Mostrando <span className="font-medium">{orders.from}</span> a <span className="font-medium">{orders.to}</span> de <span className="font-medium">{orders.total}</span> resultados
                            </div>
                            <div className="flex justify-center space-x-1">
                                {orders.links.map((link, key) => (
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
