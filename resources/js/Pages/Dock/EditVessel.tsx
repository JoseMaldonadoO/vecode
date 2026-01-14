import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function EditVessel({ auth, products, vessel }: { auth: any, products: any[], vessel: any }) {
    const { data, setData, put, processing, errors } = useForm({
        vessel_type: vessel.vessel_type || 'M/V',
        name: vessel.name || '',
        eta: vessel.eta || '',
        docking_date: vessel.docking_date || '',
        docking_time: vessel.docking_time || '',
        operation_type: vessel.operation_type || 'Resguardo',
        product_id: vessel.product_id || '',
        programmed_tonnage: vessel.programmed_tonnage || '',
        stay_days: vessel.stay_days || '',
        etc: vessel.etc || '',
        departure_date: vessel.departure_date || '',
        observations: vessel.observations || ''
    });

    // Reset product/tons if opertion type changes from Descarga
    useEffect(() => {
        if (data.operation_type !== 'Descarga') {
            setData(data => ({ ...data, product_id: '', programmed_tonnage: '' }));
        }
    }, [data.operation_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dock.vessel.update', vessel.id));
    };

    return (
        <DashboardLayout user={auth.user} header="Editar Barco">
            <Head title="Editar Barco" />

            <div className="max-w-4xl mx-auto pb-12">
                <div className="mb-6">
                    <Link href={route('dock.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-indigo-900 px-6 py-4 border-b flex items-center">
                        <Anchor className="w-5 h-5 text-white mr-2" />
                        <h3 className="text-white font-bold">Editar datos del barco</h3>
                    </div>

                    {/* Global Error Banner */}
                    {(errors as any).error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 mx-6 mt-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        {(errors as any).error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="p-8 space-y-6">

                        {/* Row 1: Tipo y Nombre */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Buque</label>
                                <select
                                    value={data.vessel_type}
                                    onChange={e => setData('vessel_type', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                >
                                    <option value="M/V">M/V</option>
                                    <option value="B/T">B/T</option>
                                </select>
                                {errors.vessel_type && <p className="text-red-500 text-xs mt-1">{errors.vessel_type}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Buque</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    placeholder="Ej. MSC ALEXANDRA"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        {/* Row 2: ETA, Buque Atraco (ETB), Hora */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ETA (Estimado de Arribo)</label>
                                <input
                                    type="date"
                                    value={data.eta}
                                    onChange={e => setData('eta', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.eta && <p className="text-red-500 text-xs mt-1">{errors.eta}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Buque Atraco (ETB)</label>
                                <input
                                    type="date"
                                    value={data.docking_date}
                                    onChange={e => setData('docking_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.docking_date && <p className="text-red-500 text-xs mt-1">{errors.docking_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Hora</label>
                                <input
                                    type="time"
                                    value={data.docking_time}
                                    onChange={e => setData('docking_time', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.docking_time && <p className="text-red-500 text-xs mt-1">{errors.docking_time}</p>}
                            </div>
                        </div>

                        {/* Row 3: Tipo Operacion and Conditionals */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Operación</label>
                                <select
                                    value={data.operation_type}
                                    onChange={e => setData('operation_type', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                >
                                    <option value="Resguardo">Resguardo</option>
                                    <option value="Descarga">Descarga</option>
                                </select>
                                {errors.operation_type && <p className="text-red-500 text-xs mt-1">{errors.operation_type}</p>}
                            </div>

                            {data.operation_type === 'Descarga' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Producto</label>
                                        <select
                                            value={data.product_id}
                                            onChange={e => setData('product_id', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        >
                                            <option value="">Seleccione...</option>
                                            {products.map((p: any) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Toneladas</label>
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
                                </>
                            )}
                        </div>

                        {/* Row 4: Dias Estadia, ETC, Fecha Salida */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Días de Estadía</label>
                                <input
                                    type="number"
                                    value={data.stay_days}
                                    onChange={e => setData('stay_days', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                {errors.stay_days && <p className="text-red-500 text-xs mt-1">{errors.stay_days}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ETC (Estimado Finalización)</label>
                                <input
                                    type="date"
                                    value={data.etc}
                                    onChange={e => setData('etc', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">Opcional</p>
                                    <button
                                        type="button"
                                        onClick={() => setData('etc', new Date().toISOString().split('T')[0])}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                        Hoy
                                    </button>
                                </div>
                                {errors.etc && <p className="text-red-500 text-xs mt-1">{errors.etc}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Salida</label>
                                <input
                                    type="date"
                                    value={data.departure_date}
                                    onChange={e => setData('departure_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 bg-gray-50"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">Opcional. Llenar al zarpe.</p>
                                    <button
                                        type="button"
                                        onClick={() => setData('departure_date', new Date().toISOString().split('T')[0])}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                        Hoy
                                    </button>
                                </div>
                                {errors.departure_date && <p className="text-red-500 text-xs mt-1">{errors.departure_date}</p>}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
                            <textarea
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                rows={3}
                            ></textarea>
                            {errors.observations && <p className="text-red-500 text-xs mt-1">{errors.observations}</p>}
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#2563EB', color: '#ffffff' }}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors uppercase"
                            >
                                {processing ? 'Guardando cambios...' : 'Actualizar Barco'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
