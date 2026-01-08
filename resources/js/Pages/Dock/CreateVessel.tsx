import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft } from 'lucide-react';

export default function CreateVessel({ auth, products, clients }: { auth: any, products: any[], clients: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        product_id: '',
        client_id: '',
        service_type: 'Importación'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dock/vessel');
    };

    return (
        <DashboardLayout user={auth.user} header="Registro de Barco">
            <Head title="Nuevo Barco" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/dock" className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-indigo-900 px-6 py-4 border-b flex items-center">
                        <Anchor className="w-5 h-5 text-white mr-2" />
                        <h3 className="text-white font-bold">Capture los datos del barco</h3>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-6">
                        {/* Nombre del Barco */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del barco</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                placeholder="Ej. MSC ALEXANDRA"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Producto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                            <select
                                value={data.product_id}
                                onChange={e => setData('product_id', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                            >
                                <option value="">Seleccione un producto...</option>
                                {products.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                        </div>

                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                            <select
                                value={data.client_id}
                                onChange={e => setData('client_id', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clients.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.business_name}</option>
                                ))}
                            </select>
                            {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                        </div>

                        {/* Servicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                            <select
                                value={data.service_type}
                                onChange={e => setData('service_type', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                            >
                                <option value="Importación">Importación</option>
                                <option value="Exportación">Exportación</option>
                                <option value="Cabotaje">Cabotaje</option>
                            </select>
                            {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#4ade80', color: '#ffffff' }}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors uppercase"
                            >
                                {processing ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
