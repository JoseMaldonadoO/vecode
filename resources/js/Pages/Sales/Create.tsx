import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Client { id: number; business_name: string; }
interface Product { id: number; name: string; code: string; default_packaging: string; }

export default function Create({ auth, clients, products }: { auth: any, clients: Client[], products: Product[] }) {
    const { data, setData, post, processing, errors } = useForm({
        folio: `OV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // Auto-generated for demo
        sale_order: '',
        client_id: '',
        product_id: '',
        quantity: '',
        packaging: 'Granel',
        destination: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/sales');
    };

    return (
        <DashboardLayout user={auth.user} header="Nueva Orden de Venta">
            <Head title="Crear Orden" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/sales" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={submit} className="space-y-6">

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Folio Interno (Auto)</label>
                                <input
                                    type="text"
                                    disabled
                                    value={data.folio}
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ref. Orden Venta (OV) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.sale_order}
                                    onChange={e => setData('sale_order', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Ej. OV-9988"
                                    required
                                />
                                {errors.sale_order && <div className="text-red-500 text-xs mt-1">{errors.sale_order}</div>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cliente <span className="text-red-500">*</span></label>
                            <select
                                value={data.client_id}
                                onChange={e => setData('client_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.business_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Producto <span className="text-red-500">*</span></label>
                                <select
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccione producto...</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>{product.code} - {product.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad (Sacos/Toneladas) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    value={data.quantity}
                                    onChange={e => setData('quantity', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destino / Observaciones</label>
                            <textarea
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="inline-flex items-center justify-center rounded-md border border-transparent !bg-black px-4 py-2 text-sm font-medium !text-white shadow-sm hover:!bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Orden
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
