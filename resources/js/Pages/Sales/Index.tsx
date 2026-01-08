import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Search, FileText } from 'lucide-react';

interface Order {
    id: string;
    folio: string;
    sale_order: string;
    client: {
        business_name: string;
    };
    status: string;
    created_at: string;
}

export default function Index({ auth, orders }: { auth: any, orders: Order[] }) {
    return (
        <DashboardLayout user={auth.user} header="Comercialización / Órdenes">
            <Head title="Ventas" />

            <div className="flex items-center justify-between mb-6">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por folio, cliente..."
                        className="w-full rounded-md border border-gray-300 pl-8 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <Link
                    href="/sales/create"
                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                    className="inline-flex items-center justify-center rounded-md !bg-black px-4 py-2 text-sm font-medium text-white shadow hover:!bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                </Link>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden Venta (OV)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <p className="text-lg font-medium">No hay órdenes registradas</p>
                                    <p className="text-sm">Comienza creando una nueva orden de venta.</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                        {order.folio}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.sale_order || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.client?.business_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                                            ${order.status === 'created' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                            ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                        `}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Link href={`/sales/${order.id}`} className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">Ver</Link>

                                        {order.status === 'created' && (
                                            <>
                                                <Link
                                                    href={`/sales/${order.id}/edit`}
                                                    className="text-amber-600 hover:text-amber-900 border border-amber-200 px-3 py-1 rounded hover:bg-amber-50"
                                                >
                                                    Editar
                                                </Link>
                                                <Link
                                                    href={`/sales/${order.id}`}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() => confirm('¿Estás seguro de cancelar esta orden? Esta acción es irreversible.')}
                                                    className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                                                >
                                                    Cancelar
                                                </Link>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
