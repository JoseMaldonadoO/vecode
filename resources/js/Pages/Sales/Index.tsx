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
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isClientListModalOpen, setIsClientListModalOpen] = useState(false);

    // Inline Edit State
    const [editingClient, setEditingClient] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        business_name: '',
        rfc: '',
        contact_info: '',
        address: ''
    });

    const startEdit = (client: Client) => {
        setEditingClient(client.id);
        setEditForm({
            business_name: client.business_name,
            rfc: client.rfc,
            contact_info: client.contact_info,
            address: client.address || ''
        });
    };

    const cancelEdit = () => {
        setEditingClient(null);
        setEditForm({ business_name: '', rfc: '', contact_info: '', address: '' });
    };

    const saveEdit = (id: number) => {
        router.put(route('clients.update', id), editForm, {
            onSuccess: () => {
                setEditingClient(null);
            },
            preserveScroll: true
        });
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        business_name: '',
        rfc: '',
        address: '',
        contact_info: '',
    });

    const submitClient: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => {
                setIsClientModalOpen(false);
                reset();
            },
        });
    };

    const toggleStatus = (id: string) => {
        router.patch(route('sales.toggle-status', id), {}, {
            preserveScroll: true,
            onError: (errors) => {
                alert('Error al actualizar el estatus: ' + JSON.stringify(errors));
            }
        });
    };

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
            action: () => setIsClientModalOpen(true),
            description: 'Registrar nuevo cliente.',
            color: 'bg-blue-50 text-blue-600',
            bg: 'bg-white',
            borderColor: 'border-gray-100 hover:border-blue-100'
        },
        {
            name: 'Lista de Clientes',
            icon: Users,
            action: () => setIsClientListModalOpen(true),
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                            <div className="mb-6 flex items-center justify-between">
                                <button
                                    onClick={() => setViewMode('menu')}
                                    className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Volver al Menú
                                </button>
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por folio, cliente..."
                                        className="w-full rounded-md border border-gray-300 pl-8 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                                        Reporte de Órdenes de Venta (OV)
                                    </h3>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                                        {orders.length} Registros
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
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
                                                            <Link href={route('sales.show', order.id)} className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50">Ver</Link>

                                                            {order.status === 'created' && (
                                                                <>
                                                                    <Link
                                                                        href={route('sales.edit', order.id)}
                                                                        className="text-amber-600 hover:text-amber-900 border border-amber-200 px-3 py-1 rounded hover:bg-amber-50"
                                                                    >
                                                                        Editar
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => toggleStatus(order.id)}
                                                                        className="text-red-600 hover:text-red-900 border border-red-200 px-3 py-1 rounded hover:bg-red-50"
                                                                    >
                                                                        Cerrar
                                                                    </button>
                                                                </>
                                                            )}
                                                            {order.status === 'closed' && (
                                                                <button
                                                                    onClick={() => toggleStatus(order.id)}
                                                                    className="text-green-600 hover:text-green-900 border border-green-200 px-3 py-1 rounded hover:bg-green-50"
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

            {/* Client List Modal */}
            <Modal show={isClientListModalOpen} onClose={() => setIsClientListModalOpen(false)} maxWidth="6xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Directorio de Clientes</h2>
                        <button onClick={() => setIsClientListModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-4 border rounded-md max-h-[60vh] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre / Razón Social</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay clientes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            {editingClient === client.id ? (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <input
                                                            type="text"
                                                            value={editForm.business_name}
                                                            onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                                                            className="w-full rounded border-gray-300 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <input
                                                            type="text"
                                                            value={editForm.rfc}
                                                            onChange={(e) => setEditForm({ ...editForm, rfc: e.target.value })}
                                                            className="w-full rounded border-gray-300 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <input
                                                            type="text"
                                                            value={editForm.contact_info}
                                                            onChange={(e) => setEditForm({ ...editForm, contact_info: e.target.value })}
                                                            className="w-full rounded border-gray-300 text-sm"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => saveEdit(client.id)}
                                                            className="text-green-600 hover:text-green-900 font-bold"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="text-gray-600 hover:text-gray-900"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.business_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.rfc}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contact_info || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => startEdit(client)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsClientListModalOpen(false)}>
                            Cerrar
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* Add Client Modal */}
            <Modal show={isClientModalOpen} onClose={() => setIsClientModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Agregar Nuevo Cliente</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Ingrese los detalles del cliente para registrarlo en el sistema.
                    </p>

                    <form onSubmit={submitClient} className="mt-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="rfc" value="RFC" />
                            <TextInput
                                id="rfc"
                                value={data.rfc}
                                onChange={(e) => setData('rfc', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="RFC del cliente"
                            />
                            <InputError message={errors.rfc} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="business_name" value="Nombre / Razón Social" />
                            <TextInput
                                id="business_name"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Nombre completo o razón social"
                            />
                            <InputError message={errors.business_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="address" value="Dirección" />
                            <TextInput
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Calle, número, colonia, CP..."
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="contact_info" value="Contacto" />
                            <TextInput
                                id="contact_info"
                                value={data.contact_info}
                                onChange={(e) => setData('contact_info', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="Teléfono, Email o Nombre de contacto"
                            />
                            <InputError message={errors.contact_info} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setIsClientModalOpen(false)}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                Guardar Cliente
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
