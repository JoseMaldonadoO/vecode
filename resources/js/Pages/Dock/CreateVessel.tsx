import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft } from 'lucide-react';

export default function CreateVessel({ auth, products, clients }: { auth: any, products: any[], clients: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        product_id: '',
        client_id: '',
        docking_date: '',
        docking_time: '',
        origin: '',
        sub_origin: '',
        destination: '',
        agency: '',
        programmed_tonnage: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dock.vessel.store'));
    };

    return (
        <DashboardLayout user={auth.user} header="Registro de Barco">
            <Head title="Nuevo Barco" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href={route('dock.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-indigo-900 px-6 py-4 border-b flex items-center">
                        <Anchor className="w-5 h-5 text-white mr-2" />
                        <h3 className="text-white font-bold">Registro de barco</h3>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-6">

                        {/* Nombre del Barco */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del barco</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                placeholder="Ej. MSC ALEXANDRA"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Fecha y Hora de Atraque */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de atraque</label>
                                <input
                                    type="date"
                                    value={data.docking_date}
                                    onChange={e => setData('docking_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.docking_date && <p className="text-red-500 text-xs mt-1">{errors.docking_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Hora de atraque</label>
                                <input
                                    type="time"
                                    value={data.docking_time}
                                    onChange={e => setData('docking_time', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.docking_time && <p className="text-red-500 text-xs mt-1">{errors.docking_time}</p>}
                            </div>
                        </div>

                        {/* Origen y Sub-origen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Origen</label>
                                <input
                                    type="text"
                                    value={data.origin}
                                    onChange={e => setData('origin', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    placeholder="Puerto de Origen"
                                />
                                {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Sub-origen <span className="text-xs font-normal text-gray-500 ml-1">(Opcional)</span></label>
                                <input
                                    type="text"
                                    value={data.sub_origin}
                                    onChange={e => setData('sub_origin', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    placeholder="Muelle previo (si aplica)"
                                />
                                {errors.sub_origin && <p className="text-red-500 text-xs mt-1">{errors.sub_origin}</p>}
                            </div>
                        </div>

                        {/* Destino */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Destino</label>
                            <input
                                type="text"
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                placeholder="Puerto de Destino"
                            />
                            {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                        </div>

                        {/* Cliente y Producto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
                                <select
                                    value={data.client_id}
                                    onChange={e => setData('client_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                >
                                    <option value="">Seleccione un cliente...</option>
                                    {clients.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.business_name}</option>
                                    ))}
                                </select>
                                {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Producto</label>
                                <select
                                    value={data.product_id}
                                    onChange={e => setData('product_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                >
                                    <option value="">Seleccione un producto...</option>
                                    {products.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                            </div>
                        </div>

                        {/* Agencia y Toneladas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Agencia</label>
                                <input
                                    type="text"
                                    value={data.agency}
                                    onChange={e => setData('agency', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    placeholder="Agencia Naviera"
                                />
                                {errors.agency && <p className="text-red-500 text-xs mt-1">{errors.agency}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Toneladas programadas</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.programmed_tonnage}
                                    onChange={e => setData('programmed_tonnage', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    placeholder="0.00"
                                />
                                {errors.programmed_tonnage && <p className="text-red-500 text-xs mt-1">{errors.programmed_tonnage}</p>}
                            </div>
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
