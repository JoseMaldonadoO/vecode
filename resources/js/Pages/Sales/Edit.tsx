import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

export default function Edit({ auth, order, clients, products }: { auth: any, order: any, clients: any[], products: any[] }) {

    // Pre-fill form with existing order data
    const { data, setData, put, processing, errors } = useForm({
        folio: order.folio,
        sale_order: order.sale_order,
        client_id: order.client_id,
        product_id: order.product_id || '',
        quantity: order.total_quantity || '',
        destination: order.destination || ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.update', order.id));
    };

    return (
        <DashboardLayout user={auth.user} header="Editar Orden de Venta">
            <Head title="Editar Orden" />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href={route('sales.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Cancelar y volver
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Modificar Orden {order.folio}</h2>
                        <p className="text-sm text-gray-500">Actualice los datos necesarios. Solo disponible para órdenes en estatus 'CREADO'.</p>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Folio Interno */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Folio Interno</label>
                                <input
                                    type="text"
                                    value={data.folio}
                                    onChange={e => setData('folio', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.folio && <p className="text-red-500 text-xs mt-1">{errors.folio}</p>}
                            </div>

                            {/* Orden de Venta (Cliente) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ref. Orden Venta</label>
                                <input
                                    type="text"
                                    value={data.sale_order}
                                    onChange={e => setData('sale_order', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.sale_order && <p className="text-red-500 text-xs mt-1">{errors.sale_order}</p>}
                            </div>

                            {/* Cliente */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                <select
                                    value={data.client_id}
                                    onChange={e => setData('client_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Seleccione un cliente...</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.business_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                            </div>

                            {/* Producto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Producto</label>
                                <select
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Seleccione un producto...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                            </div>

                            {/* Cantidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad Solicitada (Ton)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.quantity}
                                    onChange={e => setData('quantity', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="inline-flex items-center justify-center rounded-md border border-transparent !bg-black px-4 py-2 text-sm font-medium !text-white shadow-sm hover:!bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
