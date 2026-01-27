import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Edit({ auth, order, clients, products, context_module }: { auth: any, order: any, clients: any[], products: any[], context_module?: string }) {

    const isSalesReport = context_module === 'sales_report';
    const backLink = isSalesReport ? route('sales.index', { view: 'report' }) : route('sales.index');

    // Pre-fill form with existing order data
    const { data, setData, put, processing, errors } = useForm({
        folio: order.folio,
        sale_order: order.sale_order,
        client_id: order.client_id,
        product_id: order.product_id || '',
        quantity: order.total_quantity || '',
        destination: order.destination || '',
        sale_conditions: order.sale_conditions || '',
        delivery_conditions: order.delivery_conditions || ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('sales.update', order.id));
    };

    return (
        <DashboardLayout user={auth.user} header={`Editar Orden: ${order.folio}`}>
            <Head title="Editar Orden" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-6 flex justify-between items-center">
                    <Link href={backLink} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Cancelar y volver
                    </Link>
                </div>

                {/* Form Container */}
                <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-[21.5cm] mx-auto">
                    <div className="p-8 md:p-12 text-black font-sans">
                        {/* Header with Folio/Order Info */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-gray-100">
                            <div className="w-1/2">
                                <div className="mb-4">
                                    <img src="/img/Proagro2.png" alt="Logo Proagroindustria" className="h-16 object-contain" />
                                </div>
                                <div className="text-sm text-gray-800 space-y-0.5">
                                    <p className="font-extrabold text-blue-900 text-base">Proagroindustria S.A. de C.V.</p>
                                    <p>Edición de Documento Interno</p>
                                </div>
                            </div>

                            <div className="w-1/2 flex flex-col items-end">
                                <div className="w-64 border-2 border-indigo-900 rounded-lg overflow-hidden shadow-sm bg-indigo-50/30">
                                    <div className="bg-indigo-900 text-white text-center font-bold py-2 text-sm uppercase tracking-wider">
                                        Datos de Control
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-tighter mb-1">Folio (Internal)</label>
                                            <input
                                                type="text"
                                                value={data.folio}
                                                onChange={e => setData('folio', e.target.value)}
                                                className="w-full text-sm font-black text-indigo-700 bg-white border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.folio && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.folio}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-tighter mb-1">O. Compra (Ref)</label>
                                            <input
                                                type="text"
                                                value={data.sale_order}
                                                onChange={e => setData('sale_order', e.target.value)}
                                                className="w-full text-sm font-bold bg-white border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            {errors.sale_order && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.sale_order}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Client Sector */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold px-4 py-1.5 text-xs uppercase tracking-widest rounded-t-lg">
                                Selección del Cliente y Condiciones
                            </div>
                            <div className="border-2 border-t-0 border-gray-100 rounded-b-lg p-6 bg-gray-50/30 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cliente Destinatario</label>
                                        <select
                                            value={data.client_id}
                                            onChange={e => setData('client_id', e.target.value)}
                                            className="w-full bg-white border-gray-200 rounded-lg text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 h-11"
                                        >
                                            <option value="">Seleccione un cliente...</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.business_name} ({client.rfc})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.client_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.client_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Condiciones de Venta</label>
                                        <input
                                            type="text"
                                            value={data.sale_conditions}
                                            onChange={e => setData('sale_conditions', e.target.value)}
                                            placeholder="Ej. CONTADO, 30 DÍAS"
                                            className="w-full bg-white border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Condiciones de Entrega</label>
                                        <input
                                            type="text"
                                            value={data.delivery_conditions}
                                            onChange={e => setData('delivery_conditions', e.target.value)}
                                            placeholder="Ej. LAB PLANTA, DESTINO"
                                            className="w-full bg-white border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="mb-8">
                            <div className="bg-indigo-900 text-white font-bold px-4 py-1.5 text-xs uppercase tracking-widest rounded-t-lg">
                                Producto y Volumen
                            </div>
                            <div className="border-2 border-t-0 border-gray-100 rounded-b-lg p-6 bg-indigo-50/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción del Producto</label>
                                        <select
                                            value={data.product_id}
                                            onChange={e => setData('product_id', e.target.value)}
                                            className="w-full bg-white border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 h-11"
                                        >
                                            <option value="">Seleccione un producto...</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.code} - {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.product_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.product_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Toneladas Solicitadas (TM)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={data.quantity}
                                                onChange={e => setData('quantity', e.target.value)}
                                                className="w-full bg-white border-gray-200 rounded-lg text-lg font-black text-indigo-700 focus:ring-indigo-500 focus:border-indigo-500 pr-12 h-11"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 font-bold text-xs uppercase">
                                                TM
                                            </div>
                                        </div>
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Observations / Destination */}
                        <div className="mb-12">
                            <div className="bg-gray-100 text-gray-700 font-bold px-4 py-1.5 text-xs uppercase tracking-widest rounded-t-lg">
                                Observaciones Adicionales / Destino
                            </div>
                            <div className="border-2 border-t-0 border-gray-100 rounded-b-lg p-2 bg-white">
                                <textarea
                                    value={data.destination}
                                    onChange={e => setData('destination', e.target.value)}
                                    rows={4}
                                    placeholder="Ingrese destino detallado u observaciones relevantes para la carga..."
                                    className="w-full border-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 resize-none"
                                />
                            </div>
                        </div>

                        {/* Status Guard Info */}
                        <div className="mb-8 p-4 bg-amber-50 rounded-xl border-2 border-amber-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-800 uppercase tracking-tight">Aviso de Restricción</h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Esta orden de venta podrá ser editada mientras mantenga el estatus <span className="font-bold">ABIERTA</span>. Una vez generados embarques o cerrada la orden, cualquier modificación deberá ser autorizada por dirección.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-black rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                            >
                                <Save className="w-5 h-5 mr-3" />
                                Guardar Cambios en la Orden
                            </button>
                            <Link
                                href={backLink}
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-base font-bold rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-all"
                            >
                                Cancelar Cambios
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
