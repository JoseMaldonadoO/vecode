import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Plus, Search, FileText, UserPlus, Users, ArrowLeft } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useState, FormEventHandler } from 'react';

interface Client {
    id: number;
    business_name: string;
    rfc: string;
    contact_info: string;
    address?: string;
}

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

export default function Index({ auth, orders, clients }: { auth: any, orders: Order[], clients: Client[] }) {
    const [viewMode, setViewMode] = useState<'menu' | 'report'>('menu');
    const [search, setSearch] = useState('');

    const toggleStatus = (id: string) => {
        router.patch(route('sales.toggle-status', id), {}, {
            preserveScroll: true,
            onError: (errors) => {
                alert('Error al actualizar el estatus: ' + JSON.stringify(errors));
            }
        });
    };

    const filteredOrders = orders.filter(order =>
        order.folio.toLowerCase().includes(search.toLowerCase()) ||
        order.sale_order?.toLowerCase().includes(search.toLowerCase()) ||
        order.client?.business_name.toLowerCase().includes(search.toLowerCase())
    );

    const menuItems = [
        {
            name: 'Generar OV',
            icon: Plus,
            action: () => router.visit(route('sales.create')),
            description: 'Crear nueva orden de venta.',
            color: 'bg-indigo-50 text-indigo-600',
            bg: 'bg-white',
            borderColor: 'border-gray-100 hover:border-indigo-100'
        },
        {
            name: 'Agregar Cliente',
            icon: UserPlus,
            action: () => router.visit(route('clients.create')),
            description: 'Registrar nuevo cliente.',
            color: 'bg-blue-50 text-blue-600',
            bg: 'bg-white',
            borderColor: 'border-gray-100 hover:border-blue-100'
        },
        {
            name: 'Lista de Clientes',
            icon: Users,
            action: () => router.visit(route('clients.index')),
            description: 'Ver directorio de clientes.',
            color: 'bg-purple-50 text-purple-600',
            bg: 'bg-white',
            borderColor: 'border-gray-100 hover:border-purple-100'
        },
        {
            name: 'Reportes OV',
            icon: FileText,
            action: () => setViewMode('report'),
            description: 'Ver historial de órdenes de venta.',
            color: 'bg-emerald-50 text-emerald-600',
            bg: 'bg-white',
            borderColor: 'border-gray-100 hover:border-emerald-100'
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Comercialización / Órdenes">
            <Head title="Ventas" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {viewMode === 'menu' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className={`group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl ${item.color.includes('indigo') ? 'hover:border-indigo-500' : item.color.includes('blue') ? 'hover:border-blue-500' : item.color.includes('purple') ? 'hover:border-purple-500' : 'hover:border-emerald-500'}`}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 ${item.color}`}>
                                        <item.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 break-words w-full">{item.name}</h3>
                                    <p className="text-gray-500 mt-2 text-sm">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Header Section */}
                            <div className="md:flex md:items-center md:justify-between mb-6">
                                <div className="flex-1 min-w-0">
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setViewMode('menu')}
                                            className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            Volver al Menú de Comercialización
                                        </button>
                                    </div>
                                    <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center">
                                        <FileText className="mr-3 h-8 w-8 text-indigo-600" />
                                        Reporte de Órdenes de Venta (OV)
                                    </h2>
                                </div>
                            </div>

                            {/* Filters & Actions */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                                <div className="relative w-full md:w-96">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por folio, cliente..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full">
                                    {filteredOrders.length} Registros
                                </span>
                            </div>

                            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Folio</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Orden Venta (OV)</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Cliente</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estatus</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fecha</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                        <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                                        <p className="text-lg font-medium">No hay órdenes registradas</p>
                                                        <p className="text-sm">Comienza creando una nueva orden de venta.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                                                            {order.folio}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 underline decoration-indigo-200">
                                                            {order.sale_order || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {order.client?.business_name}
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            <Link href={route('sales.show', order.id)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">Ver</Link>

                                                            {order.status === 'created' && (
                                                                <>
                                                                    <Link
                                                                        href={route('sales.edit', order.id)}
                                                                        className="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors"
                                                                    >
                                                                        Editar
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => toggleStatus(order.id)}
                                                                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                                    >
                                                                        Cerrar
                                                                    </button>
                                                                </>
                                                            )}
                                                            {order.status === 'closed' && (
                                                                <button
                                                                    onClick={() => toggleStatus(order.id)}
                                                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors"
                                                                >
                                                                    Abrir
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}




        </DashboardLayout >
    );
}
